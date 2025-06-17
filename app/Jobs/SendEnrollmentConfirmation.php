<?php

namespace App\Jobs;

use App\Models\Enrollment;
use App\Notifications\ApplicationStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendEnrollmentConfirmation implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Enrollment $enrollment,
        public string $confirmationType = 'enrolled'
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing enrollment confirmation notification', [
            'enrollment_id' => $this->enrollment->id,
            'student_id' => $this->enrollment->student_id,
            'confirmation_type' => $this->confirmationType,
        ]);

        try {
            // Load the enrollment with necessary relationships
            $this->enrollment->load(['student.user', 'courseSection.course']);

            $user = $this->enrollment->student->user;
            
            if (!$user) {
                Log::warning('Cannot send enrollment confirmation - student has no user account', [
                    'enrollment_id' => $this->enrollment->id,
                    'student_id' => $this->enrollment->student_id,
                ]);
                return;
            }

            // Send notification based on enrollment status
            $message = $this->getConfirmationMessage();
            
            // For now, we'll log the notification
            // In a real implementation, you would send an email or push notification
            Log::info('Enrollment confirmation sent', [
                'user_id' => $user->id,
                'enrollment_id' => $this->enrollment->id,
                'message' => $message,
            ]);

            // Example of how you might send an actual notification:
            // $user->notify(new EnrollmentConfirmationNotification($this->enrollment, $this->confirmationType));

        } catch (\Exception $e) {
            Log::error('Failed to send enrollment confirmation', [
                'enrollment_id' => $this->enrollment->id,
                'error' => $e->getMessage(),
            ]);
            
            // Re-throw to mark the job as failed
            throw $e;
        }
    }

    /**
     * Get the appropriate confirmation message based on enrollment status
     */
    private function getConfirmationMessage(): string
    {
        $courseName = $this->enrollment->courseSection->course->name ?? 'Course';
        $sectionNumber = $this->enrollment->courseSection->section_number ?? 'N/A';

        return match ($this->confirmationType) {
            'enrolled' => "You have been successfully enrolled in {$courseName} (Section {$sectionNumber}).",
            'waitlisted' => "You have been added to the waitlist for {$courseName} (Section {$sectionNumber}).",
            'promoted' => "Great news! You have been promoted from the waitlist and are now enrolled in {$courseName} (Section {$sectionNumber}).",
            default => "Your enrollment status for {$courseName} (Section {$sectionNumber}) has been updated.",
        };
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendEnrollmentConfirmation job failed', [
            'enrollment_id' => $this->enrollment->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
