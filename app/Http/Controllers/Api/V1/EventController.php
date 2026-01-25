<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * Get events for the current user
     */
    public function myEvents(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'start' => 'sometimes|date',
            'end' => 'sometimes|date|after_or_equal:start',
            'type' => 'sometimes|string',
        ]);

        $start = $request->input('start', now()->startOfMonth());
        $end = $request->input('end', now()->endOfMonth()->addMonth());

        $query = Event::with(['creator', 'term', 'courseSection.course', 'department'])
            ->visible($user)
            ->inRange($start, $end)
            ->where('is_cancelled', false);

        // If user is a student, also include course-specific events
        $student = Student::where('user_id', $user->id)->first();
        if ($student) {
            $enrolledSectionIds = $student->enrollments()
                ->whereIn('status', ['enrolled', 'completed'])
                ->pluck('course_section_id')
                ->toArray();

            $query->where(function ($q) use ($enrolledSectionIds, $student) {
                $q->whereNull('course_section_id')
                    ->orWhereIn('course_section_id', $enrolledSectionIds);

                if ($student->majorProgram) {
                    $q->orWhere('department_id', $student->majorProgram->department_id);
                }
            });
        }

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $events = $query->orderBy('start_time')->get();

        return response()->json([
            'data' => $events->map(fn($event) => $this->formatEvent($event))
        ]);
    }

    /**
     * Get upcoming events for the current user
     */
    public function upcoming(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 10);

        $query = Event::with(['creator', 'term', 'courseSection.course', 'department'])
            ->visible($user)
            ->upcoming()
            ->limit($limit);

        // If user is a student, filter by enrolled courses
        $student = Student::where('user_id', $user->id)->first();
        if ($student) {
            $enrolledSectionIds = $student->enrollments()
                ->whereIn('status', ['enrolled', 'completed'])
                ->pluck('course_section_id')
                ->toArray();

            $query->where(function ($q) use ($enrolledSectionIds, $student) {
                $q->whereNull('course_section_id')
                    ->orWhereIn('course_section_id', $enrolledSectionIds);

                if ($student->majorProgram) {
                    $q->orWhere('department_id', $student->majorProgram->department_id);
                }
            });
        }

        $events = $query->get();

        return response()->json([
            'data' => $events->map(fn($event) => $this->formatEvent($event))
        ]);
    }

    /**
     * List all events (admin/staff view)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'start' => 'sometimes|date',
            'end' => 'sometimes|date|after_or_equal:start',
            'type' => 'sometimes|string',
            'term_id' => 'sometimes|integer|exists:terms,id',
            'course_section_id' => 'sometimes|integer|exists:course_sections,id',
            'department_id' => 'sometimes|integer|exists:departments,id',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $start = $request->input('start');
        $end = $request->input('end');

        $query = Event::with(['creator', 'term', 'courseSection.course', 'department']);

        if ($start && $end) {
            $query->inRange($start, $end);
        }

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        if ($request->has('course_section_id')) {
            $query->where('course_section_id', $request->course_section_id);
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $query->orderBy('start_time');

        $events = $query->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => collect($events->items())->map(fn($event) => $this->formatEvent($event)),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ]
        ]);
    }

    /**
     * Get available event types
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'data' => Event::TYPES
        ]);
    }

    /**
     * Get a specific event
     */
    public function show(Event $event): JsonResponse
    {
        $event->load(['creator', 'term', 'courseSection.course', 'department', 'attendees']);

        return response()->json([
            'data' => $this->formatEvent($event, true)
        ]);
    }

    /**
     * Create a new event
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'all_day' => 'sometimes|boolean',
            'location' => 'nullable|string|max:255',
            'type' => 'sometimes|string|in:' . implode(',', array_keys(Event::TYPES)),
            'color' => 'nullable|string|max:20',
            'visibility' => 'sometimes|string|in:public,students,staff,private',
            'term_id' => 'nullable|integer|exists:terms,id',
            'course_section_id' => 'nullable|integer|exists:course_sections,id',
            'department_id' => 'nullable|integer|exists:departments,id',
            'reminder_minutes' => 'nullable|integer|min:0',
        ]);

        $validated['created_by'] = $request->user()->id;

        $event = Event::create($validated);
        $event->load(['creator', 'term', 'courseSection.course', 'department']);

        return response()->json([
            'message' => 'Event created successfully',
            'data' => $this->formatEvent($event)
        ], 201);
    }

    /**
     * Update an event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'all_day' => 'sometimes|boolean',
            'location' => 'nullable|string|max:255',
            'type' => 'sometimes|string|in:' . implode(',', array_keys(Event::TYPES)),
            'color' => 'nullable|string|max:20',
            'visibility' => 'sometimes|string|in:public,students,staff,private',
            'term_id' => 'nullable|integer|exists:terms,id',
            'course_section_id' => 'nullable|integer|exists:course_sections,id',
            'department_id' => 'nullable|integer|exists:departments,id',
            'reminder_minutes' => 'nullable|integer|min:0',
        ]);

        $event->update($validated);
        $event->load(['creator', 'term', 'courseSection.course', 'department']);

        return response()->json([
            'message' => 'Event updated successfully',
            'data' => $this->formatEvent($event)
        ]);
    }

    /**
     * Cancel an event
     */
    public function cancel(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        $event->update([
            'is_cancelled' => true,
            'cancellation_reason' => $validated['reason'] ?? null
        ]);

        return response()->json([
            'message' => 'Event cancelled successfully',
            'data' => $this->formatEvent($event)
        ]);
    }

    /**
     * Delete an event
     */
    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }

    /**
     * RSVP to an event
     */
    public function rsvp(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:attending,maybe,declined'
        ]);

        $event->attendees()->syncWithoutDetaching([
            $request->user()->id => ['status' => $validated['status']]
        ]);

        return response()->json([
            'message' => 'RSVP updated successfully',
            'data' => [
                'status' => $validated['status']
            ]
        ]);
    }

    private function formatEvent(Event $event, bool $includeAttendees = false): array
    {
        $formatted = [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'start' => $event->start_time->toIso8601String(),
            'end' => $event->end_time->toIso8601String(),
            'all_day' => $event->all_day,
            'location' => $event->location,
            'type' => $event->type,
            'type_label' => $event->getTypeLabel(),
            'color' => $event->getDefaultColor(),
            'visibility' => $event->visibility,
            'is_cancelled' => $event->is_cancelled,
            'cancellation_reason' => $event->cancellation_reason,
            'creator' => $event->creator ? [
                'id' => $event->creator->id,
                'name' => $event->creator->name,
            ] : null,
            'term' => $event->term ? [
                'id' => $event->term->id,
                'name' => $event->term->name,
            ] : null,
            'course_section' => $event->courseSection ? [
                'id' => $event->courseSection->id,
                'section_number' => $event->courseSection->section_number,
                'course' => [
                    'id' => $event->courseSection->course->id,
                    'code' => $event->courseSection->course->course_code,
                    'title' => $event->courseSection->course->title,
                ]
            ] : null,
            'department' => $event->department ? [
                'id' => $event->department->id,
                'name' => $event->department->name,
            ] : null,
        ];

        if ($includeAttendees && $event->relationLoaded('attendees')) {
            $formatted['attendees'] = $event->attendees->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'status' => $user->pivot->status,
            ]);
        }

        return $formatted;
    }
}
