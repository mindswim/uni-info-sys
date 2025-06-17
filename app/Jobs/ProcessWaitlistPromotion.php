<?php

namespace App\Jobs;

use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessWaitlistPromotion implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public CourseSection $courseSection
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(EnrollmentService $enrollmentService): void
    {
        Log::info('Processing waitlist promotion', [
            'course_section_id' => $this->courseSection->id,
        ]);

        try {
            // Attempt to promote a student from the waitlist
            $promotedEnrollment = $enrollmentService->promoteFromWaitlist($this->courseSection);

            if ($promotedEnrollment) {
                Log::info('Student promoted from waitlist', [
                    'enrollment_id' => $promotedEnrollment->id,
                    'student_id' => $promotedEnrollment->student_id,
                    'course_section_id' => $this->courseSection->id,
                ]);

                // Send confirmation notification for the promotion
                SendEnrollmentConfirmation::dispatch($promotedEnrollment, 'promoted');
                
            } else {
                Log::info('No students available for waitlist promotion', [
                    'course_section_id' => $this->courseSection->id,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to process waitlist promotion', [
                'course_section_id' => $this->courseSection->id,
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
        Log::error('ProcessWaitlistPromotion job failed', [
            'course_section_id' => $this->courseSection->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
