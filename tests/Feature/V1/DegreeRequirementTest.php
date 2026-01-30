<?php

namespace Tests\Feature\Api\V1;

use App\Models\Course;
use App\Models\DegreeRequirement;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DegreeRequirementTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $studentUser;

    private Program $program;

    private Department $department;

    protected function setUp(): void
    {
        parent::setUp();

        $faculty = Faculty::factory()->create();
        $this->department = Department::factory()->create(['faculty_id' => $faculty->id]);
        $this->program = Program::factory()->create(['department_id' => $this->department->id]);

        // Admin user
        $this->adminUser = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $this->adminUser->roles()->attach($adminRole);

        // Student user
        $this->studentUser = User::factory()->create();
        $studentRole = Role::factory()->create(['name' => 'student']);
        $this->studentUser->roles()->attach($studentRole);
    }

    public function test_admin_can_list_requirements_for_program(): void
    {
        DegreeRequirement::factory()->count(3)->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/programs/{$this->program->id}/degree-requirements");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_student_can_view_requirements(): void
    {
        DegreeRequirement::factory()->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->studentUser);

        $response = $this->getJson("/api/v1/programs/{$this->program->id}/degree-requirements");

        $response->assertStatus(200);
    }

    public function test_admin_can_create_requirement(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/programs/{$this->program->id}/degree-requirements", [
            'category' => 'core',
            'name' => 'Computer Science Core',
            'description' => 'Required CS courses',
            'required_credit_hours' => 36,
            'min_courses' => 12,
            'is_required' => true,
            'sort_order' => 1,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Computer Science Core');
        $response->assertJsonPath('data.program_id', $this->program->id);
    }

    public function test_admin_can_create_requirement_with_allowed_courses(): void
    {
        $courses = Course::factory()->count(3)->create(['department_id' => $this->department->id]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/programs/{$this->program->id}/degree-requirements", [
            'category' => 'major',
            'name' => 'Major Electives',
            'required_credit_hours' => 18,
            'is_required' => true,
            'allowed_courses' => $courses->pluck('id')->toArray(),
        ]);

        $response->assertStatus(201);
        $response->assertJsonCount(3, 'data.allowed_courses');
    }

    public function test_cannot_create_requirement_with_invalid_course_ids(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/programs/{$this->program->id}/degree-requirements", [
            'category' => 'core',
            'name' => 'Bad Requirement',
            'required_credit_hours' => 12,
            'is_required' => true,
            'allowed_courses' => [99999, 99998],
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_update_requirement(): void
    {
        $req = DegreeRequirement::factory()->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson("/api/v1/degree-requirements/{$req->id}", [
            'name' => 'Updated Name',
            'required_credit_hours' => 24,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Updated Name');
        $response->assertJsonPath('data.required_credit_hours', 24);
    }

    public function test_admin_can_delete_requirement(): void
    {
        $req = DegreeRequirement::factory()->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson("/api/v1/degree-requirements/{$req->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('degree_requirements', ['id' => $req->id]);
    }

    public function test_student_cannot_create_requirement(): void
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson("/api/v1/programs/{$this->program->id}/degree-requirements", [
            'category' => 'core',
            'name' => 'Sneaky Requirement',
            'required_credit_hours' => 12,
            'is_required' => true,
        ]);

        $response->assertStatus(403);
    }

    public function test_student_cannot_update_requirement(): void
    {
        $req = DegreeRequirement::factory()->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->studentUser);

        $response = $this->putJson("/api/v1/degree-requirements/{$req->id}", [
            'name' => 'Hacked Name',
        ]);

        $response->assertStatus(403);
    }

    public function test_student_cannot_delete_requirement(): void
    {
        $req = DegreeRequirement::factory()->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->studentUser);

        $response = $this->deleteJson("/api/v1/degree-requirements/{$req->id}");

        $response->assertStatus(403);
    }

    public function test_show_single_requirement(): void
    {
        $req = DegreeRequirement::factory()->create(['program_id' => $this->program->id]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/degree-requirements/{$req->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $req->id);
        $response->assertJsonPath('data.program.id', $this->program->id);
    }
}
