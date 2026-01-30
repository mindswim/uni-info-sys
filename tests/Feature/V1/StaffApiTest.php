<?php

namespace Tests\Feature\Api\V1;

use App\Models\Department;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StaffApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);

        // Create a user to act as an admin for authentication
        $this->admin = User::factory()->create();

        // Assign admin role
        $this->admin->roles()->attach($adminRole);
    }

    private function getStaffData(array $overrides = []): array
    {
        $department = Department::factory()->create();

        return array_merge([
            'user' => [
                'name' => $this->faker->name,
                'email' => $this->faker->unique()->safeEmail,
                'password' => 'password',
                'password_confirmation' => 'password',
            ],
            'job_title' => $this->faker->jobTitle,
            'bio' => $this->faker->paragraph,
            'office_location' => 'Building A, Room 101',
            'department_id' => $department->id,
        ], $overrides);
    }

    public function test_can_get_all_staff_paginated()
    {
        Staff::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/staff');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'job_title', 'user', 'department'],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(10, 'data');
    }

    public function test_can_filter_staff_by_department()
    {
        $department1 = Department::factory()->create();
        $department2 = Department::factory()->create();
        Staff::factory()->count(3)->create(['department_id' => $department1->id]);
        Staff::factory()->count(2)->create(['department_id' => $department2->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/staff?department_id={$department1->id}");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
        foreach ($response->json('data') as $staff) {
            $this->assertEquals($department1->id, $staff['department']['id']);
        }
    }

    public function test_can_create_a_staff_member()
    {
        $data = $this->getStaffData();

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/staff', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['job_title' => $data['job_title']])
            ->assertJsonPath('data.user.email', $data['user']['email']);

        $this->assertDatabaseHas('users', ['email' => $data['user']['email']]);
        $this->assertDatabaseHas('staff', ['job_title' => $data['job_title']]);
    }

    public function test_create_staff_validation_fails()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/staff', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user.name', 'user.email', 'user.password', 'job_title', 'department_id']);
    }

    public function test_can_get_a_single_staff_member()
    {
        $staff = Staff::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/staff/{$staff->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $staff->id,
                'job_title' => $staff->job_title,
                'user' => [
                    'id' => $staff->user->id,
                    'name' => $staff->user->name,
                    'email' => $staff->user->email,
                    'created_at' => $staff->user->created_at->toISOString(),
                    'updated_at' => $staff->user->updated_at->toISOString(),
                ],
            ]);
    }

    public function test_can_update_a_staff_member()
    {
        $staff = Staff::factory()->create();
        $newDepartment = Department::factory()->create();

        $updateData = [
            'user' => [
                'name' => 'Updated Name',
            ],
            'job_title' => 'Senior Developer',
            'department_id' => $newDepartment->id,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/staff/{$staff->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.name', 'Updated Name')
            ->assertJsonPath('data.job_title', 'Senior Developer')
            ->assertJsonPath('data.department.id', $newDepartment->id);

        $this->assertDatabaseHas('users', ['id' => $staff->user_id, 'name' => 'Updated Name']);
        $this->assertDatabaseHas('staff', ['id' => $staff->id, 'job_title' => 'Senior Developer']);
    }

    public function test_can_delete_a_staff_member()
    {
        $staff = Staff::factory()->create();
        $userId = $staff->user_id;

        $this->assertDatabaseHas('users', ['id' => $userId]);
        $this->assertDatabaseHas('staff', ['id' => $staff->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/staff/{$staff->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('staff', ['id' => $staff->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]); // Assumes onDelete('cascade')
    }
}
