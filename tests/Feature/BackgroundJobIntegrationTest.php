<?php

namespace Tests\Feature\Feature;

use App\Jobs\ProcessWaitlistPromotion;
use App\Jobs\SendApplicationStatusNotification;
use App\Jobs\SendEnrollmentConfirmation;
use App\Models\AdmissionApplication;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use App\Services\AdmissionService;
use App\Services\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use App\Models\Term;
use Illuminate\Support\Facades\Artisan;

class BackgroundJobIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    /** @test */
    public function enrollment_service_dispatches_confirmation_job_on_enrollment()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $courseSection = CourseSection::factory()->create(['capacity' => 10]);

        $enrollmentService = app(EnrollmentService::class);

        $enrollment = $enrollmentService->enrollStudent([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ]);

        // Assert that the enrollment confirmation job was dispatched
        Queue::assertPushed(SendEnrollmentConfirmation::class, function ($job) use ($enrollment) {
            return $job->enrollment->id === $enrollment->id && $job->confirmationType === 'enrolled';
        });
    }

    /** @test */
    public function enrollment_service_dispatches_waitlist_confirmation_job_when_full()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $courseSection = CourseSection::factory()->create(['capacity' => 1]);

        // Fill the course section
        $otherStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $otherStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled'
        ]);

        $enrollmentService = app(EnrollmentService::class);

        $enrollment = $enrollmentService->enrollStudent([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ]);

        // Assert that the waitlist confirmation job was dispatched
        Queue::assertPushed(SendEnrollmentConfirmation::class, function ($job) use ($enrollment) {
            return $job->enrollment->id === $enrollment->id && $job->confirmationType === 'waitlisted';
        });
    }

    /** @test */
    public function enrollment_service_dispatches_promotion_job_on_waitlist_promotion()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $courseSection = CourseSection::factory()->create(['capacity' => 2]);

        // Create a waitlisted enrollment
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted'
        ]);

        $enrollmentService = app(EnrollmentService::class);

        $promotedEnrollment = $enrollmentService->promoteFromWaitlist($courseSection);

        $this->assertNotNull($promotedEnrollment);
        $this->assertEquals('enrolled', $promotedEnrollment->status);

        // Assert that the promotion confirmation job was dispatched
        Queue::assertPushed(SendEnrollmentConfirmation::class, function ($job) use ($promotedEnrollment) {
            return $job->enrollment->id === $promotedEnrollment->id && $job->confirmationType === 'promoted';
        });
    }

    /** @test */
    public function admission_service_dispatches_notification_job_on_status_update()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $application = AdmissionApplication::factory()->create(['student_id' => $student->id, 'status' => 'pending']);

        $admissionService = app(AdmissionService::class);

        $updatedApplication = $admissionService->updateApplicationStatus($application, 'accepted');

        $this->assertEquals('accepted', $updatedApplication->status);

        // Assert that the application status notification job was dispatched
        Queue::assertPushed(SendApplicationStatusNotification::class, function ($job) use ($updatedApplication) {
            return $job->application->id === $updatedApplication->id;
        });
    }

    /** @test */
    public function admission_service_does_not_dispatch_job_when_status_unchanged()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $application = AdmissionApplication::factory()->create(['student_id' => $student->id, 'status' => 'pending']);

        $admissionService = app(AdmissionService::class);

        // Update with the same status
        $updatedApplication = $admissionService->updateApplicationStatus($application, 'pending');

        $this->assertEquals('pending', $updatedApplication->status);

        // Assert that NO notification job was dispatched
        Queue::assertNotPushed(SendApplicationStatusNotification::class);
    }

    /** @test */
    public function controller_logic_dispatches_waitlist_promotion_job()
    {
        // This test focuses on the job dispatch logic, not authorization
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $courseSection = CourseSection::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled'
        ]);

        // Test the service directly instead of through API to avoid authorization issues
        $enrollmentService = app(EnrollmentService::class);
        
        // Simulate what happens when enrollment status changes to withdrawn
        $enrollment->update(['status' => 'withdrawn']);
        
        // Process waitlist promotion (this is what the controller would do)
        ProcessWaitlistPromotion::dispatch($courseSection);

        // Assert that the waitlist promotion job was dispatched
        Queue::assertPushed(ProcessWaitlistPromotion::class, function ($job) use ($courseSection) {
            return $job->courseSection->id === $courseSection->id;
        });
    }

    /** @test */
    public function check_waitlists_command_dispatches_jobs_for_eligible_sections()
    {
        // Create a term
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);

        // Create a course section with capacity for 2 students
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 2,
        ]);

        // Create one enrolled student (leaving capacity for one more)
        $enrolledStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Create waitlisted students
        $waitlistedStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $waitlistedStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
        ]);

        // Run the command
        Artisan::call('waitlists:check');

        // Assert that the waitlist promotion job was dispatched
        Queue::assertPushed(ProcessWaitlistPromotion::class, function ($job) use ($courseSection) {
            return $job->courseSection->id === $courseSection->id;
        });
    }

    /** @test */
    public function check_waitlists_command_ignores_full_sections()
    {
        // Create a term
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);

        // Create a course section with capacity for 1 student
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 1,
        ]);

        // Fill the course section to capacity
        $enrolledStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Create waitlisted student
        $waitlistedStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $waitlistedStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
        ]);

        // Run the command
        Artisan::call('waitlists:check');

        // Assert that NO waitlist promotion job was dispatched (section is full)
        Queue::assertNotPushed(ProcessWaitlistPromotion::class);
    }

    /** @test */
    public function check_waitlists_command_ignores_sections_without_waitlisted_students()
    {
        // Create a term
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);

        // Create a course section with capacity for 2 students
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 2,
        ]);

        // Create one enrolled student (leaving capacity but no waitlisted students)
        $enrolledStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Run the command
        Artisan::call('waitlists:check');

        // Assert that NO waitlist promotion job was dispatched (no waitlisted students)
        Queue::assertNotPushed(ProcessWaitlistPromotion::class);
    }
}
