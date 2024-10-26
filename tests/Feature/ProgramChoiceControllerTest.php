<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Program;
use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramChoiceControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $application;
    protected $program;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate user
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        
        // Create the required relationships
        $student = Student::factory()->create(['user_id' => $this->user->id]);
        $this->application = AdmissionApplication::factory()->create(['student_id' => $student->id]);
        $this->program = Program::factory()->create();
    }

    public function test_can_list_program_choices()
    {
        ProgramChoice::factory()->count(3)->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'status' => 'pending'
        ]);

        $response = $this->getJson("/applications/{$this->application->id}/program-choices");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_create_program_choice()
    {
        $data = [
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending'
        ];

        $response = $this->postJson(
            "/applications/{$this->application->id}/program-choices",
            $data
        );

        $response->assertStatus(201)
            ->assertJsonFragment($data);
    }

    public function test_cannot_create_duplicate_preference_order()
    {
        // Create first choice
        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending'
        ]);

        // Try to create another with same preference order
        $data = [
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending'
        ];

        $response = $this->postJson(
            "/applications/{$this->application->id}/program-choices",
            $data
        );

        $response->assertStatus(422);
    }

    public function test_can_update_program_choice()
    {
        $programChoice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending'
        ]);

        $updateData = [
            'preference_order' => 2,
            'status' => 'accepted'
        ];

        $response = $this->putJson(
            "/applications/{$this->application->id}/program-choices/{$programChoice->id}",
            $updateData
        );

        $response->assertStatus(200)
            ->assertJsonFragment($updateData);
    }

    public function test_cannot_update_with_duplicate_preference_order()
    {
        // Create two choices
        $first = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending'
        ]);

        $second = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 2,
            'status' => 'pending'
        ]);

        // Try to update second choice to have same preference order as first
        $response = $this->putJson(
            "/applications/{$this->application->id}/program-choices/{$second->id}",
            ['preference_order' => 1]
        );

        $response->assertStatus(422);
    }

    public function test_can_delete_program_choice()
    {
        $programChoice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'pending'
        ]);

        $response = $this->deleteJson(
            "/applications/{$this->application->id}/program-choices/{$programChoice->id}"
        );

        $response->assertStatus(204);
        $this->assertDatabaseMissing('program_choices', ['id' => $programChoice->id]);
    }
}
