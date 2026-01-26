<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActionItem;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActionItemController extends Controller
{
    /**
     * List action items for a student
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActionItem::with('student.user');

        // Filter by student if provided or if user is a student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        } elseif ($request->user()->hasRole('student')) {
            $student = Student::where('user_id', $request->user()->id)->first();
            if ($student) {
                $query->where('student_id', $student->id);
            }
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'incomplete') {
                $query->incomplete();
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter overdue
        if ($request->boolean('overdue')) {
            $query->overdue();
        }

        // Filter due soon
        if ($request->has('due_within_days')) {
            $query->dueSoon((int) $request->due_within_days);
        }

        // Default ordering: priority then due date
        $items = $query->orderByPriority()
            ->orderByDueDate()
            ->paginate($request->get('per_page', 50));

        return response()->json($items);
    }

    /**
     * Get a specific action item
     */
    public function show(ActionItem $actionItem): JsonResponse
    {
        return response()->json([
            'data' => $actionItem->load('student.user'),
        ]);
    }

    /**
     * Create a new action item (admin or system)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'type' => 'required|string|in:' . implode(',', ActionItem::TYPES),
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|string|in:' . implode(',', ActionItem::PRIORITIES),
            'action_url' => 'nullable|string|max:500',
            'action_label' => 'nullable|string|max:50',
            'due_date' => 'nullable|date',
            'source' => 'nullable|string|max:100',
            'metadata' => 'nullable|array',
        ]);

        $actionItem = ActionItem::create([
            ...$validated,
            'status' => ActionItem::STATUS_PENDING,
            'priority' => $validated['priority'] ?? ActionItem::PRIORITY_NORMAL,
            'is_system_generated' => $request->boolean('is_system_generated', true),
        ]);

        return response()->json([
            'message' => 'Action item created successfully.',
            'data' => $actionItem,
        ], 201);
    }

    /**
     * Update an action item
     */
    public function update(Request $request, ActionItem $actionItem): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|string|in:' . implode(',', ActionItem::PRIORITIES),
            'action_url' => 'nullable|string|max:500',
            'action_label' => 'nullable|string|max:50',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|string|in:' . implode(',', ActionItem::STATUSES),
        ]);

        // Handle completion
        if (isset($validated['status']) && $validated['status'] === ActionItem::STATUS_COMPLETED) {
            $validated['completed_at'] = now();
        }

        $actionItem->update($validated);

        return response()->json([
            'message' => 'Action item updated successfully.',
            'data' => $actionItem->fresh(),
        ]);
    }

    /**
     * Mark action item as complete
     */
    public function complete(ActionItem $actionItem): JsonResponse
    {
        $actionItem->markComplete();

        return response()->json([
            'message' => 'Action item marked as complete.',
            'data' => $actionItem->fresh(),
        ]);
    }

    /**
     * Dismiss an action item
     */
    public function dismiss(ActionItem $actionItem): JsonResponse
    {
        $actionItem->dismiss();

        return response()->json([
            'message' => 'Action item dismissed.',
            'data' => $actionItem->fresh(),
        ]);
    }

    /**
     * Delete an action item
     */
    public function destroy(ActionItem $actionItem): JsonResponse
    {
        $actionItem->delete();

        return response()->json([
            'message' => 'Action item deleted successfully.',
        ]);
    }

    /**
     * Get dashboard summary of action items for current student
     */
    public function dashboard(Request $request): JsonResponse
    {
        $student = Student::where('user_id', $request->user()->id)->first();

        if (!$student) {
            return response()->json([
                'data' => [
                    'total_pending' => 0,
                    'overdue_count' => 0,
                    'due_this_week' => 0,
                    'urgent_count' => 0,
                    'items' => [],
                ],
            ]);
        }

        $incompleteItems = ActionItem::where('student_id', $student->id)
            ->incomplete()
            ->orderByPriority()
            ->orderByDueDate()
            ->get();

        $now = now();
        $weekFromNow = now()->addDays(7);

        return response()->json([
            'data' => [
                'total_pending' => $incompleteItems->count(),
                'overdue_count' => $incompleteItems->filter(fn($item) => $item->isOverdue())->count(),
                'due_this_week' => $incompleteItems->filter(fn($item) =>
                    $item->due_date &&
                    $item->due_date->gte($now) &&
                    $item->due_date->lte($weekFromNow)
                )->count(),
                'urgent_count' => $incompleteItems->where('priority', ActionItem::PRIORITY_URGENT)->count(),
                'items' => $incompleteItems->take(10)->values(), // Top 10 for dashboard
            ],
        ]);
    }
}
