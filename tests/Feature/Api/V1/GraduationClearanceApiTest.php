<?php

namespace Tests\Feature\Api\V1;

use App\Models\GraduationApplication;
use App\Models\Hold;
use App\Models\Program;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GraduationClearanceApiTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $studentUser;

    private Student $student;

    private Program $program;

    private Term $term;

    protected function setUp(): void
    {
        parent::setUp();

        // Admin
        $this->adminUser = User::factory()->create();
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $this->adminUser->roles()->attach($adminRole);

        // Student
        $this->studentUser = User::factory()->create();
        $studentRole = Role::firstOrCreate(['name' => 'student'], ['description' => 'Student']);
        $this->studentUser->roles()->attach($studentRole);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);

        $this->program = Program::factory()->create();
        $this->term = Term::factory()->create();
    }

    public function test_student_can_submit_graduation_application(): void
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson('/api/v1/graduation-applications', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('graduation_applications', [
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'status' => 'clearance_in_progress',
        ]);
    }

    public function test_clearance_initiated_with_4_departments(): void
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson('/api/v1/graduation-applications', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $response->assertCreated();
        $app = GraduationApplication::first();
        $clearance = $app->clearance_status;
        $this->assertCount(4, $clearance);
        $this->assertArrayHasKey('academic', $clearance);
        $this->assertArrayHasKey('financial', $clearance);
        $this->assertArrayHasKey('library', $clearance);
        $this->assertArrayHasKey('registrar', $clearance);
    }

    public function test_automated_clearance_blocks_financial_with_active_hold(): void
    {
        Hold::factory()->financial()->create([
            'student_id' => $this->student->id,
        ]);

        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson('/api/v1/graduation-applications', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $response->assertCreated();
        $app = GraduationApplication::first();
        $this->assertEquals('hold', $app->clearance_status['financial']['status']);
    }

    public function test_automated_clearance_clears_financial_when_no_holds(): void
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson('/api/v1/graduation-applications', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $response->assertCreated();
        $app = GraduationApplication::first();
        $this->assertEquals('cleared', $app->clearance_status['financial']['status']);
    }

    public function test_admin_can_clear_department(): void
    {
        $app = GraduationApplication::factory()->clearanceInProgress()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/graduation-applications/{$app->id}/clear/registrar", [
            'notes' => 'All records verified',
        ]);

        $response->assertOk();
        $app->refresh();
        $this->assertEquals('cleared', $app->clearance_status['registrar']['status']);
    }

    public function test_admin_can_block_department(): void
    {
        $app = GraduationApplication::factory()->clearanceInProgress()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/graduation-applications/{$app->id}/block/library", [
            'notes' => 'Overdue books',
        ]);

        $response->assertOk();
        $app->refresh();
        $this->assertEquals('hold', $app->clearance_status['library']['status']);
    }

    public function test_fully_cleared_advances_status(): void
    {
        $clearance = [];
        foreach (GraduationApplication::CLEARANCE_DEPARTMENTS as $dept) {
            $clearance[$dept] = [
                'status' => $dept === 'registrar'
                    ? GraduationApplication::CLEARANCE_PENDING
                    : GraduationApplication::CLEARANCE_CLEARED,
                'cleared_by' => null,
                'cleared_at' => $dept !== 'registrar' ? now()->toISOString() : null,
                'notes' => null,
            ];
        }

        $app = GraduationApplication::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'status' => 'clearance_in_progress',
            'clearance_status' => $clearance,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/graduation-applications/{$app->id}/clear/registrar");

        $response->assertOk();
        $app->refresh();
        $this->assertEquals('cleared', $app->status);
    }

    public function test_final_approve_requires_cleared_status(): void
    {
        $app = GraduationApplication::factory()->clearanceInProgress()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/graduation-applications/{$app->id}/final-approve");

        $response->assertUnprocessable();
    }

    public function test_final_approve_works_when_cleared(): void
    {
        $app = GraduationApplication::factory()->fullyCleared()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/graduation-applications/{$app->id}/final-approve");

        $response->assertOk();
        $app->refresh();
        $this->assertEquals('approved', $app->status);
    }

    public function test_deny_works_from_clearance_stage(): void
    {
        $app = GraduationApplication::factory()->clearanceInProgress()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/graduation-applications/{$app->id}/deny", [
            'reviewer_notes' => 'Requirements not met',
        ]);

        $response->assertOk();
        $app->refresh();
        $this->assertEquals('denied', $app->status);
    }

    public function test_duplicate_application_rejected(): void
    {
        GraduationApplication::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'status' => 'clearance_in_progress',
        ]);

        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson('/api/v1/graduation-applications', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $response->assertUnprocessable();
    }

    public function test_student_can_see_clearance_progress(): void
    {
        Sanctum::actingAs($this->studentUser);

        $this->postJson('/api/v1/graduation-applications', [
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $response = $this->getJson('/api/v1/graduation-applications/me');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'clearance_summary' => ['total', 'cleared', 'pending', 'hold'],
                ],
            ],
        ]);
    }
}
