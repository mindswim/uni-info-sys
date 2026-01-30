<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\CourseSection;
use App\Models\DiscussionTopic;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscussionForumController extends Controller
{
    public function topics(CourseSection $courseSection): JsonResponse
    {
        $topics = DiscussionTopic::forSection($courseSection->id)
            ->with(['creator', 'conversation'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('last_reply_at')
            ->get();

        return response()->json(['data' => $topics]);
    }

    public function createTopic(Request $request, CourseSection $courseSection): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
            'is_anonymous' => ['boolean'],
        ]);

        // Create underlying conversation
        $conversation = Conversation::create([
            'subject' => $validated['title'],
            'type' => Conversation::TYPE_COURSE,
            'course_section_id' => $courseSection->id,
            'created_by' => $request->user()->id,
            'last_message_at' => now(),
        ]);

        // Add creator as participant
        $conversation->participants()->attach($request->user()->id);

        // Create the topic
        $topic = DiscussionTopic::create([
            'conversation_id' => $conversation->id,
            'course_section_id' => $courseSection->id,
            'title' => $validated['title'],
            'created_by' => $request->user()->id,
            'is_anonymous' => $validated['is_anonymous'] ?? false,
        ]);

        // Create initial message
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
            'type' => Message::TYPE_TEXT,
        ]);

        $topic->load(['creator', 'conversation']);

        return response()->json([
            'message' => 'Discussion topic created successfully.',
            'data' => $topic,
        ], 201);
    }

    public function replies(DiscussionTopic $discussionTopic): JsonResponse
    {
        $messages = $discussionTopic->conversation
            ->messages()
            ->with(['sender', 'replyTo.sender'])
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $messages]);
    }

    public function postReply(Request $request, DiscussionTopic $discussionTopic): JsonResponse
    {
        if ($discussionTopic->is_locked) {
            return response()->json(['message' => 'This discussion is locked.'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'reply_to_id' => ['nullable', 'exists:messages,id'],
        ]);

        $message = Message::create([
            'conversation_id' => $discussionTopic->conversation_id,
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
            'type' => Message::TYPE_TEXT,
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        // Update topic stats
        $discussionTopic->increment('reply_count');
        $discussionTopic->update(['last_reply_at' => now()]);

        // Add as participant if not already
        $discussionTopic->conversation->participants()->syncWithoutDetaching([$request->user()->id]);

        $message->load(['sender', 'replyTo.sender']);

        return response()->json([
            'message' => 'Reply posted successfully.',
            'data' => $message,
        ], 201);
    }

    public function togglePin(DiscussionTopic $discussionTopic): JsonResponse
    {
        $discussionTopic->update(['is_pinned' => ! $discussionTopic->is_pinned]);

        return response()->json([
            'message' => $discussionTopic->is_pinned ? 'Topic pinned.' : 'Topic unpinned.',
            'data' => $discussionTopic,
        ]);
    }

    public function toggleLock(DiscussionTopic $discussionTopic): JsonResponse
    {
        $discussionTopic->update(['is_locked' => ! $discussionTopic->is_locked]);

        return response()->json([
            'message' => $discussionTopic->is_locked ? 'Topic locked.' : 'Topic unlocked.',
            'data' => $discussionTopic,
        ]);
    }
}
