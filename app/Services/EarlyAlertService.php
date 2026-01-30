<?php

namespace App\Services;

use App\Models\EarlyAlert;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;

class EarlyAlertService
{
    public function raiseAlert(
        Staff $staff,
        int $studentId,
        int $courseSectionId,
        string $alertType,
        string $severity,
        string $description
    ): EarlyAlert {
        return DB::transaction(function () use ($staff, $studentId, $courseSectionId, $alertType, $severity, $description) {
            return EarlyAlert::create([
                'student_id' => $studentId,
                'course_section_id' => $courseSectionId,
                'raised_by' => $staff->id,
                'alert_type' => $alertType,
                'severity' => $severity,
                'description' => $description,
                'status' => 'open',
            ]);
        });
    }

    public function resolveAlert(EarlyAlert $alert, Staff $staff, string $notes): EarlyAlert
    {
        $alert->update([
            'status' => 'resolved',
            'resolved_by' => $staff->id,
            'resolved_at' => now(),
            'resolution_notes' => $notes,
        ]);

        return $alert;
    }
}
