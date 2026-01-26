<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Student;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * List appointments with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['student.user', 'advisor.user']);

        // Filter by student
        if ($request->has('student_id')) {
            $query->forStudent($request->student_id);
        }

        // Filter by advisor
        if ($request->has('advisor_id')) {
            $query->forAdvisor($request->advisor_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter upcoming only
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('scheduled_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('scheduled_at', '<=', $request->to_date);
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($appointments);
    }

    /**
     * Get current student's appointments
     */
    public function myAppointments(Request $request): JsonResponse
    {
        $student = Student::where('user_id', $request->user()->id)->first();

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = Appointment::with(['advisor.user', 'advisor.department'])
            ->forStudent($student->id);

        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($appointments);
    }

    /**
     * Get current student's advisor info
     */
    public function myAdvisor(Request $request): JsonResponse
    {
        $student = Student::with(['advisor.user', 'advisor.department'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        if (!$student->advisor) {
            return response()->json(['message' => 'No advisor assigned'], 404);
        }

        return response()->json([
            'data' => $student->advisor,
        ]);
    }

    /**
     * Get current staff's advisees
     */
    public function myAdvisees(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->first();

        if (!$staff) {
            return response()->json(['message' => 'Staff profile not found'], 404);
        }

        $advisees = Student::with(['user', 'majorProgram'])
            ->where('advisor_id', $staff->id)
            ->paginate($request->get('per_page', 50));

        return response()->json($advisees);
    }

    /**
     * Get current staff's appointments
     */
    public function advisorAppointments(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->first();

        if (!$staff) {
            return response()->json(['message' => 'Staff profile not found'], 404);
        }

        $query = Appointment::with(['student.user', 'student.majorProgram'])
            ->forAdvisor($staff->id);

        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($appointments);
    }

    /**
     * Get a specific appointment
     */
    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['student.user', 'advisor.user', 'cancelledBy']);

        return response()->json([
            'data' => $appointment,
        ]);
    }

    /**
     * Book a new appointment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'advisor_id' => 'required|exists:staff,id',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:120',
            'type' => 'nullable|string|in:advising,registration,career,academic,personal,other',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:255',
            'student_notes' => 'nullable|string|max:1000',
        ]);

        // Get student ID from authenticated user or request
        if ($request->has('student_id') && $request->user()->hasRole(['admin', 'staff'])) {
            $studentId = $request->student_id;
        } else {
            $student = Student::where('user_id', $request->user()->id)->first();
            if (!$student) {
                return response()->json(['message' => 'Student profile not found'], 404);
            }
            $studentId = $student->id;
        }

        // Check for conflicts with advisor's schedule
        $conflictingAppointment = Appointment::forAdvisor($validated['advisor_id'])
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where('scheduled_at', $validated['scheduled_at'])
            ->exists();

        if ($conflictingAppointment) {
            return response()->json([
                'message' => 'This time slot is not available',
            ], 422);
        }

        $appointment = Appointment::create([
            'student_id' => $studentId,
            'advisor_id' => $validated['advisor_id'],
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => $validated['duration_minutes'] ?? 30,
            'type' => $validated['type'] ?? 'advising',
            'status' => 'scheduled',
            'location' => $validated['location'] ?? null,
            'meeting_link' => $validated['meeting_link'] ?? null,
            'student_notes' => $validated['student_notes'] ?? null,
        ]);

        $appointment->load(['student.user', 'advisor.user']);

        return response()->json([
            'message' => 'Appointment booked successfully',
            'data' => $appointment,
        ], 201);
    }

    /**
     * Update an appointment
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_at' => 'nullable|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:120',
            'type' => 'nullable|string|in:advising,registration,career,academic,personal,other',
            'status' => 'nullable|string|in:scheduled,confirmed,completed,cancelled,no_show',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:255',
            'student_notes' => 'nullable|string|max:1000',
            'advisor_notes' => 'nullable|string|max:1000',
            'meeting_notes' => 'nullable|string|max:2000',
        ]);

        $appointment->update($validated);
        $appointment->load(['student.user', 'advisor.user']);

        return response()->json([
            'message' => 'Appointment updated successfully',
            'data' => $appointment,
        ]);
    }

    /**
     * Cancel an appointment
     */
    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'This appointment cannot be cancelled',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $appointment->cancel($request->user(), $validated['reason'] ?? null);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'data' => $appointment,
        ]);
    }

    /**
     * Confirm an appointment
     */
    public function confirm(Appointment $appointment): JsonResponse
    {
        if (!$appointment->isUpcoming() || $appointment->status !== 'scheduled') {
            return response()->json([
                'message' => 'This appointment cannot be confirmed',
            ], 422);
        }

        $appointment->confirm();

        return response()->json([
            'message' => 'Appointment confirmed successfully',
            'data' => $appointment,
        ]);
    }

    /**
     * Complete an appointment
     */
    public function complete(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'meeting_notes' => 'nullable|string|max:2000',
        ]);

        $appointment->complete($validated['meeting_notes'] ?? null);

        return response()->json([
            'message' => 'Appointment completed successfully',
            'data' => $appointment,
        ]);
    }

    /**
     * Mark as no show
     */
    public function noShow(Appointment $appointment): JsonResponse
    {
        $appointment->markNoShow();

        return response()->json([
            'message' => 'Appointment marked as no show',
            'data' => $appointment,
        ]);
    }

    /**
     * Delete an appointment
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully',
        ]);
    }
}
