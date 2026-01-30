<?php

namespace App\Services;

use App\Models\GraduationApplication;
use App\Models\Hold;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GraduationClearanceService
{
    public function __construct(
        private StudentService $studentService,
    ) {}

    public function initiateClearance(GraduationApplication $application): GraduationApplication
    {
        return DB::transaction(function () use ($application) {
            $student = $application->student;

            // Initialize all departments as pending
            $clearance = [];
            foreach (GraduationApplication::CLEARANCE_DEPARTMENTS as $dept) {
                $clearance[$dept] = [
                    'status' => GraduationApplication::CLEARANCE_PENDING,
                    'cleared_by' => null,
                    'cleared_at' => null,
                    'notes' => null,
                ];
            }

            // Capture degree audit snapshot
            $auditSnapshot = null;
            if ($application->program_id) {
                $auditSnapshot = $this->studentService->checkDegreeProgress(
                    $student,
                    $application->program_id
                );
                // Remove non-serializable data
                $auditSnapshot['program'] = [
                    'id' => $auditSnapshot['program']->id,
                    'name' => $auditSnapshot['program']->name,
                    'code' => $auditSnapshot['program']->code,
                    'total_credit_hours' => $auditSnapshot['program']->total_credit_hours,
                ];
                foreach ($auditSnapshot['requirements'] as &$req) {
                    $req['requirement'] = [
                        'id' => $req['requirement']->id ?? $req['requirement']['id'] ?? null,
                        'name' => $req['requirement']->name ?? $req['requirement']['name'] ?? null,
                        'category' => $req['requirement']->category ?? $req['requirement']['category'] ?? null,
                        'required_credit_hours' => $req['requirement']->required_credit_hours ?? null,
                        'is_required' => $req['requirement']->is_required ?? null,
                    ];
                }
            }

            $application->update([
                'status' => GraduationApplication::STATUS_CLEARANCE_IN_PROGRESS,
                'clearance_status' => $clearance,
                'degree_audit_snapshot' => $auditSnapshot,
            ]);

            // Run automated checks
            $this->runAutomatedClearance($application);

            Log::info('Graduation clearance initiated', [
                'application_id' => $application->id,
                'student_id' => $student->id,
            ]);

            return $application->fresh();
        });
    }

    public function runAutomatedClearance(GraduationApplication $application): void
    {
        $student = $application->student;
        $clearance = $application->clearance_status;

        // Academic: check degree progress
        $audit = $application->degree_audit_snapshot;
        if ($audit && ($audit['graduation_eligible'] ?? false)) {
            $clearance['academic'] = [
                'status' => GraduationApplication::CLEARANCE_CLEARED,
                'cleared_by' => null,
                'cleared_at' => now()->toISOString(),
                'notes' => 'Auto-cleared: all degree requirements met',
            ];
        } else {
            $clearance['academic'] = [
                'status' => GraduationApplication::CLEARANCE_HOLD,
                'cleared_by' => null,
                'cleared_at' => null,
                'notes' => 'Degree requirements not fully met - manual review required',
            ];
        }

        // Financial: check for active financial holds
        $financialHolds = Hold::where('student_id', $student->id)
            ->active()
            ->where(function ($q) {
                $q->where('type', Hold::TYPE_FINANCIAL)
                    ->orWhere('prevents_graduation', true);
            })
            ->count();

        if ($financialHolds === 0) {
            $clearance['financial'] = [
                'status' => GraduationApplication::CLEARANCE_CLEARED,
                'cleared_by' => null,
                'cleared_at' => now()->toISOString(),
                'notes' => 'Auto-cleared: no financial holds',
            ];
        } else {
            $clearance['financial'] = [
                'status' => GraduationApplication::CLEARANCE_HOLD,
                'cleared_by' => null,
                'cleared_at' => null,
                'notes' => "{$financialHolds} active financial/graduation hold(s) found",
            ];
        }

        // Library: check for active library holds
        $libraryHolds = Hold::where('student_id', $student->id)
            ->active()
            ->where('type', Hold::TYPE_LIBRARY)
            ->count();

        if ($libraryHolds === 0) {
            $clearance['library'] = [
                'status' => GraduationApplication::CLEARANCE_CLEARED,
                'cleared_by' => null,
                'cleared_at' => now()->toISOString(),
                'notes' => 'Auto-cleared: no library holds',
            ];
        } else {
            $clearance['library'] = [
                'status' => GraduationApplication::CLEARANCE_HOLD,
                'cleared_by' => null,
                'cleared_at' => null,
                'notes' => "{$libraryHolds} active library hold(s) found",
            ];
        }

        // Registrar: always requires manual sign-off
        // (remains pending from initialization)

        $application->update(['clearance_status' => $clearance]);

        // Check if auto-clearance completed everything except registrar
        $this->checkAndAdvanceStatus($application->fresh());
    }

    public function clearDepartment(
        GraduationApplication $application,
        string $department,
        int $userId,
        ?string $notes = null,
    ): GraduationApplication {
        $this->validateDepartment($department);

        $clearance = $application->clearance_status;
        $clearance[$department] = [
            'status' => GraduationApplication::CLEARANCE_CLEARED,
            'cleared_by' => $userId,
            'cleared_at' => now()->toISOString(),
            'notes' => $notes,
        ];

        $application->update(['clearance_status' => $clearance]);
        $application = $application->fresh();

        $this->checkAndAdvanceStatus($application);

        Log::info('Graduation clearance department cleared', [
            'application_id' => $application->id,
            'department' => $department,
            'cleared_by' => $userId,
        ]);

        return $application->fresh();
    }

    public function blockDepartment(
        GraduationApplication $application,
        string $department,
        int $userId,
        ?string $notes = null,
    ): GraduationApplication {
        $this->validateDepartment($department);

        $clearance = $application->clearance_status;
        $clearance[$department] = [
            'status' => GraduationApplication::CLEARANCE_HOLD,
            'cleared_by' => $userId,
            'cleared_at' => null,
            'notes' => $notes,
        ];

        $application->update([
            'clearance_status' => $clearance,
            'status' => GraduationApplication::STATUS_CLEARANCE_IN_PROGRESS,
        ]);

        Log::info('Graduation clearance department blocked', [
            'application_id' => $application->id,
            'department' => $department,
            'blocked_by' => $userId,
        ]);

        return $application->fresh();
    }

    public function finalApprove(GraduationApplication $application, int $userId): GraduationApplication
    {
        if (! $application->isFullyCleared()) {
            throw new \RuntimeException('Cannot final-approve: not all departments have cleared');
        }

        $application->update([
            'status' => GraduationApplication::STATUS_APPROVED,
            'reviewed_by' => $userId,
            'reviewed_at' => now(),
        ]);

        Log::info('Graduation application final approved', [
            'application_id' => $application->id,
            'approved_by' => $userId,
        ]);

        return $application->fresh();
    }

    private function checkAndAdvanceStatus(GraduationApplication $application): void
    {
        if ($application->isFullyCleared() && $application->status === GraduationApplication::STATUS_CLEARANCE_IN_PROGRESS) {
            $application->update(['status' => GraduationApplication::STATUS_CLEARED]);
        }
    }

    private function validateDepartment(string $department): void
    {
        if (! in_array($department, GraduationApplication::CLEARANCE_DEPARTMENTS)) {
            throw new \InvalidArgumentException(
                "Invalid department: {$department}. Must be one of: ".implode(', ', GraduationApplication::CLEARANCE_DEPARTMENTS)
            );
        }
    }
}
