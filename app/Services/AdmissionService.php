<?php

namespace App\Services;

use App\Jobs\SendApplicationStatusNotification;
use App\Models\Student;
use App\Models\AdmissionApplication;
use App\Notifications\ApplicationStatusUpdated;
use Illuminate\Support\Facades\Log;

class AdmissionService
{
    /**
     * Create a new draft admission application for a student.
     *
     * @param Student $student The student applying.
     * @param array $data Validated data for the application.
     * @return AdmissionApplication
     */
    public function createDraftApplication(Student $student, array $data): AdmissionApplication
    {
        // This is where business logic lives. For example, check for existing drafts.
        $existingDraft = $student->admissionApplications()->where('status', 'draft')->first();

        if ($existingDraft) {
            Log::info("Student {$student->id} already has a draft application. Returning existing one.");
            return $existingDraft;
        }

        // Create the new application
        return $student->admissionApplications()->create([
            ...$data,
            'application_date' => now(),
            'status' => 'draft' // Explicitly set status
        ]);
    }

    /**
     * Update the status of an admission application and notify the student.
     *
     * @param AdmissionApplication $application
     * @param string $newStatus
     * @return AdmissionApplication
     */
    public function updateApplicationStatus(AdmissionApplication $application, string $newStatus): AdmissionApplication
    {
        $oldStatus = $application->status;
        
        // Update the application status
        $application->update(['status' => $newStatus]);
        
        // Only send notification if status actually changed
        if ($oldStatus !== $newStatus) {
            // Dispatch notification job asynchronously
            SendApplicationStatusNotification::dispatch($application);
            
            Log::info("Application {$application->id} status updated from {$oldStatus} to {$newStatus}. Notification job dispatched.");
        }
        
        return $application;
    }
} 