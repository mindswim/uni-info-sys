<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RegistrationTimeTicket;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Http\Request;

class RegistrationTimeTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = RegistrationTimeTicket::with(['student', 'term']);

        if ($request->filled('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        return response()->json(['data' => $query->paginate(25)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'term_id' => 'required|exists:terms,id',
            'priority_group' => 'required|in:' . implode(',', RegistrationTimeTicket::PRIORITY_GROUPS),
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $ticket = RegistrationTimeTicket::updateOrCreate(
            ['student_id' => $request->student_id, 'term_id' => $request->term_id],
            $request->only(['priority_group', 'start_time', 'end_time'])
        );

        return response()->json(['data' => $ticket->load(['student', 'term'])], 201);
    }

    public function bulkAssign(Request $request)
    {
        $request->validate([
            'term_id' => 'required|exists:terms,id',
            'assignments' => 'required|array',
            'assignments.*.priority_group' => 'required|in:' . implode(',', RegistrationTimeTicket::PRIORITY_GROUPS),
            'assignments.*.start_time' => 'required|date',
            'assignments.*.end_time' => 'required|date|after:assignments.*.start_time',
        ]);

        $termId = $request->term_id;
        $created = 0;

        foreach ($request->assignments as $assignment) {
            $standingMap = [
                'senior' => 'senior',
                'junior' => 'junior',
                'sophomore' => 'sophomore',
                'freshman' => 'freshman',
            ];

            $classStanding = $standingMap[$assignment['priority_group']] ?? null;

            $students = Student::query()
                ->whereIn('enrollment_status', ['full_time', 'part_time', 'active']);

            if ($classStanding) {
                $students->where('class_standing', $classStanding);
            }

            foreach ($students->get() as $student) {
                RegistrationTimeTicket::updateOrCreate(
                    ['student_id' => $student->id, 'term_id' => $termId],
                    [
                        'priority_group' => $assignment['priority_group'],
                        'start_time' => $assignment['start_time'],
                        'end_time' => $assignment['end_time'],
                    ]
                );
                $created++;
            }
        }

        return response()->json(['message' => "{$created} time tickets assigned.", 'count' => $created]);
    }

    public function myTicket(Request $request)
    {
        $student = $request->user()->student;

        if (!$student) {
            return response()->json(['message' => 'No student record found.'], 404);
        }

        $ticket = RegistrationTimeTicket::where('student_id', $student->id)
            ->with('term')
            ->orderBy('start_time', 'desc')
            ->first();

        if (!$ticket) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => array_merge($ticket->toArray(), [
                'can_register_now' => $ticket->canRegisterNow(),
                'is_upcoming' => $ticket->isUpcoming(),
                'is_expired' => $ticket->isExpired(),
            ]),
        ]);
    }
}
