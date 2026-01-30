<?php

namespace Tests\Feature\Api\V1;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Program;
use App\Models\Role;
use App\Models\Term;
use App\Models\TuitionRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TuitionRateTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $staffUser;

    private User $studentUser;

    private Program $program;

    private Term $term;

    protected function setUp(): void
    {
        parent::setUp();

        $faculty = Faculty::factory()->create();
        $dept = Department::factory()->create(['faculty_id' => $faculty->id]);
        $this->program = Program::factory()->create(['department_id' => $dept->id]);
        $this->term = Term::factory()->create();

        $this->adminUser = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $this->adminUser->roles()->attach($adminRole);

        $this->staffUser = User::factory()->create();
        $staffRole = Role::factory()->create(['name' => 'staff']);
        $this->staffUser->roles()->attach($staffRole);

        $this->studentUser = User::factory()->create();
        $studentRole = Role::factory()->create(['name' => 'student']);
        $this->studentUser->roles()->attach($studentRole);
    }

    public function test_admin_can_list_tuition_rates(): void
    {
        TuitionRate::factory()->count(3)->create([
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/tuition-rates');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_staff_can_list_tuition_rates(): void
    {
        TuitionRate::factory()->create([
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->staffUser);

        $response = $this->getJson('/api/v1/tuition-rates');
        $response->assertStatus(200);
    }

    public function test_student_cannot_list_tuition_rates(): void
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->getJson('/api/v1/tuition-rates');
        $response->assertStatus(403);
    }

    public function test_filter_by_program_id(): void
    {
        TuitionRate::factory()->create([
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);
        $otherProgram = Program::factory()->create(['department_id' => $this->program->department_id]);
        TuitionRate::factory()->create([
            'program_id' => $otherProgram->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/tuition-rates?program_id={$this->program->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_admin_can_create_rate(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/tuition-rates', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'student_type' => 'domestic',
            'enrollment_status' => 'full_time',
            'tuition_per_credit' => 500.00,
            'base_fee' => 2000.00,
            'technology_fee' => 150.00,
            'effective_date' => '2026-01-01',
            'is_active' => true,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.tuition_per_credit', '500.00');
    }

    public function test_admin_can_update_rate(): void
    {
        $rate = TuitionRate::factory()->create([
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson("/api/v1/tuition-rates/{$rate->id}", [
            'tuition_per_credit' => 750.00,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.tuition_per_credit', '750.00');
    }

    public function test_admin_can_delete_rate(): void
    {
        $rate = TuitionRate::factory()->create([
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson("/api/v1/tuition-rates/{$rate->id}");
        $response->assertStatus(204);
    }

    public function test_staff_cannot_create_rate(): void
    {
        Sanctum::actingAs($this->staffUser);

        $response = $this->postJson('/api/v1/tuition-rates', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'student_type' => 'domestic',
            'enrollment_status' => 'full_time',
            'tuition_per_credit' => 500.00,
            'base_fee' => 2000.00,
            'effective_date' => '2026-01-01',
            'is_active' => true,
        ]);

        $response->assertStatus(403);
    }

    public function test_show_single_rate(): void
    {
        $rate = TuitionRate::factory()->create([
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/tuition-rates/{$rate->id}");
        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $rate->id);
    }
}
