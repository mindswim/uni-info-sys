<?php

namespace Tests\Feature\Api\V1;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleManagementApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Run the role permission seeder
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    /** @test */
    public function non_admin_user_cannot_access_role_endpoints(): void
    {
        $regularUser = User::factory()->create();
        $role = Role::factory()->create(['name' => 'test-role']);
        
        // Create a valid permission for the sync test
        $permission = Permission::factory()->create(['name' => 'test.permission']);

        $this->actingAs($regularUser, 'sanctum');

        $response = $this->getJson('/api/v1/roles');
        $response->assertStatus(403);

        $response = $this->postJson('/api/v1/roles', ['name' => 'new-role']);
        $response->assertStatus(403);

        $response = $this->getJson("/api/v1/roles/{$role->id}");
        $response->assertStatus(403);

        $response = $this->putJson("/api/v1/roles/{$role->id}", ['name' => 'updated-role']);
        $response->assertStatus(403);

        $response = $this->deleteJson("/api/v1/roles/{$role->id}");
        $response->assertStatus(403);

        $response = $this->postJson("/api/v1/roles/{$role->id}/permissions", ['permissions' => [$permission->id]]);
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_user_can_list_roles(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/roles');
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'description',
                            'created_at',
                            'updated_at'
                        ]
                    ],
                    'links',
                    'meta'
                ]);
    }

    /** @test */
    public function admin_user_can_create_role(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $roleData = [
            'name' => 'Content Manager',
            'description' => 'Can manage content and moderate posts'
        ];

        $response = $this->postJson('/api/v1/roles', $roleData);
        
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at'
                    ]
                ])
                ->assertJson([
                    'data' => [
                        'name' => 'Content Manager',
                        'description' => 'Can manage content and moderate posts'
                    ]
                ]);

        $this->assertDatabaseHas('roles', $roleData);
    }

    /** @test */
    public function admin_user_can_view_specific_role(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::first();

        $response = $this->getJson("/api/v1/roles/{$role->id}");
        
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at'
                    ]
                ])
                ->assertJson([
                    'data' => [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description
                    ]
                ]);
    }

    /** @test */
    public function admin_user_can_view_role_with_permissions(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::with('permissions')->first();

        $response = $this->getJson("/api/v1/roles/{$role->id}?include_permissions=true");
        
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
                                'created_at',
                                'updated_at'
                            ]
                        ]
                    ]
                ]);
    }

    /** @test */
    public function admin_user_can_update_role(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::create(['name' => 'Test Role', 'description' => 'Test description']);

        $updateData = [
            'name' => 'Updated Role',
            'description' => 'Updated description'
        ];

        $response = $this->putJson("/api/v1/roles/{$role->id}", $updateData);
        
        $response->assertStatus(200)
                ->assertJson([
                    'data' => [
                        'id' => $role->id,
                        'name' => 'Updated Role',
                        'description' => 'Updated description'
                    ]
                ]);

        $this->assertDatabaseHas('roles', $updateData);
    }

    /** @test */
    public function admin_user_can_delete_role(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::create(['name' => 'Test Role to Delete', 'description' => 'Test description']);

        $response = $this->deleteJson("/api/v1/roles/{$role->id}");
        
        $response->assertStatus(204);

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    /** @test */
    public function admin_user_can_sync_permissions_to_role(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::create(['name' => 'Test Role', 'description' => 'Test description']);
        $permissions = Permission::take(3)->get();

        $response = $this->postJson("/api/v1/roles/{$role->id}/permissions", [
            'permissions' => $permissions->pluck('id')->toArray()
        ]);
        
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
                                'created_at',
                                'updated_at'
                            ]
                        ]
                    ],
                    'message'
                ])
                ->assertJson([
                    'message' => 'Permissions synced successfully'
                ]);

        // Verify permissions were synced
        $role->refresh();
        $this->assertCount(3, $role->permissions);
        
        foreach ($permissions as $permission) {
            $this->assertTrue($role->permissions->contains($permission));
        }
    }

    /** @test */
    public function role_name_must_be_unique(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $existingRole = Role::first();

        $response = $this->postJson('/api/v1/roles', [
            'name' => $existingRole->name,
            'description' => 'Test description'
        ]);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function role_name_is_required(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/roles', [
            'description' => 'Test description'
        ]);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function sync_permissions_requires_valid_permission_ids(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::create(['name' => 'Test Role', 'description' => 'Test description']);

        $response = $this->postJson("/api/v1/roles/{$role->id}/permissions", [
            'permissions' => [999, 998, 997] // Non-existent permission IDs
        ]);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['permissions.0', 'permissions.1', 'permissions.2']);
    }

    /** @test */
    public function sync_permissions_requires_permissions_array(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $user->roles()->attach($adminRole);
        
        Sanctum::actingAs($user);

        $role = Role::create(['name' => 'Test Role', 'description' => 'Test description']);

        $response = $this->postJson("/api/v1/roles/{$role->id}/permissions", []);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['permissions']);
    }

    /** @test */
    public function user_with_roles_manage_permission_gains_access(): void
    {
        // Create a user with a custom role that has only roles.manage permission
        $user = User::factory()->create();
        $customRole = Role::create(['name' => 'Role Manager', 'description' => 'Can manage roles']);
        $rolesManagePermission = Permission::where('name', 'roles.manage')->first();
        $customRole->permissions()->attach($rolesManagePermission);
        $user->roles()->attach($customRole);
        
        Sanctum::actingAs($user);

        // This user should now be able to access role endpoints
        $response = $this->getJson('/api/v1/roles');
        $response->assertStatus(200);

        $response = $this->postJson('/api/v1/roles', [
            'name' => 'New Test Role',
            'description' => 'Created by role manager'
        ]);
        $response->assertStatus(201);
    }
} 