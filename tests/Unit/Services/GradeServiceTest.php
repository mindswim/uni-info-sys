<?php

namespace Tests\Unit\Services;

use App\Exceptions\GradingDeadlinePassedException;
use App\Exceptions\InvalidGradeException;
use App\Exceptions\UnauthorizedGradeSubmissionException;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Services\GradeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesUsersWithRoles;

class GradeServiceTest extends TestCase
{
    use CreatesUsersWithRoles, RefreshDatabase;

    protected GradeService $gradeService;

    protected User $instructorUser;

    protected Staff $instructor;

    protected User $studentUser;

    protected Student $student;

    protected CourseSection $courseSection;

    protected Enrollment $enrollment;

    protected Term $term;

    protected function setUp(): void
    {
        parent::setUp();

        $this->gradeService = new GradeService;

        // Create term with grade deadline in the future
        $this->term = Term::factory()->create([
            'name' => 'Fall 2025',
            'start_date' => now()->subMonths(2),
            'end_date' => now()->addMonths(2),
            'grade_deadline' => now()->addWeeks(2),
        ]);

        $this->seedPermissions();

        // Create instructor
        $this->instructorUser = User::factory()->create();
        $this->instructor = Staff::factory()->create([
            'user_id' => $this->instructorUser->id,
        ]);
        $facultyRole = Role::firstOrCreate(['name' => 'faculty']);
        $this->instructorUser->roles()->attach($facultyRole);

        // Create student
        $this->studentUser = User::factory()->create();
        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
        ]);
        $studentRole = Role::where('name', 'student')->first();
        $this->studentUser->roles()->attach($studentRole);

        // Create course and section
        $course = Course::factory()->create([
            'credits' => 3,
        ]);

        $this->courseSection = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $this->term->id,
            'instructor_id' => $this->instructor->id,
        ]);

        // Create enrollment
        $this->enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
            'grade' => null,
        ]);
    }

    /** @test */
    public function it_can_submit_a_valid_grade()
    {
        $result = $this->gradeService->submitGrade(
            $this->enrollment,
            'A',
            $this->instructorUser->id
        );

        $this->assertEquals('A', $result->grade);
        $this->assertEquals('completed', $result->status);
        $this->assertNotNull($result->completion_date);
    }

    /** @test */
    public function it_validates_grade_format()
    {
        $this->expectException(InvalidGradeException::class);
        $this->expectExceptionMessage('Invalid grade');

        $this->gradeService->submitGrade(
            $this->enrollment,
            'Z', // Invalid grade
            $this->instructorUser->id
        );
    }

    /** @test */
    public function it_accepts_all_valid_letter_grades()
    {
        $validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

        foreach ($validGrades as $grade) {
            $student = Student::factory()->create(['user_id' => User::factory()->create()->id]);
            $enrollment = Enrollment::factory()->create([
                'student_id' => $student->id,
                'course_section_id' => $this->courseSection->id,
                'status' => 'enrolled',
            ]);

            $result = $this->gradeService->submitGrade(
                $enrollment,
                $grade,
                $this->instructorUser->id
            );

            $this->assertEquals($grade, $result->grade);
        }
    }

    /** @test */
    public function it_accepts_special_grades()
    {
        $specialGrades = ['P', 'NP', 'W', 'I'];

        foreach ($specialGrades as $grade) {
            $student = Student::factory()->create(['user_id' => User::factory()->create()->id]);
            $enrollment = Enrollment::factory()->create([
                'student_id' => $student->id,
                'course_section_id' => $this->courseSection->id,
                'status' => 'enrolled',
            ]);

            $result = $this->gradeService->submitGrade(
                $enrollment,
                $grade,
                $this->instructorUser->id
            );

            $this->assertEquals($grade, $result->grade);
        }
    }

    /** @test */
    public function it_prevents_unauthorized_users_from_submitting_grades()
    {
        $unauthorizedUser = User::factory()->create();
        $unauthorizedUser->roles()->attach(Role::where('name', 'student')->first());

        $this->expectException(UnauthorizedGradeSubmissionException::class);

        $this->gradeService->submitGrade(
            $this->enrollment,
            'A',
            $unauthorizedUser->id
        );
    }

    /** @test */
    public function admin_can_submit_grades_for_any_section()
    {
        $adminUser = $this->createAdminUser();

        $result = $this->gradeService->submitGrade(
            $this->enrollment,
            'A',
            $adminUser->id
        );

        $this->assertEquals('A', $result->grade);
    }

    /** @test */
    public function it_enforces_grading_deadline_for_non_admins()
    {
        // Set grade deadline in the past
        $this->term->update(['grade_deadline' => now()->subWeeks(1)]);
        // Reload enrollment fresh so its courseSection->term reflects the updated deadline
        $enrollment = Enrollment::find($this->enrollment->id);

        $this->expectException(GradingDeadlinePassedException::class);

        $this->gradeService->submitGrade(
            $enrollment,
            'A',
            $this->instructorUser->id
        );
    }

    /** @test */
    public function admin_can_submit_grades_after_deadline()
    {
        // Set grade deadline in the past
        $this->term->update(['grade_deadline' => now()->subWeeks(1)]);

        $adminUser = $this->createAdminUser();

        $result = $this->gradeService->submitGrade(
            $this->enrollment,
            'A',
            $adminUser->id
        );

        $this->assertEquals('A', $result->grade);
    }

    /** @test */
    public function it_can_submit_bulk_grades()
    {
        // Create multiple enrollments with distinct students
        $enrollments = collect();
        for ($i = 0; $i < 5; $i++) {
            $enrollments->push(Enrollment::factory()->create([
                'student_id' => Student::factory()->create(['user_id' => User::factory()->create()->id])->id,
                'course_section_id' => $this->courseSection->id,
                'status' => 'enrolled',
            ]));
        }

        $grades = [
            $enrollments[0]->id => 'A',
            $enrollments[1]->id => 'B+',
            $enrollments[2]->id => 'B',
            $enrollments[3]->id => 'C+',
            $enrollments[4]->id => 'A-',
        ];

        $result = $this->gradeService->bulkSubmitGrades(
            $this->courseSection,
            $grades,
            $this->instructorUser->id
        );

        $this->assertEquals(5, $result['successful']);
        $this->assertEquals(0, count($result['failed']));
        $this->assertEquals(5, $result['total']);

        // Verify grades were saved
        foreach ($grades as $enrollmentId => $grade) {
            $enrollment = Enrollment::find($enrollmentId);
            $this->assertEquals($grade, $enrollment->grade);
        }
    }

    /** @test */
    public function bulk_submission_continues_on_error_and_reports_failures()
    {
        $enrollment1 = Enrollment::factory()->create([
            'student_id' => Student::factory()->create(['user_id' => User::factory()->create()->id])->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
            'grade' => null,
        ]);

        $enrollment2 = Enrollment::factory()->create([
            'student_id' => Student::factory()->create(['user_id' => User::factory()->create()->id]),
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
            'grade' => null,
        ]);

        $grades = [
            $enrollment1->id => 'A',
            $enrollment2->id => 'INVALID', // This should fail
        ];

        $result = $this->gradeService->bulkSubmitGrades(
            $this->courseSection,
            $grades,
            $this->instructorUser->id
        );

        $this->assertEquals(1, $result['successful']);
        $this->assertEquals(1, count($result['failed']));
        $this->assertArrayHasKey($enrollment2->id, $result['failed']);

        // First enrollment should have grade
        $this->assertEquals('A', $enrollment1->fresh()->grade);

        // Second enrollment should not have grade
        $this->assertNull($enrollment2->fresh()->grade);
    }

    /** @test */
    public function it_calculates_grade_distribution()
    {
        // Create enrollments with various grades
        $this->createEnrollmentWithGrade('A', 3);
        $this->createEnrollmentWithGrade('B', 2);
        $this->createEnrollmentWithGrade('C', 1);

        $distribution = $this->gradeService->calculateGradeDistribution($this->courseSection);

        $this->assertEquals(6, $distribution['total_students']);
        $this->assertEquals(3, $distribution['distribution']['A']['count']);
        $this->assertEquals(50, $distribution['distribution']['A']['percentage']);
        $this->assertEquals(2, $distribution['distribution']['B']['count']);
        $this->assertEquals(33.33, $distribution['distribution']['B']['percentage']);
    }

    /** @test */
    public function it_tracks_grading_progress()
    {
        // Use a fresh course section to avoid setUp enrollment interference
        $freshSection = CourseSection::factory()->create([
            'course_id' => Course::factory()->create(['credits' => 3])->id,
            'term_id' => $this->term->id,
            'instructor_id' => $this->instructor->id,
        ]);

        // Create 10 enrollments, grade 6 of them
        for ($i = 0; $i < 10; $i++) {
            $enrollment = Enrollment::factory()->create([
                'student_id' => Student::factory()->create(['user_id' => User::factory()->create()->id]),
                'course_section_id' => $freshSection->id,
                'status' => 'enrolled',
                'grade' => null,
            ]);

            if ($i < 6) {
                $this->gradeService->submitGrade($enrollment, 'A', $this->instructorUser->id);
            }
        }

        $progress = $this->gradeService->getGradingProgress($freshSection);

        $this->assertEquals(10, $progress['total']);
        $this->assertEquals(6, $progress['graded']);
        $this->assertEquals(4, $progress['pending']);
        $this->assertEquals(60, $progress['percentage']);
        $this->assertFalse($progress['is_complete']);
    }

    /** @test */
    public function grading_progress_shows_complete_when_all_graded()
    {
        $freshSection = CourseSection::factory()->create([
            'course_id' => Course::factory()->create(['credits' => 3])->id,
            'term_id' => $this->term->id,
            'instructor_id' => $this->instructor->id,
        ]);

        for ($i = 0; $i < 5; $i++) {
            $enrollment = Enrollment::factory()->create([
                'student_id' => Student::factory()->create(['user_id' => User::factory()->create()->id]),
                'course_section_id' => $freshSection->id,
                'status' => 'enrolled',
                'grade' => null,
            ]);
            $this->gradeService->submitGrade($enrollment, 'A', $this->instructorUser->id);
        }

        $progress = $this->gradeService->getGradingProgress($freshSection);

        $this->assertTrue($progress['is_complete']);
        $this->assertEquals(100, $progress['percentage']);
    }

    /** @test */
    public function it_can_create_grade_change_request()
    {
        // First, assign a grade
        $this->gradeService->submitGrade($this->enrollment, 'B', $this->instructorUser->id);

        // Then request a change
        $request = $this->gradeService->requestGradeChange(
            $this->enrollment->fresh(),
            'A',
            'Student submitted extra credit work',
            $this->instructorUser->id
        );

        $this->assertEquals('B', $request->old_grade);
        $this->assertEquals('A', $request->new_grade);
        $this->assertEquals('pending', $request->status);
        $this->assertEquals($this->enrollment->id, $request->enrollment_id);
    }

    /** @test */
    public function it_prevents_grade_change_request_for_ungraded_enrollment()
    {
        $this->expectException(InvalidGradeException::class);
        $this->expectExceptionMessage('without existing grade');

        $this->gradeService->requestGradeChange(
            $this->enrollment,
            'A',
            'Test reason',
            $this->instructorUser->id
        );
    }

    /** @test */
    public function it_can_approve_grade_change_request()
    {
        // Assign initial grade
        $this->gradeService->submitGrade($this->enrollment, 'B', $this->instructorUser->id);

        // Create change request
        $changeRequest = $this->gradeService->requestGradeChange(
            $this->enrollment->fresh(),
            'A',
            'Extra credit work',
            $this->instructorUser->id
        );

        // Approve the change
        $adminUser = $this->createAdminUser();

        $result = $this->gradeService->approveGradeChange($changeRequest, $adminUser->id);

        $this->assertEquals('A', $result->grade);
        $this->assertEquals('approved', $changeRequest->fresh()->status);
        $this->assertEquals($adminUser->id, $changeRequest->fresh()->approved_by);
    }

    /** @test */
    public function it_can_deny_grade_change_request()
    {
        // Assign initial grade
        $this->gradeService->submitGrade($this->enrollment, 'B', $this->instructorUser->id);

        // Create change request
        $changeRequest = $this->gradeService->requestGradeChange(
            $this->enrollment->fresh(),
            'A',
            'Extra credit work',
            $this->instructorUser->id
        );

        // Deny the change
        $adminUser = $this->createAdminUser();

        $result = $this->gradeService->denyGradeChange(
            $changeRequest,
            $adminUser->id,
            'Insufficient justification'
        );

        // Grade should remain unchanged
        $this->assertEquals('B', $this->enrollment->fresh()->grade);
        $this->assertEquals('denied', $result->status);
        $this->assertEquals('Insufficient justification', $result->denial_reason);
    }

    /** @test */
    public function it_returns_valid_grades_list()
    {
        $validGrades = GradeService::getValidGrades();

        $this->assertIsArray($validGrades);
        $this->assertContains('A', $validGrades);
        $this->assertContains('B+', $validGrades);
        $this->assertContains('F', $validGrades);
        $this->assertContains('P', $validGrades);
        $this->assertContains('W', $validGrades);
    }

    /** @test */
    public function it_returns_correct_grade_points()
    {
        $this->assertEquals(4.0, GradeService::getGradePoints('A'));
        $this->assertEquals(3.7, GradeService::getGradePoints('A-'));
        $this->assertEquals(3.3, GradeService::getGradePoints('B+'));
        $this->assertEquals(3.0, GradeService::getGradePoints('B'));
        $this->assertEquals(0.0, GradeService::getGradePoints('F'));
        $this->assertNull(GradeService::getGradePoints('P')); // Pass doesn't count in GPA
        $this->assertNull(GradeService::getGradePoints('W')); // Withdrawn doesn't count in GPA
    }

    /**
     * Helper method to create enrollments with grades
     */
    private function createEnrollmentWithGrade(string $grade, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            $enrollment = Enrollment::factory()->create([
                'student_id' => Student::factory()->create(['user_id' => User::factory()->create()->id]),
                'course_section_id' => $this->courseSection->id,
                'status' => 'enrolled',
            ]);

            $this->gradeService->submitGrade($enrollment, $grade, $this->instructorUser->id);
        }
    }
}
