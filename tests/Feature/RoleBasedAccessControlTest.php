<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedAccessControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_role(): void
    {
        $role = Role::create([
            'name' => 'admin',
            'description' => 'Administrator role with full access'
        ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'admin',
            'description' => 'Administrator role with full access'
        ]);

        $this->assertEquals('admin', $role->name);
        $this->assertEquals('Administrator role with full access', $role->description);
    }

    public function test_can_create_permission(): void
    {
        $permission = Permission::create([
            'name' => 'manage-applications',
            'description' => 'Can manage student applications'
        ]);

        $this->assertDatabaseHas('permissions', [
            'name' => 'manage-applications',
            'description' => 'Can manage student applications'
        ]);

        $this->assertEquals('manage-applications', $permission->name);
        $this->assertEquals('Can manage student applications', $permission->description);
    }

    public function test_user_can_have_multiple_roles(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $studentRole = Role::create(['name' => 'student', 'description' => 'Student']);

        $user->roles()->attach([$adminRole->id, $studentRole->id]);

        $this->assertCount(2, $user->roles);
        $this->assertTrue($user->roles->contains('name', 'admin'));
        $this->assertTrue($user->roles->contains('name', 'student'));
    }

    public function test_role_can_have_multiple_permissions(): void
    {
        $role = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $manageAppsPermission = Permission::create(['name' => 'manage-applications', 'description' => 'Manage applications']);
        $manageUsersPermission = Permission::create(['name' => 'manage-users', 'description' => 'Manage users']);

        $role->permissions()->attach([$manageAppsPermission->id, $manageUsersPermission->id]);

        $this->assertCount(2, $role->permissions);
        $this->assertTrue($role->permissions->contains('name', 'manage-applications'));
        $this->assertTrue($role->permissions->contains('name', 'manage-users'));
    }

    public function test_permission_can_belong_to_multiple_roles(): void
    {
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $moderatorRole = Role::create(['name' => 'moderator', 'description' => 'Moderator']);
        $permission = Permission::create(['name' => 'view-applications', 'description' => 'View applications']);

        $permission->roles()->attach([$adminRole->id, $moderatorRole->id]);

        $this->assertCount(2, $permission->roles);
        $this->assertTrue($permission->roles->contains('name', 'admin'));
        $this->assertTrue($permission->roles->contains('name', 'moderator'));
    }

    public function test_user_role_relationship_cascade_delete(): void
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'test-role', 'description' => 'Test role']);

        $user->roles()->attach($role->id);

        $this->assertDatabaseHas('role_user', [
            'user_id' => $user->id,
            'role_id' => $role->id
        ]);

        // Delete the role
        $role->delete();

        // The pivot record should be deleted due to cascade
        $this->assertDatabaseMissing('role_user', [
            'user_id' => $user->id,
            'role_id' => $role->id
        ]);
    }

    public function test_permission_role_relationship_cascade_delete(): void
    {
        $role = Role::create(['name' => 'test-role', 'description' => 'Test role']);
        $permission = Permission::create(['name' => 'test-permission', 'description' => 'Test permission']);

        $role->permissions()->attach($permission->id);

        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => $permission->id
        ]);

        // Delete the permission
        $permission->delete();

        // The pivot record should be deleted due to cascade
        $this->assertDatabaseMissing('permission_role', [
            'role_id' => $role->id,
            'permission_id' => $permission->id
        ]);
    }

    public function test_role_names_must_be_unique(): void
    {
        Role::create(['name' => 'admin', 'description' => 'Administrator']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Role::create(['name' => 'admin', 'description' => 'Another admin']);
    }

    public function test_permission_names_must_be_unique(): void
    {
        Permission::create(['name' => 'manage-users', 'description' => 'Manage users']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Permission::create(['name' => 'manage-users', 'description' => 'Another manage users']);
    }

    public function test_can_create_complete_rbac_scenario(): void
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $studentRole = Role::create(['name' => 'student', 'description' => 'Student']);

        // Create permissions
        $manageAppsPermission = Permission::create(['name' => 'manage-applications', 'description' => 'Manage applications']);
        $submitDocsPermission = Permission::create(['name' => 'submit-documents', 'description' => 'Submit documents']);
        $viewOwnDataPermission = Permission::create(['name' => 'view-own-data', 'description' => 'View own data']);

        // Assign permissions to roles
        $adminRole->permissions()->attach([$manageAppsPermission->id, $submitDocsPermission->id, $viewOwnDataPermission->id]);
        $studentRole->permissions()->attach([$submitDocsPermission->id, $viewOwnDataPermission->id]);

        // Create users and assign roles
        $admin = User::factory()->create(['name' => 'Admin User']);
        $student = User::factory()->create(['name' => 'Student User']);

        $admin->roles()->attach($adminRole->id);
        $student->roles()->attach($studentRole->id);

        // Verify admin has all permissions through role
        $this->assertCount(1, $admin->roles);
        $this->assertEquals('admin', $admin->roles->first()->name);
        $this->assertCount(3, $admin->roles->first()->permissions);

        // Verify student has limited permissions through role
        $this->assertCount(1, $student->roles);
        $this->assertEquals('student', $student->roles->first()->name);
        $this->assertCount(2, $student->roles->first()->permissions);

        // Verify specific permissions
        $adminPermissions = $admin->roles->first()->permissions->pluck('name')->toArray();
        $studentPermissions = $student->roles->first()->permissions->pluck('name')->toArray();

        $this->assertContains('manage-applications', $adminPermissions);
        $this->assertContains('submit-documents', $adminPermissions);
        $this->assertContains('view-own-data', $adminPermissions);

        $this->assertNotContains('manage-applications', $studentPermissions);
        $this->assertContains('submit-documents', $studentPermissions);
        $this->assertContains('view-own-data', $studentPermissions);
    }

    public function test_user_has_role_helper_method(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $studentRole = Role::create(['name' => 'student', 'description' => 'Student']);

        $user->roles()->attach($adminRole->id);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('student'));
        $this->assertFalse($user->hasRole('nonexistent'));
    }

    public function test_user_has_any_role_helper_method(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $moderatorRole = Role::create(['name' => 'moderator', 'description' => 'Moderator']);

        $user->roles()->attach($adminRole->id);

        $this->assertTrue($user->hasAnyRole(['admin', 'student']));
        $this->assertTrue($user->hasAnyRole(['admin']));
        $this->assertFalse($user->hasAnyRole(['student', 'moderator']));
        $this->assertFalse($user->hasAnyRole(['nonexistent']));
    }

    public function test_user_has_permission_helper_method(): void
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $permission = Permission::create(['name' => 'manage-applications', 'description' => 'Manage applications']);

        $role->permissions()->attach($permission->id);
        $user->roles()->attach($role->id);

        $this->assertTrue($user->hasPermission('manage-applications'));
        $this->assertFalse($user->hasPermission('nonexistent-permission'));
    }

    public function test_user_get_all_permissions_helper_method(): void
    {
        $user = User::factory()->create();
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $moderatorRole = Role::create(['name' => 'moderator', 'description' => 'Moderator']);

        $manageAppsPermission = Permission::create(['name' => 'manage-applications', 'description' => 'Manage applications']);
        $viewReportsPermission = Permission::create(['name' => 'view-reports', 'description' => 'View reports']);
        $submitDocsPermission = Permission::create(['name' => 'submit-documents', 'description' => 'Submit documents']);

        // Admin role has manage-applications and view-reports
        $adminRole->permissions()->attach([$manageAppsPermission->id, $viewReportsPermission->id]);
        // Moderator role has submit-documents and view-reports (overlap)
        $moderatorRole->permissions()->attach([$submitDocsPermission->id, $viewReportsPermission->id]);

        // User has both roles
        $user->roles()->attach([$adminRole->id, $moderatorRole->id]);

        $allPermissions = $user->getAllPermissions();
        $permissionNames = $allPermissions->pluck('name')->toArray();

        // Should have all unique permissions from both roles
        $this->assertCount(3, $allPermissions);
        $this->assertContains('manage-applications', $permissionNames);
        $this->assertContains('view-reports', $permissionNames);
        $this->assertContains('submit-documents', $permissionNames);
    }

    public function test_role_permission_seeder_creates_expected_data(): void
    {
        // Run the seeder
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        // Verify roles were created
        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('roles', ['name' => 'student']);
        $this->assertDatabaseHas('roles', ['name' => 'staff']);
        $this->assertDatabaseHas('roles', ['name' => 'moderator']);

        // Verify permissions were created
        $expectedPermissions = [
            'manage-applications',
            'submit-documents',
            'view-own-data',
            'users.manage',
            'view-reports',
            'approve-applications',
            'manage-programs',
            'verify-documents'
        ];

        foreach ($expectedPermissions as $permission) {
            $this->assertDatabaseHas('permissions', ['name' => $permission]);
        }

        // Verify role-permission assignments
        $adminRole = Role::where('name', 'admin')->first();
        $studentRole = Role::where('name', 'student')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();

        // Admin should have all permissions (legacy admin gets all permissions from seeder)
        $this->assertGreaterThan(8, $adminRole->permissions->count());

        // Student should have limited permissions (seeder gives legacy student role 4 permissions)
        $this->assertCount(4, $studentRole->permissions);
        $studentPermissionNames = $studentRole->permissions->pluck('name')->toArray();
        $this->assertContains('submit-documents', $studentPermissionNames);
        $this->assertContains('view-own-data', $studentPermissionNames);

        // Staff should have moderate permissions (seeder gives legacy staff role 8 permissions)
        $this->assertCount(8, $staffRole->permissions);
        $staffPermissionNames = $staffRole->permissions->pluck('name')->toArray();
        $this->assertContains('manage-applications', $staffPermissionNames);
        $this->assertContains('view-reports', $staffPermissionNames);
        $this->assertContains('verify-documents', $staffPermissionNames);
        $this->assertContains('manage-programs', $staffPermissionNames);

        // Moderator should have review permissions (seeder gives legacy moderator role 4 permissions)
        $this->assertCount(4, $moderatorRole->permissions);
        $moderatorPermissionNames = $moderatorRole->permissions->pluck('name')->toArray();
        $this->assertContains('approve-applications', $moderatorPermissionNames);
        $this->assertContains('view-reports', $moderatorPermissionNames);
        $this->assertContains('verify-documents', $moderatorPermissionNames);
    }
}
