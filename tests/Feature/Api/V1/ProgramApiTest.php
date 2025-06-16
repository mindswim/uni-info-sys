<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Program;

class ProgramApiTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    /** @test */
    public function can_get_a_paginated_list_of_programs()
    {
        Program::factory()->count(15)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/v1/programs');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'department']], 'links', 'meta']);
    }

    /** @test */
    public function can_filter_programs_by_department_id()
    {
        $department1 = Department::factory()->for(Faculty::factory())->create();
        $department2 = Department::factory()->for(Faculty::factory())->create();
        Program::factory()->count(3)->create(['department_id' => $department1->id]);
        Program::factory()->count(2)->create(['department_id' => $department2->id]);

        $response = $this->actingAs($this->admin)->getJson("/api/v1/programs?department_id={$department1->id}");
        
        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    /** @test */
    public function can_get_a_single_program()
    {
        $program = Program::factory()->create();

        $response = $this->actingAs($this->admin)->getJson("/api/v1/programs/{$program->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $program->id,
                    'name' => $program->name,
                    'department' => ['id' => $program->department->id],
                ]
            ]);
    }

    /** @test */
    public function can_create_a_new_program()
    {
        $department = Department::factory()->for(Faculty::factory())->create();
        $programData = [
            'name' => 'B.Sc. in Extraordinary Gastronomy',
            'department_id' => $department->id,
            'degree_level' => 'Bachelors',
            'duration' => 4,
            'capacity' => 50,
            'requirements' => 'A passion for food.',
            'description' => 'A delicious program.',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/v1/programs', $programData);

        $response->assertStatus(201)
            ->assertJson(['data' => ['name' => 'B.Sc. in Extraordinary Gastronomy']]);
        $this->assertDatabaseHas('programs', ['name' => 'B.Sc. in Extraordinary Gastronomy']);
    }

    /** @test */
    public function can_update_a_program()
    {
        $program = Program::factory()->create();
        $updateData = ['name' => 'Updated Program Name'];

        $response = $this->actingAs($this->admin)->putJson("/api/v1/programs/{$program->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson(['data' => ['name' => 'Updated Program Name']]);
        $this->assertDatabaseHas('programs', ['id' => $program->id, 'name' => 'Updated Program Name']);
    }

    /** @test */
    public function can_delete_a_program()
    {
        $program = Program::factory()->create();
        $response = $this->actingAs($this->admin)->deleteJson("/api/v1/programs/{$program->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('programs', ['id' => $program->id]);
    }
}
