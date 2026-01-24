<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->adminUser = User::factory()->create();
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $this->adminUser->roles()->attach($adminRole);
        }
    }

    public function test_assignment_calculates_days_late_correctly(): void
    {
        $assignment = Assignment::factory()->create([
            'due_date' => now()->subDays(3),
        ]);

        $this->assertEquals(3, $assignment->getDaysLate());
        $this->assertEquals(0, $assignment->getDaysLate(now()->subDays(5)));
    }

    public function test_assignment_calculates_late_penalty_correctly(): void
    {
        $assignment = Assignment::factory()->create([
            'late_penalty_per_day' => 10.00,
            'allows_late' => true,
        ]);

        $this->assertEquals(0, $assignment->calculateLatePenalty(0));
        $this->assertEquals(10, $assignment->calculateLatePenalty(1));
        $this->assertEquals(30, $assignment->calculateLatePenalty(3));
        $this->assertEquals(100, $assignment->calculateLatePenalty(15)); // Capped at 100
    }

    public function test_assignment_calculates_final_score_with_penalty(): void
    {
        $assignment = Assignment::factory()->create([
            'late_penalty_per_day' => 10.00,
            'max_points' => 100,
            'allows_late' => true,
        ]);

        // On time
        $this->assertEquals(85, $assignment->calculateFinalScore(85, 0));

        // 1 day late (10% penalty)
        $this->assertEquals(76.5, $assignment->calculateFinalScore(85, 1));

        // 3 days late (30% penalty)
        $this->assertEquals(59.5, $assignment->calculateFinalScore(85, 3));
    }

    public function test_assignment_is_available_check(): void
    {
        // Not published
        $unpublished = Assignment::factory()->create([
            'is_published' => false,
            'available_from' => now()->subDay(),
        ]);
        $this->assertFalse($unpublished->isAvailable());

        // Published but not yet available
        $notYetAvailable = Assignment::factory()->create([
            'is_published' => true,
            'available_from' => now()->addDay(),
        ]);
        $this->assertFalse($notYetAvailable->isAvailable());

        // Published and available
        $available = Assignment::factory()->create([
            'is_published' => true,
            'available_from' => now()->subDay(),
        ]);
        $this->assertTrue($available->isAvailable());

        // Published with no available_from (immediately available)
        $noAvailableFrom = Assignment::factory()->create([
            'is_published' => true,
            'available_from' => null,
        ]);
        $this->assertTrue($noAvailableFrom->isAvailable());
    }

    public function test_assignment_accepts_late_submissions_check(): void
    {
        // Doesn't allow late
        $noLate = Assignment::factory()->create([
            'allows_late' => false,
            'due_date' => now()->subDay(),
        ]);
        $this->assertFalse($noLate->acceptsLateSubmissions());

        // Allows late, unlimited
        $unlimitedLate = Assignment::factory()->create([
            'allows_late' => true,
            'max_late_days' => null,
            'due_date' => now()->subDays(100),
        ]);
        $this->assertTrue($unlimitedLate->acceptsLateSubmissions());

        // Allows late, within limit
        $withinLimit = Assignment::factory()->create([
            'allows_late' => true,
            'max_late_days' => 5,
            'due_date' => now()->subDays(3),
        ]);
        $this->assertTrue($withinLimit->acceptsLateSubmissions());

        // Allows late, past limit
        $pastLimit = Assignment::factory()->create([
            'allows_late' => true,
            'max_late_days' => 5,
            'due_date' => now()->subDays(10),
        ]);
        $this->assertFalse($pastLimit->acceptsLateSubmissions());
    }

    public function test_api_can_list_assignments(): void
    {
        $section = CourseSection::factory()->create();
        Assignment::factory()->count(3)->create(['course_section_id' => $section->id]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/assignments');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'course_section_id',
                        'title',
                        'type',
                        'due_date',
                        'max_points',
                        'is_published',
                    ],
                ],
            ]);
    }

    public function test_api_can_create_assignment(): void
    {
        $courseSection = CourseSection::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/assignments', [
                'course_section_id' => $courseSection->id,
                'title' => 'Homework 1',
                'type' => 'homework',
                'due_date' => now()->addDays(7)->toDateTimeString(),
                'max_points' => 100,
                'is_published' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Homework 1')
            ->assertJsonPath('data.type', 'homework');

        $this->assertDatabaseHas('assignments', [
            'title' => 'Homework 1',
            'course_section_id' => $courseSection->id,
        ]);
    }

    public function test_api_can_update_assignment(): void
    {
        $assignment = Assignment::factory()->create([
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/assignments/{$assignment->id}", [
                'title' => 'Updated Title',
                'max_points' => 50,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.max_points', '50.00');
    }

    public function test_api_can_delete_assignment_without_submissions(): void
    {
        $assignment = Assignment::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/assignments/{$assignment->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Assignment deleted successfully.');

        $this->assertDatabaseMissing('assignments', ['id' => $assignment->id]);
    }

    public function test_api_can_publish_assignment(): void
    {
        $assignment = Assignment::factory()->create(['is_published' => false]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/assignments/{$assignment->id}/publish");

        $response->assertOk()
            ->assertJsonPath('data.is_published', true);
    }

    public function test_api_can_unpublish_assignment(): void
    {
        $assignment = Assignment::factory()->create(['is_published' => true]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/assignments/{$assignment->id}/unpublish");

        $response->assertOk()
            ->assertJsonPath('data.is_published', false);
    }

    public function test_api_can_duplicate_assignment(): void
    {
        $assignment = Assignment::factory()->create([
            'title' => 'Original Assignment',
            'is_published' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/assignments/{$assignment->id}/duplicate");

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Original Assignment (Copy)')
            ->assertJsonPath('data.is_published', false);

        $this->assertDatabaseCount('assignments', 2);
    }

    public function test_api_can_get_assignments_for_course_section(): void
    {
        $section = CourseSection::factory()->create();
        Assignment::factory()->count(3)->create([
            'course_section_id' => $section->id,
            'is_published' => true,
        ]);

        // Create assignment for different section (should not appear)
        Assignment::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$section->id}/assignments");

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_api_can_get_assignment_types(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/assignments/types');

        $response->assertOk()
            ->assertJsonPath('data', Assignment::TYPES);
    }

    public function test_api_can_filter_assignments_by_type(): void
    {
        $section = CourseSection::factory()->create();
        Assignment::factory()->homework()->create(['course_section_id' => $section->id]);
        Assignment::factory()->homework()->create(['course_section_id' => $section->id]);
        Assignment::factory()->exam()->create(['course_section_id' => $section->id]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/assignments?type=homework');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_api_can_get_student_assignments(): void
    {
        $term = Term::factory()->create();
        $student = Student::factory()->create();

        $section1 = CourseSection::factory()->create(['term_id' => $term->id]);
        $section2 = CourseSection::factory()->create(['term_id' => $term->id]);

        // Enroll student in section1 only
        Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $section1->id,
            'status' => 'enrolled',
        ]);

        // Create assignments for both sections
        Assignment::factory()->available()->create(['course_section_id' => $section1->id]);
        Assignment::factory()->available()->create(['course_section_id' => $section1->id]);
        Assignment::factory()->available()->create(['course_section_id' => $section2->id]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/assignments/student?student_id={$student->id}");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_api_can_get_grading_progress(): void
    {
        $section = CourseSection::factory()->create();
        $assignment = Assignment::factory()->create(['course_section_id' => $section->id]);

        // Create some enrollments
        Enrollment::factory()->count(5)->create([
            'course_section_id' => $section->id,
            'status' => 'enrolled',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/assignments/{$assignment->id}/grading-progress");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'enrolled_students',
                    'total_submissions',
                    'graded',
                    'pending_grading',
                    'not_submitted',
                    'submission_rate',
                    'grading_progress',
                ],
            ])
            ->assertJsonPath('data.enrolled_students', 5)
            ->assertJsonPath('data.total_submissions', 0)
            ->assertJsonPath('data.not_submitted', 5);
    }
}
