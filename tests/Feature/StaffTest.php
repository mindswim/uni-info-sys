<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;
use App\Models\Staff;
use App\Models\User;
use App\Models\Department;
use App\Models\Faculty;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    private function create_department()
    {
        $faculty = Faculty::factory()->create();
        return Department::factory()->create(['faculty_id' => $faculty->id]);
    }

    /** @test */
    public function can_create_a_staff_member()
    {
        $user = User::factory()->create();
        $department = $this->create_department();

        $staff = Staff::factory()->create([
            'user_id' => $user->id,
            'department_id' => $department->id,
            'job_title' => 'Professor',
        ]);

        $this->assertDatabaseHas('staff', [
            'user_id' => $user->id,
            'job_title' => 'Professor'
        ]);
        $this->assertTrue($staff->user->is($user));
        $this->assertTrue($staff->department->is($department));
    }

    /** @test */
    public function user_id_must_be_unique_on_staff_table()
    {
        $this->expectException(QueryException::class);
        $user = User::factory()->create();
        Staff::factory()->create(['user_id' => $user->id]);
        Staff::factory()->create(['user_id' => $user->id]);
    }

    /** @test */
    public function staff_belongs_to_a_user()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $staff->user);
        $this->assertEquals($user->id, $staff->user->id);
    }

    /** @test */
    public function user_has_one_staff_profile()
    {
        $user = User::factory()->create();
        Staff::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(Staff::class, $user->staff);
    }
    
    /** @test */
    public function deleting_a_user_cascades_to_staff()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $this->assertDatabaseHas('staff', ['id' => $staff->id]);
        $user->delete();
        $this->assertDatabaseMissing('staff', ['id' => $staff->id]);
    }

    /** @test */
    public function deleting_a_department_sets_staff_department_id_to_null()
    {
        $department = $this->create_department();
        $staff = Staff::factory()->create(['department_id' => $department->id]);
        $this->assertNotNull($staff->department_id);
        $department->delete();
        $staff->refresh();
        $this->assertNull($staff->department_id);
    }
}
