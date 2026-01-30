<?php

namespace Tests\Feature\Api\V1;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PermissionApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $this->staffRole = Role::create(['name' => 'staff', 'description' => 'Staff Member']);
        $this->studentRole = Role::create(['name' => 'student', 'description' => 'Student']);

        // Create permissions
        $this->viewPermission = Permission::create(['name' => 'permissions.view', 'description' => 'Can view permissions']);
        $this->createPermission = Permission::create(['name' => 'permissions.create', 'description' => 'Can create permissions']);
        $this->editPermission = Permission::create(['name' => 'permissions.update', 'description' => 'Can edit permissions']);

        // Associate permissions with roles
        $this->adminRole->permissions()->attach([$this->viewPermission->id, $this->createPermission->id, $this->editPermission->id]);
        $this->staffRole->permissions()->attach([$this->viewPermission->id]);

        // Create users
        $this->adminUser = User::factory()->create(['email' => 'admin@example.com']);
        $this->staffUser = User::factory()->create(['email' => 'staff@example.com']);
        $this->studentUser = User::factory()->create(['email' => 'student@example.com']);

        // Assign roles to users
        $this->adminUser->roles()->attach($this->adminRole->id);
        $this->staffUser->roles()->attach($this->staffRole->id);
        $this->studentUser->roles()->attach($this->studentRole->id);
    }

    public function test_unauthenticated_user_cannot_access_permissions_index()
    {
        $response = $this->getJson('/api/v1/permissions');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_permission_show()
    {
        $response = $this->getJson("/api/v1/permissions/{$this->viewPermission->id}");

        $response->assertStatus(401);
    }

    public function test_admin_can_view_permissions_index()
    {
        Sanctum::actingAs($this->adminUser, ['*']);

        $response = $this->getJson('/api/v1/permissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(3, 'data'); // view, create, edit permissions
    }

    public function test_staff_cannot_view_permissions_index()
    {
        Sanctum::actingAs($this->staffUser);

        $response = $this->getJson('/api/v1/permissions');

        $response->assertStatus(403);
    }

    public function test_student_cannot_view_permissions_index()
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->getJson('/api/v1/permissions');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_specific_permission()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/permissions/{$this->viewPermission->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $this->viewPermission->id,
                    'name' => 'permissions.view',
                    'description' => 'Can view permissions',
                ],
            ]);
    }

    public function test_staff_cannot_view_specific_permission()
    {
        Sanctum::actingAs($this->staffUser);

        $response = $this->getJson("/api/v1/permissions/{$this->viewPermission->id}");

        $response->assertStatus(403);
    }

    public function test_student_cannot_view_specific_permission()
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->getJson("/api/v1/permissions/{$this->viewPermission->id}");

        $response->assertStatus(403);
    }

    public function test_permissions_index_with_roles_included()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/permissions?include_roles=true');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at',
                        'roles' => [
                            '*' => [
                                'id',
                                'name',
                                'description',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_permission_show_with_roles_included()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/permissions/{$this->viewPermission->id}?include_roles=true");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'created_at',
                    'updated_at',
                    'roles' => [
                        '*' => [
                            'id',
                            'name',
                            'description',
                        ],
                    ],
                ],
            ]);
    }

    public function test_permission_show_returns_404_for_nonexistent_permission()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/permissions/999');

        $response->assertStatus(404);
    }

    public function test_permissions_index_supports_pagination()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/permissions?per_page=2');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'links' => [
                    'first',
                    'last',
                    'prev',
                    'next',
                ],
                'meta' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_permissions_are_ordered_by_name()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/permissions');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        $permissionNames = array_column($permissions, 'name');

        $this->assertEquals(['permissions.create', 'permissions.update', 'permissions.view'], $permissionNames);
    }
}
