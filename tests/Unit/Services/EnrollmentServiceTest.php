<?php

namespace Tests\Unit\Services;

use App\Exceptions\CourseSectionUnavailableException;
use App\Exceptions\DuplicateEnrollmentException;
use App\Exceptions\EnrollmentCapacityExceededException;
use App\Exceptions\StudentNotActiveException;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Services\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Queue;

class EnrollmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private EnrollmentService $enrollmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->enrollmentService = new EnrollmentService();
    }

    public function test_enrolls_student_successfully_when_capacity_available()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline to avoid deadline validation
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 30,
        ]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act
        $enrollment = $this->enrollmentService->enrollStudent($data);

        // Assert
        $this->assertInstanceOf(Enrollment::class, $enrollment);
        $this->assertEquals($student->id, $enrollment->student_id);
        $this->assertEquals($courseSection->id, $enrollment->course_section_id);
        $this->assertEquals('enrolled', $enrollment->status);
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_waitlists_student_when_course_section_at_capacity()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline to avoid deadline validation
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 1,
        ]);

        // Fill the course section to capacity
        $enrolledStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act
        $enrollment = $this->enrollmentService->enrollStudent($data);

        // Assert
        $this->assertEquals('waitlisted', $enrollment->status);
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
        ]);
    }

    public function test_throws_exception_when_student_not_active()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => null]); // Not verified
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);
        $courseSection = CourseSection::factory()->create(['term_id' => $term->id]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act & Assert
        $this->expectException(StudentNotActiveException::class);
        $this->enrollmentService->enrollStudent($data);
    }

    public function test_throws_exception_when_course_section_in_past_term()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->subMonths(6)->toDateString(),
            'end_date' => now()->subMonths(2)->toDateString(), // Past term
        ]);
        $courseSection = CourseSection::factory()->create(['term_id' => $term->id]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act & Assert
        $this->expectException(CourseSectionUnavailableException::class);
        $this->enrollmentService->enrollStudent($data);
    }

    public function test_throws_exception_when_student_already_enrolled()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline to avoid deadline validation
        ]);
        $courseSection = CourseSection::factory()->create(['term_id' => $term->id]);

        // Create existing enrollment
        Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act & Assert
        $this->expectException(DuplicateEnrollmentException::class);
        $this->enrollmentService->enrollStudent($data);
    }

    public function test_throws_exception_when_requesting_enrolled_status_but_no_capacity()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline to avoid deadline validation
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 1,
        ]);

        // Fill the course section to capacity
        $enrolledStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled', // Explicitly requesting enrolled status
        ];

        // Act & Assert
        $this->expectException(EnrollmentCapacityExceededException::class);
        $this->enrollmentService->enrollStudent($data);
    }

    public function test_promotes_from_waitlist_successfully()
    {
        // Arrange
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 2,
        ]);

        // Create one enrolled student
        $enrolledStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Create waitlisted students
        $waitlistedStudent1 = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        $waitlistedEnrollment1 = Enrollment::factory()->create([
            'student_id' => $waitlistedStudent1->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
            'created_at' => now()->subHours(2), // Earlier created
        ]);

        $waitlistedStudent2 = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $waitlistedStudent2->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
            'created_at' => now()->subHours(1), // Later created
        ]);

        // Act
        $promotedEnrollment = $this->enrollmentService->promoteFromWaitlist($courseSection);

        // Assert
        $this->assertNotNull($promotedEnrollment);
        $this->assertEquals($waitlistedEnrollment1->id, $promotedEnrollment->id);
        $this->assertEquals('enrolled', $promotedEnrollment->status);
        $this->assertDatabaseHas('enrollments', [
            'id' => $waitlistedEnrollment1->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_promotes_from_waitlist_returns_null_when_no_capacity()
    {
        // Arrange
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 1,
        ]);

        // Fill the course section to capacity
        $enrolledStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Create waitlisted student
        $waitlistedStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $waitlistedStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
        ]);

        // Act
        $result = $this->enrollmentService->promoteFromWaitlist($courseSection);

        // Assert
        $this->assertNull($result);
    }

    public function test_promotes_from_waitlist_returns_null_when_no_waitlisted_students()
    {
        // Arrange
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 2,
        ]);

        // Create one enrolled student (capacity available but no waitlisted students)
        $enrolledStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['email_verified_at' => now()])->id
        ]);
        Enrollment::factory()->create([
            'student_id' => $enrolledStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Act
        $result = $this->enrollmentService->promoteFromWaitlist($courseSection);

        // Assert
        $this->assertNull($result);
    }

    public function test_withdraw_student_successfully()
    {
        Queue::fake();
        
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 2,
        ]);
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Act
        $result = $this->enrollmentService->withdrawStudent($enrollment);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'withdrawn',
        ]);
        
        // Assert that waitlist promotion job was dispatched
        Queue::assertPushed(\App\Jobs\ProcessWaitlistPromotion::class, function ($job) use ($courseSection) {
            return $job->courseSection->id === $courseSection->id;
        });
    }

    public function test_withdraw_student_from_waitlist_does_not_dispatch_promotion_job()
    {
        Queue::fake();
        
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 2,
        ]);
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'waitlisted',
        ]);

        // Act
        $result = $this->enrollmentService->withdrawStudent($enrollment);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'withdrawn',
        ]);
        
        // Assert that NO waitlist promotion job was dispatched
        Queue::assertNotPushed(\App\Jobs\ProcessWaitlistPromotion::class);
    }

    public function test_throws_exception_when_enrollment_deadline_has_passed()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->subDays(1), // Past deadline
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 30,
        ]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act & Assert
        $this->expectException(\App\Exceptions\CourseSectionUnavailableException::class);
        $this->expectExceptionMessage('The add/drop deadline for this term has passed. Enrollment is no longer allowed.');
        $this->enrollmentService->enrollStudent($data);
    }

    public function test_throws_exception_when_withdrawal_deadline_has_passed()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->subDays(1), // Past deadline
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 30,
        ]);
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Act & Assert
        $this->expectException(\App\Exceptions\CourseSectionUnavailableException::class);
        $this->expectExceptionMessage('The add/drop deadline for this term has passed. Withdrawal is no longer allowed.');
        $this->enrollmentService->withdrawStudent($enrollment);
    }

    public function test_allows_enrollment_when_no_deadline_is_set()
    {
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => null, // No deadline set
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 30,
        ]);

        $data = [
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
        ];

        // Act
        $enrollment = $this->enrollmentService->enrollStudent($data);

        // Assert
        $this->assertInstanceOf(\App\Models\Enrollment::class, $enrollment);
        $this->assertEquals('enrolled', $enrollment->status);
    }

    public function test_allows_withdrawal_when_no_deadline_is_set()
    {
        Queue::fake();
        
        // Arrange
        $user = User::factory()->create(['email_verified_at' => now()]);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => null, // No deadline set
        ]);
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'capacity' => 30,
        ]);
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Act
        $result = $this->enrollmentService->withdrawStudent($enrollment);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'withdrawn',
        ]);
    }
}
