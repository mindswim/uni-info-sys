<?php

namespace Tests\Feature\Api\V1;

use App\Models\AdmissionApplication;
use App\Models\Program;
use App\Models\ProgramChoice;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramChoiceApiTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected $staff;

    protected $student;

    protected $otherStudent;

    protected $term;

    protected $program;

    protected $otherProgram;

    protected $application;

    protected $otherApplication;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $staffRole = Role::factory()->create(['name' => 'staff']);
        $studentRole = Role::factory()->create(['name' => 'student']);

        // Create users with roles
        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole);

        $this->staff = User::factory()->create();
        $this->staff->roles()->attach($staffRole);

        $this->student = User::factory()->create();
        $this->student->roles()->attach($studentRole);

        $this->otherStudent = User::factory()->create();
        $this->otherStudent->roles()->attach($studentRole);

        // Create supporting data
        $this->term = Term::factory()->create();
        $this->program = Program::factory()->create();
        $this->otherProgram = Program::factory()->create();

        // Create student records
        $studentRecord = Student::factory()->create(['user_id' => $this->student->id]);
        $otherStudentRecord = Student::factory()->create(['user_id' => $this->otherStudent->id]);

        // Create admission applications
        $this->application = AdmissionApplication::factory()->create([
            'student_id' => $studentRecord->id,
            'term_id' => $this->term->id,
            'status' => 'draft',
        ]);

        $this->otherApplication = AdmissionApplication::factory()->create([
            'student_id' => $otherStudentRecord->id,
            'term_id' => $this->term->id,
            'status' => 'draft',
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_program_choices()
    {
        $response = $this->getJson("/api/v1/admission-applications/{$this->application->id}/program-choices");
        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_list_all_program_choices_for_any_application()
    {
        // Create program choices for both applications
        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        ProgramChoice::factory()->create([
            'application_id' => $this->otherApplication->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        // Admin can access any application's choices
        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/v1/admission-applications/{$this->application->id}/program-choices");

        $response->assertStatus(200)
            ->assertJsonCount(1);

        $response = $this->getJson("/api/v1/admission-applications/{$this->otherApplication->id}/program-choices");
        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    /** @test */
    public function student_can_only_view_program_choices_for_their_own_application()
    {
        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        ProgramChoice::factory()->create([
            'application_id' => $this->otherApplication->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');

        // Can access own application's choices
        $response = $this->getJson("/api/v1/admission-applications/{$this->application->id}/program-choices");
        $response->assertStatus(200)
            ->assertJsonCount(1);

        // Cannot access other student's application choices
        $response = $this->getJson("/api/v1/admission-applications/{$this->otherApplication->id}/program-choices");
        $response->assertStatus(403);
    }

    /** @test */
    public function program_choices_are_ordered_by_preference()
    {
        // Create program choices with different preference orders
        $program1 = Program::factory()->create();
        $program2 = Program::factory()->create();

        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $program2->id,
            'preference_order' => 2,
        ]);

        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $program1->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->admin, 'sanctum');
        $response = $this->getJson("/api/v1/admission-applications/{$this->application->id}/program-choices");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $choices = $response->json('data');
        $this->assertEquals(1, $choices[0]['preference_order']);
        $this->assertEquals(2, $choices[1]['preference_order']);
    }

    /** @test */
    public function student_can_create_program_choice_for_their_own_application()
    {
        $this->actingAs($this->student, 'sanctum');

        $data = [
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending',
        ];

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/program-choices", $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['preference_order' => 1])
            ->assertJsonFragment(['status' => 'pending'])
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'application_id',
                    'program_id',
                    'preference_order',
                    'status',
                    'program',
                ],
            ]);

        $this->assertDatabaseHas('program_choices', [
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function student_cannot_create_program_choice_for_another_students_application()
    {
        $this->actingAs($this->student, 'sanctum');

        $data = [
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ];

        $response = $this->postJson("/api/v1/admission-applications/{$this->otherApplication->id}/program-choices", $data);
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_create_program_choice_for_any_application()
    {
        $this->actingAs($this->admin, 'sanctum');

        $data = [
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ];

        $response = $this->postJson("/api/v1/admission-applications/{$this->otherApplication->id}/program-choices", $data);
        $response->assertStatus(201);
    }

    /** @test */
    public function validation_fails_for_missing_required_fields()
    {
        $this->actingAs($this->student, 'sanctum');

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/program-choices", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['program_id', 'preference_order']);
    }

    /** @test */
    public function validation_fails_for_non_existent_program()
    {
        $this->actingAs($this->student, 'sanctum');

        $data = [
            'program_id' => 99999,
            'preference_order' => 1,
        ];

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/program-choices", $data);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['program_id']);
    }

    /** @test */
    public function validation_fails_for_duplicate_preference_order()
    {
        // Create existing choice
        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');

        $data = [
            'program_id' => $this->otherProgram->id,
            'preference_order' => 1, // Same as existing
        ];

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/program-choices", $data);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['preference_order']);
    }

    /** @test */
    public function can_view_specific_program_choice()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');
        $response = $this->getJson("/api/v1/program-choices/{$choice->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'application_id',
                    'program_id',
                    'preference_order',
                    'status',
                    'program',
                    'admission_application',
                ],
            ]);
    }

    /** @test */
    public function student_cannot_view_other_students_program_choice()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->otherApplication->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');
        $response = $this->getJson("/api/v1/program-choices/{$choice->id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function student_can_update_their_own_draft_program_choice()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending',
        ]);

        $this->actingAs($this->student, 'sanctum');

        $updateData = ['preference_order' => 2];

        $response = $this->putJson("/api/v1/program-choices/{$choice->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['preference_order' => 2]);

        $this->assertDatabaseHas('program_choices', [
            'id' => $choice->id,
            'preference_order' => 2,
        ]);
    }

    /** @test */
    public function student_cannot_update_program_choice_for_submitted_application()
    {
        // Update application status to submitted
        $this->application->update(['status' => 'submitted']);

        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');

        $response = $this->putJson("/api/v1/program-choices/{$choice->id}", ['preference_order' => 2]);
        $response->assertStatus(403);
    }

    /** @test */
    public function student_cannot_update_status_field()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending',
        ]);

        $this->actingAs($this->student, 'sanctum');

        $response = $this->putJson("/api/v1/program-choices/{$choice->id}", ['status' => 'accepted']);

        // Request should succeed but status should not change
        $response->assertStatus(200);
        $this->assertDatabaseHas('program_choices', [
            'id' => $choice->id,
            'status' => 'pending', // Should remain unchanged
        ]);
    }

    /** @test */
    public function admin_can_update_any_program_choice_including_status()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending',
        ]);

        $this->actingAs($this->admin, 'sanctum');

        $updateData = [
            'preference_order' => 2,
            'status' => 'accepted',
        ];

        $response = $this->putJson("/api/v1/program-choices/{$choice->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['preference_order' => 2])
            ->assertJsonFragment(['status' => 'accepted']);
    }

    /** @test */
    public function validation_fails_for_duplicate_preference_order_in_update()
    {
        // Create two choices
        $choice1 = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $choice2 = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->otherProgram->id,
            'preference_order' => 2,
        ]);

        $this->actingAs($this->student, 'sanctum');

        // Try to update choice2 to have same preference order as choice1
        $response = $this->putJson("/api/v1/program-choices/{$choice2->id}", ['preference_order' => 1]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['preference_order']);
    }

    /** @test */
    public function student_can_delete_their_own_draft_program_choice()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');

        $response = $this->deleteJson("/api/v1/program-choices/{$choice->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Program choice deleted successfully.']);

        $this->assertDatabaseMissing('program_choices', ['id' => $choice->id]);
    }

    /** @test */
    public function student_cannot_delete_program_choice_from_submitted_application()
    {
        // Update application status to submitted
        $this->application->update(['status' => 'submitted']);

        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->student, 'sanctum');

        $response = $this->deleteJson("/api/v1/program-choices/{$choice->id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_any_program_choice()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->otherApplication->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->admin, 'sanctum');

        $response = $this->deleteJson("/api/v1/program-choices/{$choice->id}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('program_choices', ['id' => $choice->id]);
    }

    /** @test */
    public function returns_404_for_non_existent_program_choice()
    {
        $this->actingAs($this->admin, 'sanctum');

        $response = $this->getJson('/api/v1/program-choices/99999');
        $response->assertStatus(404);
    }

    /** @test */
    public function staff_can_list_program_choices_for_any_application()
    {
        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
        ]);

        $this->actingAs($this->staff, 'sanctum');
        $response = $this->getJson("/api/v1/admission-applications/{$this->application->id}/program-choices");

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    /** @test */
    public function staff_can_update_program_choice_status()
    {
        $choice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending',
        ]);

        $this->actingAs($this->staff, 'sanctum');

        $response = $this->putJson("/api/v1/program-choices/{$choice->id}", ['status' => 'accepted']);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'accepted']);
    }
}
