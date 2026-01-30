<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Student;
use App\Models\TransferCredit;
use App\Models\TransferEquivalency;
use App\Services\TransferCreditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransferCreditController extends Controller
{
    public function __construct(
        private TransferCreditService $service
    ) {}

    public function index(Student $student): JsonResponse
    {
        $transfers = TransferCredit::where('student_id', $student->id)
            ->with(['equivalentCourse', 'evaluator.user'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $transfers]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'external_institution' => ['required', 'string', 'max:255'],
            'external_course_code' => ['required', 'string', 'max:50'],
            'external_course_name' => ['required', 'string', 'max:255'],
            'external_credits' => ['required', 'numeric', 'min:0', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $transfer = TransferCredit::create($validated);

        // Try auto-match
        $match = $this->service->autoMatch($transfer);
        if ($match) {
            $transfer->update([
                'equivalent_course_id' => $match->internal_course_id,
                'notes' => ($transfer->notes ? $transfer->notes . "\n" : '') . 'Auto-matched from equivalency table.',
            ]);
        }

        return response()->json([
            'message' => 'Transfer credit submitted successfully.',
            'data' => $transfer->load('equivalentCourse'),
        ], 201);
    }

    public function evaluate(Request $request, TransferCredit $transferCredit): JsonResponse
    {
        $validated = $request->validate([
            'equivalent_course_id' => ['nullable', 'exists:courses,id'],
            'credits_awarded' => ['nullable', 'numeric', 'min:0'],
            'grade_awarded' => ['nullable', 'string', 'max:5'],
            'status' => ['required', 'in:approved,denied,partial'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();

        $this->service->evaluate(
            $transferCredit,
            $validated['equivalent_course_id'] ?? null,
            $validated['credits_awarded'] ?? null,
            $validated['grade_awarded'] ?? null,
            $staff,
            $validated['status']
        );

        if (isset($validated['notes'])) {
            $transferCredit->update(['notes' => $validated['notes']]);
        }

        return response()->json([
            'message' => 'Transfer credit evaluated successfully.',
            'data' => $transferCredit->fresh(['equivalentCourse', 'evaluator.user']),
        ]);
    }

    public function equivalencies(): JsonResponse
    {
        $equivalencies = TransferEquivalency::with(['internalCourse', 'approver.user'])
            ->orderBy('external_institution')
            ->get();

        return response()->json(['data' => $equivalencies]);
    }

    public function storeEquivalency(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'external_institution' => ['required', 'string', 'max:255'],
            'external_course_code' => ['required', 'string', 'max:50'],
            'internal_course_id' => ['required', 'exists:courses,id'],
        ]);

        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();

        $equivalency = TransferEquivalency::create([
            ...$validated,
            'approved_by' => $staff->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Transfer equivalency created successfully.',
            'data' => $equivalency->load('internalCourse'),
        ], 201);
    }
}
