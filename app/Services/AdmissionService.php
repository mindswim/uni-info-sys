<?php

namespace App\Services;

use App\Exceptions\BusinessRuleViolationException;
use App\Exceptions\InvalidApplicationStatusException;
use App\Jobs\SendApplicationStatusNotification;
use App\Models\AdmissionApplication;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdmissionService
{
    /**
     * Create a new draft admission application for a student.
     *
     * @param  Student  $student  The student applying.
     * @param  array  $data  Validated data for the application.
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
            'status' => 'draft', // Explicitly set status
        ]);
    }

    /**
     * Update the status of an admission application and notify the student.
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

    /**
     * Matriculate a student from an accepted application into enrolled status.
     *
     * Updates the student record (enrollment_status, major_program_id, admission_date,
     * class_standing, academic_status), finalizes program choices, and transitions
     * the application to 'enrolled'.
     *
     * @throws InvalidApplicationStatusException
     * @throws BusinessRuleViolationException
     */
    public function matriculateStudent(AdmissionApplication $application): AdmissionApplication
    {
        return DB::transaction(function () use ($application) {
            if ($application->status !== 'accepted') {
                throw new InvalidApplicationStatusException(
                    "Application must be accepted before enrollment. Current status: {$application->status}"
                );
            }

            $application->load(['student', 'programChoices.program']);
            $student = $application->student;

            if (! $student) {
                throw new BusinessRuleViolationException('Application has no associated student.');
            }

            if (! in_array($student->enrollment_status, ['prospective', null])) {
                throw new BusinessRuleViolationException(
                    "Student is already {$student->enrollment_status}. Cannot enroll again."
                );
            }

            // Find accepted program choice, or fall back to first by preference order
            $acceptedChoice = $application->programChoices
                ->where('status', 'accepted')
                ->first();

            if (! $acceptedChoice) {
                $acceptedChoice = $application->programChoices
                    ->sortBy('preference_order')
                    ->first();
            }

            if (! $acceptedChoice) {
                throw new BusinessRuleViolationException('Application has no program choices.');
            }

            // Update student record for matriculation
            $student->update([
                'enrollment_status' => 'full_time',
                'major_program_id' => $acceptedChoice->program_id,
                'admission_date' => now()->toDateString(),
                'class_standing' => 'freshman',
                'academic_status' => 'good_standing',
            ]);

            // Mark the chosen program as accepted
            $acceptedChoice->update(['status' => 'accepted']);

            // Reject all other program choices
            $application->programChoices()
                ->where('id', '!=', $acceptedChoice->id)
                ->update(['status' => 'rejected']);

            // Transition application to enrolled
            $application->update(['status' => 'enrolled']);

            // Create action item prompting the student to register for classes
            \App\Models\ActionItem::create([
                'student_id' => $student->id,
                'type' => \App\Models\ActionItem::TYPE_REGISTRATION,
                'title' => 'Register for classes',
                'description' => 'You have been admitted! Browse available courses and register for your first semester.',
                'priority' => \App\Models\ActionItem::PRIORITY_HIGH,
                'action_url' => '/student/registration',
                'action_label' => 'Register Now',
                'due_date' => now()->addDays(14),
                'source' => 'admission_system',
            ]);

            // Notify the student
            SendApplicationStatusNotification::dispatch($application);

            Log::info('Student matriculated', [
                'student_id' => $student->id,
                'application_id' => $application->id,
                'program_id' => $acceptedChoice->program_id,
            ]);

            return $application->fresh(['student.user', 'programChoices.program', 'term']);
        });
    }
}
