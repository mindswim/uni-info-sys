<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use App\Services\GradebookService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradebookTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $studentUser;
    protected Student $student;
    protected CourseSection $courseSection;
    protected Enrollment $enrollment;
    protected GradebookService $gradebookService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        // Create admin user
        $this->adminUser = User::factory()->create();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        $this->adminUser->roles()->attach($adminRole);

        // Create course section
        $this->courseSection = CourseSection::factory()->create();

        // Create student with enrollment
        $this->studentUser = User::factory()->create();
        $studentRole = \App\Models\Role::where('name', 'student')->first();
        $this->studentUser->roles()->attach($studentRole);

        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
        $this->enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        $this->gradebookService = new GradebookService();
    }

    public function test_calculates_current_grade_with_unweighted_assignments(): void
    {
        // Create assignments without weights
        $assignment1 = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
            'weight' => null,
        ]);

        $assignment2 = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 50,
            'weight' => null,
        ]);

        // Create graded submissions
        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment1->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 90,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment2->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 40,
        ]);

        $result = $this->gradebookService->calculateCurrentGrade($this->enrollment);

        // 90/100 + 40/50 = 130/150 = 86.67%
        $this->assertEqualsWithDelta(86.67, $result['percentage'], 0.01);
        $this->assertEquals('B', $result['letter_grade']); // 86.67% falls in B range (83-86.99)
        $this->assertEquals(2, $result['graded_count']);
    }

    public function test_calculates_current_grade_with_weighted_assignments(): void
    {
        // Create weighted assignments
        $homework = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
            'weight' => 30, // 30% of grade
        ]);

        $exam = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
            'weight' => 70, // 70% of grade
        ]);

        // 100% on homework (30 points), 80% on exam (56 points) = 86%
        AssignmentSubmission::factory()->create([
            'assignment_id' => $homework->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $exam->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 80,
        ]);

        $result = $this->gradebookService->calculateCurrentGrade($this->enrollment);

        // (100/100 * 30) + (80/100 * 70) = 30 + 56 = 86%
        $this->assertEquals(86, $result['percentage']);
        $this->assertEquals('B', $result['letter_grade']);
    }

    public function test_returns_null_grade_when_no_assignments(): void
    {
        $result = $this->gradebookService->calculateCurrentGrade($this->enrollment);

        $this->assertNull($result['percentage']);
        $this->assertNull($result['letter_grade']);
        $this->assertEquals(0, $result['total_assignments']);
    }

    public function test_returns_null_grade_when_no_graded_submissions(): void
    {
        Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
        ]);

        $result = $this->gradebookService->calculateCurrentGrade($this->enrollment);

        $this->assertNull($result['percentage']);
        $this->assertNull($result['letter_grade']);
        $this->assertEquals(0, $result['graded_count']);
    }

    public function test_gets_student_gradebook(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'score' => 90,
            'final_score' => 90,
        ]);

        $gradebook = $this->gradebookService->getStudentGradebook($this->enrollment);

        $this->assertArrayHasKey('student', $gradebook);
        $this->assertArrayHasKey('course', $gradebook);
        $this->assertArrayHasKey('current_grade', $gradebook);
        $this->assertArrayHasKey('items', $gradebook);
        $this->assertCount(1, $gradebook['items']);
        $this->assertEquals(90, $gradebook['items'][0]['final_score']);
    }

    public function test_gets_grades_by_category(): void
    {
        // Create homework and exam
        $homework = Assignment::factory()->homework()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 50,
        ]);

        $exam = Assignment::factory()->exam()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $homework->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 45,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $exam->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 85,
        ]);

        $categories = $this->gradebookService->getGradesByCategory($this->enrollment);

        $this->assertCount(2, $categories);

        $homeworkCategory = collect($categories)->firstWhere('type', 'homework');
        $examCategory = collect($categories)->firstWhere('type', 'exam');

        $this->assertEquals(90, $homeworkCategory['percentage']); // 45/50
        $this->assertEquals(85, $examCategory['percentage']); // 85/100
    }

    public function test_calculates_needed_score_for_target_grade(): void
    {
        $assignment1 = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
            'weight' => null,
        ]);

        $assignment2 = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
            'weight' => null,
        ]);

        // Student got 80% on first assignment
        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment1->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 80,
        ]);

        // Need 90% overall for A-
        // Current: 80/100, Need: 180/200 = 90%
        // Need 100/100 on remaining assignment
        $result = $this->gradebookService->calculateNeededScore($this->enrollment, 'A-');

        $this->assertTrue($result['achievable']);
        $this->assertEquals(100, $result['needed_percentage']);
    }

    public function test_api_gets_student_gradebook(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 85,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/enrollments/{$this->enrollment->id}/gradebook");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'student',
                    'course',
                    'current_grade' => [
                        'percentage',
                        'letter_grade',
                        'grade_points',
                    ],
                    'items',
                ],
            ]);
    }

    public function test_api_gets_class_gradebook(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
        ]);

        AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$this->courseSection->id}/gradebook");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'course_section',
                    'assignments',
                    'students',
                    'statistics',
                ],
            ]);
    }

    public function test_api_exports_gradebook_csv(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
        ]);

        AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->get("/api/v1/course-sections/{$this->courseSection->id}/gradebook/export");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        $this->assertStringContainsString('Student ID', $response->getContent());
    }

    public function test_api_calculates_needed_score(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 80,
        ]);

        // Create ungraded assignment
        Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/enrollments/{$this->enrollment->id}/gradebook/needed?target_grade=A");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'achievable',
                    'needed_percentage',
                    'message',
                ],
            ]);
    }

    public function test_api_finalizes_grades(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 85,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/course-sections/{$this->courseSection->id}/gradebook/finalize");

        $response->assertStatus(200);

        $this->enrollment->refresh();
        $this->assertEquals('completed', $this->enrollment->status);
        $this->assertNotNull($this->enrollment->grade);
    }

    public function test_student_can_view_own_grades(): void
    {
        $assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'max_points' => 100,
        ]);

        AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'graded',
            'final_score' => 92,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/v1/gradebook/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'enrollment_id',
                        'course_code',
                        'current_grade',
                    ],
                ],
            ]);
    }

    public function test_letter_grade_conversion(): void
    {
        $this->assertEquals('A+', $this->gradebookService->percentageToLetterGrade(100));
        $this->assertEquals('A+', $this->gradebookService->percentageToLetterGrade(97));
        $this->assertEquals('A', $this->gradebookService->percentageToLetterGrade(95));
        $this->assertEquals('A-', $this->gradebookService->percentageToLetterGrade(90));
        $this->assertEquals('B+', $this->gradebookService->percentageToLetterGrade(88));
        $this->assertEquals('B', $this->gradebookService->percentageToLetterGrade(85));
        $this->assertEquals('C', $this->gradebookService->percentageToLetterGrade(75));
        $this->assertEquals('D', $this->gradebookService->percentageToLetterGrade(65));
        $this->assertEquals('F', $this->gradebookService->percentageToLetterGrade(50));
        $this->assertEquals('F', $this->gradebookService->percentageToLetterGrade(0));
    }
}
