<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate a user
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_can_get_programs_list(): void
    {
        Program::factory()->count(3)->create();

        $response = $this->getJson('/programs');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_program(): void
    {
        $programData = [
            'name' => 'Computer Science',
            'department' => 'Engineering',
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'A comprehensive program in computer science',
            'requirements' => 'High school diploma with strong mathematics background',
            'capacity' => 100
        ];

        $response = $this->postJson('/programs', $programData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'name' => 'Computer Science',
                'department' => 'Engineering'
            ]);
    }

    public function test_can_show_program(): void
    {
        $program = Program::factory()->create();

        $response = $this->getJson("/programs/{$program->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $program->id,
                'name' => $program->name
            ]);
    }

    public function test_can_update_program(): void
    {
        $program = Program::factory()->create();

        $updateData = [
            'name' => 'Updated Program Name',
            'capacity' => 150
        ];

        $response = $this->putJson("/programs/{$program->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Updated Program Name',
                'capacity' => 150
            ]);
    }

    public function test_can_delete_program(): void
    {
        $program = Program::factory()->create();

        $response = $this->deleteJson("/programs/{$program->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('programs', ['id' => $program->id]);
    }

    public function test_validate_required_fields_for_creation(): void
    {
        $response = $this->postJson('/programs', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'department',
                'degree_level',
                'duration',
                'description',
                'requirements',
                'capacity'
            ]);
    }
}
