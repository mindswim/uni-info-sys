<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Program;

class DepartmentApiTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    /** @test */
    public function can_get_a_paginated_list_of_departments()
    {
        Department::factory()->count(15)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/v1/departments');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'faculty', 'programs']], 'links', 'meta']);
    }

    /** @test */
    public function can_filter_departments_by_faculty_id()
    {
        $faculty1 = Faculty::factory()->create();
        $faculty2 = Faculty::factory()->create();
        Department::factory()->count(3)->create(['faculty_id' => $faculty1->id]);
        Department::factory()->count(2)->create(['faculty_id' => $faculty2->id]);

        $response = $this->actingAs($this->admin)->getJson("/api/v1/departments?faculty_id={$faculty1->id}");
        
        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }

    /** @test */
    public function can_get_a_single_department()
    {
        $department = Department::factory()->has(Program::factory()->count(2))->create();

        $response = $this->actingAs($this->admin)->getJson("/api/v1/departments/{$department->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'faculty' => ['id' => $department->faculty->id],
                ]
            ])
            ->assertJsonCount(2, 'data.programs');
    }

    /** @test */
    public function can_create_a_new_department()
    {
        $faculty = Faculty::factory()->create();
        $departmentData = ['name' => 'Department of Computer Science', 'faculty_id' => $faculty->id];

        $response = $this->actingAs($this->admin)->postJson('/api/v1/departments', $departmentData);

        $response->assertStatus(201)
            ->assertJson(['data' => ['name' => 'Department of Computer Science']]);
        $this->assertDatabaseHas('departments', $departmentData);
    }

    /** @test */
    public function can_update_a_department()
    {
        $department = Department::factory()->create();
        $updateData = ['name' => 'Updated Department Name'];

        $response = $this->actingAs($this->admin)->putJson("/api/v1/departments/{$department->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson(['data' => ['name' => 'Updated Department Name']]);
        $this->assertDatabaseHas('departments', ['id' => $department->id, 'name' => 'Updated Department Name']);
    }

    /** @test */
    public function can_delete_a_department()
    {
        $department = Department::factory()->create();
        $response = $this->actingAs($this->admin)->deleteJson("/api/v1/departments/{$department->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }
}
