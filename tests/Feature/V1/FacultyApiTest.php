<?php

namespace Tests\Feature\Api\V1;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacultyApiTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);

        // For now, we will just use a generic user. RBAC will be added later.
        $this->admin = User::factory()->create();

        // Assign admin role
        $this->admin->roles()->attach($adminRole);
    }

    /** @test */
    public function can_get_a_paginated_list_of_faculties()
    {
        Faculty::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/faculties');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure([
                'data' => [['id', 'name', 'departments']],
                'links',
                'meta',
            ]);
    }

    /** @test */
    public function can_get_a_single_faculty()
    {
        $faculty = Faculty::factory()->has(Department::factory()->count(3))->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/faculties/{$faculty->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $faculty->id,
                    'name' => $faculty->name,
                ],
            ])
            ->assertJsonCount(3, 'data.departments');
    }

    /** @test */
    public function returns_404_if_faculty_not_found()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/faculties/9999');
        $response->assertStatus(404);
    }

    /** @test */
    public function can_create_a_new_faculty()
    {
        $facultyData = ['name' => 'Faculty of Awesome'];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/faculties', $facultyData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'Faculty of Awesome',
                ],
            ]);

        $this->assertDatabaseHas('faculties', $facultyData);
    }

    /** @test */
    public function create_faculty_requires_a_name()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/faculties', ['name' => '']);
        $response->assertStatus(422)->assertJsonValidationErrors('name');
    }

    /** @test */
    public function can_update_a_faculty()
    {
        $faculty = Faculty::factory()->create();
        $updateData = ['name' => 'Updated Faculty Name'];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/faculties/{$faculty->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Faculty Name',
                ],
            ]);

        $this->assertDatabaseHas('faculties', ['id' => $faculty->id, 'name' => 'Updated Faculty Name']);
    }

    /** @test */
    public function can_delete_a_faculty()
    {
        $faculty = Faculty::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/faculties/{$faculty->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('faculties', ['id' => $faculty->id]);
    }
}
