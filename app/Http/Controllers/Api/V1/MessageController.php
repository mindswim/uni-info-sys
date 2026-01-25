<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    /**
     * Get all conversations for the current user
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::forUser($user)
            ->withUnreadCount($user)
            ->with(['participants', 'latestMessage.sender', 'courseSection.course'])
            ->orderBy('last_message_at', 'desc')
            ->get();

        return response()->json([
            'data' => $conversations->map(fn($conv) => $this->formatConversation($conv, $user))
        ]);
    }

    /**
     * Get a specific conversation with messages
     */
    public function conversation(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $request->user();

        // Verify user is a participant
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $conversation->load(['participants', 'courseSection.course']);

        // Mark conversation as read
        $conversation->markAsReadForUser($user);

        // Get messages with pagination
        $messages = $conversation->messages()
            ->with(['sender', 'replyTo.sender'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => [
                'conversation' => $this->formatConversation($conversation, $user),
                'messages' => collect($messages->items())
                    ->reverse()
                    ->values()
                    ->map(fn($msg) => $this->formatMessage($msg, $user)),
            ],
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ]
        ]);
    }

    /**
     * Start a new conversation or get existing one
     */
    public function startConversation(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'recipient_id' => 'required_without:course_section_id|integer|exists:users,id',
            'course_section_id' => 'required_without:recipient_id|integer|exists:course_sections,id',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // For direct messages
        if (isset($validated['recipient_id'])) {
            $recipient = User::findOrFail($validated['recipient_id']);

            if ($recipient->id === $user->id) {
                return response()->json(['message' => 'Cannot message yourself'], 422);
            }

            $conversation = Conversation::findOrCreateDirect($user, $recipient);
        } else {
            // For course-based conversations (future implementation)
            $conversation = Conversation::create([
                'type' => Conversation::TYPE_COURSE,
                'course_section_id' => $validated['course_section_id'],
                'subject' => $validated['subject'],
                'created_by' => $user->id,
            ]);
            $conversation->participants()->attach($user->id);
        }

        // Create the initial message
        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $validated['message'],
            'type' => Message::TYPE_TEXT,
        ]);

        $conversation->load(['participants', 'latestMessage.sender']);

        return response()->json([
            'message' => 'Conversation started successfully',
            'data' => [
                'conversation' => $this->formatConversation($conversation, $user),
                'message' => $this->formatMessage($message->load('sender'), $user),
            ]
        ], 201);
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $request->user();

        // Verify user is a participant
        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'reply_to_id' => 'nullable|integer|exists:messages,id',
        ]);

        // Verify reply_to_id belongs to this conversation
        if (isset($validated['reply_to_id'])) {
            $replyTo = Message::where('id', $validated['reply_to_id'])
                ->where('conversation_id', $conversation->id)
                ->first();

            if (!$replyTo) {
                return response()->json(['message' => 'Invalid reply target'], 422);
            }
        }

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $validated['body'],
            'type' => Message::TYPE_TEXT,
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        $message->load(['sender', 'replyTo.sender']);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $this->formatMessage($message, $user)
        ], 201);
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $conversation->markAsReadForUser($user);

        return response()->json([
            'message' => 'Conversation marked as read'
        ]);
    }

    /**
     * Get unread message count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Conversation::forUser($user)
            ->withUnreadCount($user)
            ->get()
            ->sum('unread_count');

        return response()->json([
            'data' => [
                'unread_count' => $count
            ]
        ]);
    }

    /**
     * Archive a conversation
     */
    public function archive(Conversation $conversation, Request $request): JsonResponse
    {
        $user = $request->user();

        $conversation->participants()->updateExistingPivot($user->id, [
            'is_archived' => true
        ]);

        return response()->json([
            'message' => 'Conversation archived'
        ]);
    }

    /**
     * Search users to message
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'query' => 'required|string|min:2|max:100',
        ]);

        $users = User::where('id', '!=', $user->id)
            ->where(function ($q) use ($validated) {
                $q->where('name', 'like', '%' . $validated['query'] . '%')
                    ->orWhere('email', 'like', '%' . $validated['query'] . '%');
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json([
            'data' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ])
        ]);
    }

    private function formatConversation(Conversation $conversation, User $currentUser): array
    {
        return [
            'id' => $conversation->id,
            'subject' => $conversation->subject,
            'type' => $conversation->type,
            'display_name' => $conversation->getDisplayName($currentUser),
            'unread_count' => $conversation->unread_count ?? 0,
            'last_message_at' => $conversation->last_message_at?->toIso8601String(),
            'latest_message' => $conversation->latestMessage ? [
                'id' => $conversation->latestMessage->id,
                'body' => $conversation->latestMessage->body,
                'sender_name' => $conversation->latestMessage->sender->name,
                'is_mine' => $conversation->latestMessage->sender_id === $currentUser->id,
                'created_at' => $conversation->latestMessage->created_at->toIso8601String(),
            ] : null,
            'participants' => $conversation->participants->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'is_me' => $p->id === $currentUser->id,
            ]),
            'course_section' => $conversation->courseSection ? [
                'id' => $conversation->courseSection->id,
                'course_code' => $conversation->courseSection->course->course_code,
                'course_title' => $conversation->courseSection->course->title,
            ] : null,
        ];
    }

    private function formatMessage(Message $message, User $currentUser): array
    {
        return [
            'id' => $message->id,
            'body' => $message->body,
            'type' => $message->type,
            'is_mine' => $message->sender_id === $currentUser->id,
            'is_edited' => $message->is_edited,
            'created_at' => $message->created_at->toIso8601String(),
            'edited_at' => $message->edited_at?->toIso8601String(),
            'sender' => [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
            ],
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'body' => \Str::limit($message->replyTo->body, 100),
                'sender_name' => $message->replyTo->sender->name,
            ] : null,
        ];
    }
}
