<?php

namespace App\Jobs;

use App\Models\AdmissionApplication;
use App\Notifications\ApplicationStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendApplicationStatusNotification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public AdmissionApplication $application
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing application status notification', [
            'application_id' => $this->application->id,
            'student_id' => $this->application->student_id,
            'status' => $this->application->status,
        ]);

        try {
            // Load the application with necessary relationships
            $this->application->load(['student.user']);

            $user = $this->application->student->user;

            if (! $user) {
                Log::warning('Cannot send application status notification - student has no user account', [
                    'application_id' => $this->application->id,
                    'student_id' => $this->application->student_id,
                ]);

                return;
            }

            // Send the notification
            $user->notify(new ApplicationStatusUpdated($this->application));

            Log::info('Application status notification sent successfully', [
                'user_id' => $user->id,
                'application_id' => $this->application->id,
                'status' => $this->application->status,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send application status notification', [
                'application_id' => $this->application->id,
                'error' => $e->getMessage(),
            ]);

            // Re-throw to mark the job as failed
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendApplicationStatusNotification job failed', [
            'application_id' => $this->application->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
