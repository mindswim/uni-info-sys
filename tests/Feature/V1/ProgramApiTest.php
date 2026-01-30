<?php

namespace Tests\Feature\Api\V1;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Permission;
use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramApiTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);

        // Create program permissions
        $viewAnyPermission = Permission::create(['name' => 'view-any-program', 'description' => 'Can view any program']);
        $viewPermission = Permission::create(['name' => 'view-program', 'description' => 'Can view program']);
        $createPermission = Permission::create(['name' => 'create-program', 'description' => 'Can create program']);
        $updatePermission = Permission::create(['name' => 'update-program', 'description' => 'Can update program']);
        $deletePermission = Permission::create(['name' => 'delete-program', 'description' => 'Can delete program']);

        // Assign permissions to admin role
        $adminRole->permissions()->attach([
            $viewAnyPermission->id,
            $viewPermission->id,
            $createPermission->id,
            $updatePermission->id,
            $deletePermission->id,
        ]);

        $this->admin = User::factory()->create();

        // Assign admin role
        $this->admin->roles()->attach($adminRole);
    }

    /** @test */
    public function can_get_a_paginated_list_of_programs()
    {
        Program::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/programs');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'department_id']], 'links', 'meta']);
    }

    /** @test */
    public function can_filter_programs_by_department_id()
    {
        $department1 = Department::factory()->for(Faculty::factory())->create();
        $department2 = Department::factory()->for(Faculty::factory())->create();
        Program::factory()->count(3)->create(['department_id' => $department1->id]);
        Program::factory()->count(2)->create(['department_id' => $department2->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/programs?department_id={$department1->id}");

        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    /** @test */
    public function can_get_a_single_program()
    {
        $program = Program::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/programs/{$program->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $program->id,
                    'name' => $program->name,
                    'department_id' => $program->department->id,
                ],
            ]);
    }

    /** @test */
    public function can_create_a_new_program()
    {
        $faculty = Faculty::factory()->create();
        $department = Department::factory()->create(['faculty_id' => $faculty->id]);

        $programData = [
            'name' => 'B.Sc. in Extraordinary Gastronomy',
            'department_id' => $department->id,
            'degree_level' => 'Bachelors',
            'duration' => 4,
            'description' => 'A unique program focusing on molecular cuisine and food science',
            'requirements' => 'High school diploma with science background',
            'capacity' => 50,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/programs', $programData);

        $response->assertStatus(201)
            ->assertJson(['data' => ['name' => 'B.Sc. in Extraordinary Gastronomy']]);
        $this->assertDatabaseHas('programs', ['name' => 'B.Sc. in Extraordinary Gastronomy']);
    }

    /** @test */
    public function can_update_a_program()
    {
        $program = Program::factory()->create();
        $updateData = ['name' => 'Updated Program Name'];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/programs/{$program->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson(['data' => ['name' => 'Updated Program Name']]);
        $this->assertDatabaseHas('programs', ['id' => $program->id, 'name' => 'Updated Program Name']);
    }

    /** @test */
    public function can_delete_a_program()
    {
        $program = Program::factory()->create();
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/programs/{$program->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('programs', ['id' => $program->id]);
    }
}
