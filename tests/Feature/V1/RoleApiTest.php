<?php

namespace Tests\Feature\Api\V1;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleApiTest extends TestCase
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
        $this->manageRolesPermission = Permission::create(['name' => 'roles.manage', 'description' => 'Can manage roles']);

        // Associate permissions with roles
        $this->adminRole->permissions()->attach([$this->manageRolesPermission->id]);
        $this->staffRole->permissions()->attach([$this->manageRolesPermission->id]);

        // Create users
        $this->adminUser = User::factory()->create(['email' => 'admin@example.com']);
        $this->staffUser = User::factory()->create(['email' => 'staff@example.com']);
        $this->studentUser = User::factory()->create(['email' => 'student@example.com']);

        // Assign roles to users
        $this->adminUser->roles()->attach($this->adminRole->id);
        $this->staffUser->roles()->attach($this->staffRole->id);
        $this->studentUser->roles()->attach($this->studentRole->id);
    }

    public function test_unauthenticated_user_cannot_access_roles_index()
    {
        $response = $this->getJson('/api/v1/roles');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_role_show()
    {
        $response = $this->getJson("/api/v1/roles/{$this->adminRole->id}");

        $response->assertStatus(401);
    }

    public function test_admin_can_view_roles_index()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/roles');

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
            ->assertJsonCount(3, 'data'); // admin, staff, student roles
    }

    public function test_staff_cannot_view_roles_index()
    {
        Sanctum::actingAs($this->staffUser);

        $response = $this->getJson('/api/v1/roles');

        $response->assertStatus(403);
    }

    public function test_student_cannot_view_roles_index()
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->getJson('/api/v1/roles');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_specific_role()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/roles/{$this->adminRole->id}");

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
                    'id' => $this->adminRole->id,
                    'name' => 'admin',
                    'description' => 'Administrator',
                ],
            ]);
    }

    public function test_staff_cannot_view_specific_role()
    {
        Sanctum::actingAs($this->staffUser);

        $response = $this->getJson("/api/v1/roles/{$this->staffRole->id}");

        $response->assertStatus(403);
    }

    public function test_student_cannot_view_specific_role()
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->getJson("/api/v1/roles/{$this->adminRole->id}");

        $response->assertStatus(403);
    }

    public function test_roles_index_with_permissions_included()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/roles?include_permissions=true');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at',
                        'permissions' => [
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

    public function test_role_show_with_permissions_included()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson("/api/v1/roles/{$this->adminRole->id}?include_permissions=true");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'created_at',
                    'updated_at',
                    'permissions' => [
                        '*' => [
                            'id',
                            'name',
                            'description',
                        ],
                    ],
                ],
            ]);
    }

    public function test_role_show_returns_404_for_nonexistent_role()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/roles/999');

        $response->assertStatus(404);
    }

    public function test_roles_index_supports_pagination()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/roles?per_page=2');

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

    public function test_roles_are_ordered_by_name()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/roles');

        $response->assertStatus(200);

        $roles = $response->json('data');
        $roleNames = array_column($roles, 'name');

        $this->assertEquals(['admin', 'staff', 'student'], $roleNames);
    }
}
