<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hold;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HoldController extends Controller
{
    /**
     * List holds for a student or all holds (admin)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Hold::with(['student.user', 'placedByUser', 'resolvedByUser']);

        // Filter by student if provided or if user is a student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        } elseif ($request->user()->hasRole('student')) {
            $student = Student::where('user_id', $request->user()->id)->first();
            if ($student) {
                $query->where('student_id', $student->id);
            }
        }

        // Filter by active/resolved
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'resolved') {
                $query->resolved();
            }
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        // Filter by prevents_registration
        if ($request->boolean('prevents_registration')) {
            $query->preventsRegistration();
        }

        $holds = $query->orderBy('placed_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($holds);
    }

    /**
     * Get a specific hold
     */
    public function show(Hold $hold): JsonResponse
    {
        $hold->load(['student.user', 'placedByUser', 'resolvedByUser']);

        return response()->json([
            'data' => $hold,
        ]);
    }

    /**
     * Create a new hold (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'type' => 'required|string|in:' . implode(',', Hold::TYPES),
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
            'severity' => 'sometimes|string|in:' . implode(',', Hold::SEVERITIES),
            'prevents_registration' => 'sometimes|boolean',
            'prevents_transcript' => 'sometimes|boolean',
            'prevents_graduation' => 'sometimes|boolean',
            'department' => 'nullable|string|max:100',
        ]);

        $hold = Hold::create([
            ...$validated,
            'placed_by' => $request->user()->id,
            'placed_at' => now(),
            'severity' => $validated['severity'] ?? Hold::SEVERITY_WARNING,
        ]);

        return response()->json([
            'message' => 'Hold created successfully.',
            'data' => $hold->load(['student.user', 'placedByUser']),
        ], 201);
    }

    /**
     * Update a hold
     */
    public function update(Request $request, Hold $hold): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|string|in:' . implode(',', Hold::TYPES),
            'reason' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'severity' => 'sometimes|string|in:' . implode(',', Hold::SEVERITIES),
            'prevents_registration' => 'sometimes|boolean',
            'prevents_transcript' => 'sometimes|boolean',
            'prevents_graduation' => 'sometimes|boolean',
            'department' => 'nullable|string|max:100',
        ]);

        $hold->update($validated);

        return response()->json([
            'message' => 'Hold updated successfully.',
            'data' => $hold->fresh(['student.user', 'placedByUser']),
        ]);
    }

    /**
     * Resolve a hold
     */
    public function resolve(Request $request, Hold $hold): JsonResponse
    {
        $validated = $request->validate([
            'resolution_notes' => 'nullable|string',
        ]);

        $hold->resolve($request->user(), $validated['resolution_notes'] ?? null);

        return response()->json([
            'message' => 'Hold resolved successfully.',
            'data' => $hold->fresh(['student.user', 'placedByUser', 'resolvedByUser']),
        ]);
    }

    /**
     * Delete a hold (admin only)
     */
    public function destroy(Hold $hold): JsonResponse
    {
        $hold->delete();

        return response()->json([
            'message' => 'Hold deleted successfully.',
        ]);
    }

    /**
     * Get hold summary for current student
     */
    public function summary(Request $request): JsonResponse
    {
        $student = Student::where('user_id', $request->user()->id)->first();

        if (!$student) {
            return response()->json([
                'data' => [
                    'total_active' => 0,
                    'prevents_registration' => false,
                    'critical_count' => 0,
                    'holds' => [],
                ],
            ]);
        }

        $activeHolds = Hold::where('student_id', $student->id)
            ->active()
            ->get();

        return response()->json([
            'data' => [
                'total_active' => $activeHolds->count(),
                'prevents_registration' => $activeHolds->where('prevents_registration', true)->isNotEmpty(),
                'critical_count' => $activeHolds->where('severity', Hold::SEVERITY_CRITICAL)->count(),
                'holds' => $activeHolds,
            ],
        ]);
    }
}
