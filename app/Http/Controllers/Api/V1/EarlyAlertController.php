<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EarlyAlert;
use App\Models\EarlyAlertComment;
use App\Models\Staff;
use App\Services\EarlyAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EarlyAlertController extends Controller
{
    public function __construct(
        private EarlyAlertService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = EarlyAlert::with(['student.user', 'courseSection.course', 'raisedBy.user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('alert_type')) {
            $query->where('alert_type', $request->alert_type);
        }
        if ($request->has('student_id')) {
            $query->forStudent($request->student_id);
        }

        $alerts = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $alerts->items(),
            'meta' => [
                'current_page' => $alerts->currentPage(),
                'last_page' => $alerts->lastPage(),
                'per_page' => $alerts->perPage(),
                'total' => $alerts->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'course_section_id' => ['required', 'exists:course_sections,id'],
            'alert_type' => ['required', 'in:' . implode(',', EarlyAlert::ALERT_TYPES)],
            'severity' => ['required', 'in:' . implode(',', EarlyAlert::SEVERITIES)],
            'description' => ['required', 'string', 'max:2000'],
        ]);

        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();

        $alert = $this->service->raiseAlert(
            $staff,
            $validated['student_id'],
            $validated['course_section_id'],
            $validated['alert_type'],
            $validated['severity'],
            $validated['description']
        );

        $alert->load(['student.user', 'courseSection.course', 'raisedBy.user']);

        return response()->json([
            'message' => 'Early alert raised successfully.',
            'data' => $alert,
        ], 201);
    }

    public function show(EarlyAlert $earlyAlert): JsonResponse
    {
        $earlyAlert->load(['student.user', 'courseSection.course', 'raisedBy.user', 'resolvedBy.user', 'comments.user']);

        return response()->json(['data' => $earlyAlert]);
    }

    public function update(Request $request, EarlyAlert $earlyAlert): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', EarlyAlert::STATUSES)],
            'resolution_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validated['status'] === 'resolved') {
            $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();
            $this->service->resolveAlert($earlyAlert, $staff, $validated['resolution_notes'] ?? '');
        } else {
            $earlyAlert->update(['status' => $validated['status']]);
        }

        return response()->json([
            'message' => 'Early alert updated successfully.',
            'data' => $earlyAlert->fresh(['student.user', 'courseSection.course']),
        ]);
    }

    public function addComment(Request $request, EarlyAlert $earlyAlert): JsonResponse
    {
        $validated = $request->validate([
            'comment' => ['required', 'string', 'max:2000'],
        ]);

        $comment = EarlyAlertComment::create([
            'early_alert_id' => $earlyAlert->id,
            'user_id' => $request->user()->id,
            'comment' => $validated['comment'],
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Comment added successfully.',
            'data' => $comment,
        ], 201);
    }

    public function myAlerts(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();

        $alerts = EarlyAlert::forAdvisor($staff->id)
            ->with(['student.user', 'courseSection.course', 'raisedBy.user'])
            ->whereIn('status', ['open', 'acknowledged', 'in_progress'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $alerts]);
    }
}
