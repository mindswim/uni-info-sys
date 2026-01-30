<?php

namespace Tests\Unit\Jobs;

use App\Jobs\ProcessWaitlistPromotion;
use App\Jobs\SendApplicationStatusNotification;
use App\Jobs\SendEnrollmentConfirmation;
use App\Models\AdmissionApplication;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use App\Services\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class BackgroundJobsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function send_enrollment_confirmation_job_handles_enrolled_status()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $enrollment = Enrollment::factory()->create(['student_id' => $student->id]);

        $job = new SendEnrollmentConfirmation($enrollment, 'enrolled');

        Log::shouldReceive('info')->once()->with(
            'Processing enrollment confirmation notification',
            \Mockery::type('array')
        );

        Log::shouldReceive('info')->once()->with(
            'Enrollment confirmation sent',
            \Mockery::type('array')
        );

        $job->handle();

        $this->assertTrue(true); // Job completed without throwing exceptions
    }

    /** @test */
    public function send_enrollment_confirmation_job_handles_waitlisted_status()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $enrollment = Enrollment::factory()->create(['student_id' => $student->id]);

        $job = new SendEnrollmentConfirmation($enrollment, 'waitlisted');

        Log::shouldReceive('info')->once()->with(
            'Processing enrollment confirmation notification',
            \Mockery::type('array')
        );

        Log::shouldReceive('info')->once()->with(
            'Enrollment confirmation sent',
            \Mockery::type('array')
        );

        $job->handle();

        $this->assertTrue(true); // Job completed without throwing exceptions
    }

    /** @test */
    public function send_enrollment_confirmation_job_logs_correctly()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $enrollment = Enrollment::factory()->create(['student_id' => $student->id]);

        $job = new SendEnrollmentConfirmation($enrollment, 'enrolled');

        Log::shouldReceive('info')->once()->with(
            'Processing enrollment confirmation notification',
            \Mockery::type('array')
        );

        Log::shouldReceive('info')->once()->with(
            'Enrollment confirmation sent',
            \Mockery::type('array')
        );

        $job->handle();

        $this->assertTrue(true); // Job completed without throwing exceptions
    }

    /** @test */
    public function send_application_status_notification_job_works()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $application = AdmissionApplication::factory()->create(['student_id' => $student->id]);

        $job = new SendApplicationStatusNotification($application);

        Log::shouldReceive('info')->once()->with(
            'Processing application status notification',
            \Mockery::type('array')
        );

        Log::shouldReceive('info')->once()->with(
            'Application status notification sent successfully',
            \Mockery::type('array')
        );

        $job->handle();

        $this->assertTrue(true); // Job completed without throwing exceptions
    }

    /** @test */
    public function process_waitlist_promotion_job_works()
    {
        $courseSection = CourseSection::factory()->create();
        $enrollmentService = $this->createMock(EnrollmentService::class);

        $enrollmentService->expects($this->once())
            ->method('promoteFromWaitlist')
            ->with($courseSection)
            ->willReturn(null);

        $job = new ProcessWaitlistPromotion($courseSection);

        Log::shouldReceive('info')->once()->with(
            'Processing waitlist promotion',
            \Mockery::type('array')
        );

        Log::shouldReceive('info')->once()->with(
            'No students available for waitlist promotion',
            \Mockery::type('array')
        );

        $job->handle($enrollmentService);

        $this->assertTrue(true); // Job completed without throwing exceptions
    }

    /** @test */
    public function process_waitlist_promotion_job_dispatches_confirmation_when_promotion_occurs()
    {
        Queue::fake();

        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $courseSection = CourseSection::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ]);

        $enrollmentService = $this->createMock(EnrollmentService::class);

        $enrollmentService->expects($this->once())
            ->method('promoteFromWaitlist')
            ->with($courseSection)
            ->willReturn($enrollment);

        $job = new ProcessWaitlistPromotion($courseSection);

        Log::shouldReceive('info')->twice(); // Once for processing, once for promotion

        $job->handle($enrollmentService);

        Queue::assertPushed(SendEnrollmentConfirmation::class);
    }

    /** @test */
    public function jobs_are_queued()
    {
        Queue::fake();

        // Create models with minimal data to avoid database interactions
        $enrollment = new Enrollment(['id' => 1]);
        $application = new AdmissionApplication(['id' => 1]);
        $courseSection = new CourseSection(['id' => 1]);

        // Test job dispatching
        SendEnrollmentConfirmation::dispatch($enrollment, 'enrolled');
        SendApplicationStatusNotification::dispatch($application);
        ProcessWaitlistPromotion::dispatch($courseSection);

        Queue::assertPushed(SendEnrollmentConfirmation::class);
        Queue::assertPushed(SendApplicationStatusNotification::class);
        Queue::assertPushed(ProcessWaitlistPromotion::class);
    }

    /** @test */
    public function jobs_implement_should_queue_interface()
    {
        // Create minimal model instances without database interaction
        $enrollment = new Enrollment(['id' => 1]);
        $application = new AdmissionApplication(['id' => 1]);
        $courseSection = new CourseSection(['id' => 1]);

        $this->assertInstanceOf(
            \Illuminate\Contracts\Queue\ShouldQueue::class,
            new SendEnrollmentConfirmation($enrollment)
        );

        $this->assertInstanceOf(
            \Illuminate\Contracts\Queue\ShouldQueue::class,
            new SendApplicationStatusNotification($application)
        );

        $this->assertInstanceOf(
            \Illuminate\Contracts\Queue\ShouldQueue::class,
            new ProcessWaitlistPromotion($courseSection)
        );
    }
}
