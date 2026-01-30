<?php

namespace Tests\Feature\Api\V1;

use App\Models\ApprovalRequest;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApprovalRequestApiTest extends TestCase
{
    use RefreshDatabase;

    private User $chairUser;

    private Staff $chairStaff;

    private Department $department;

    private Term $term;

    private CourseSection $section;

    protected function setUp(): void
    {
        parent::setUp();

        $this->chairUser = User::factory()->create();
        $chairRole = Role::firstOrCreate(['name' => 'department-chair'], ['description' => 'Department Chair']);
        $this->chairUser->roles()->attach($chairRole);

        $faculty = Faculty::factory()->create();
        $this->department = Department::factory()->create(['faculty_id' => $faculty->id]);
        $this->chairStaff = Staff::factory()->create([
            'user_id' => $this->chairUser->id,
            'department_id' => $this->department->id,
        ]);
        $this->department->update(['chair_id' => $this->chairStaff->id]);

        $this->term = Term::factory()->create();
        $course = \App\Models\Course::factory()->create(['department_id' => $this->department->id]);
        $this->section = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $this->term->id,
        ]);
    }

    public function test_chair_can_list_approval_requests(): void
    {
        ApprovalRequest::factory()->count(3)->create([
            'department_id' => $this->department->id,
            'requested_by' => $this->chairStaff->id,
        ]);

        Sanctum::actingAs($this->chairUser);

        $response = $this->getJson('/api/v1/department-chair/approval-requests');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_chair_can_create_approval_request(): void
    {
        Sanctum::actingAs($this->chairUser);

        $response = $this->postJson('/api/v1/department-chair/approval-requests', [
            'type' => 'section_offering',
            'requestable_type' => 'course_section',
            'requestable_id' => $this->section->id,
            'notes' => 'New section needed',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('approval_requests', [
            'type' => 'section_offering',
            'department_id' => $this->department->id,
            'status' => 'pending',
        ]);
    }

    public function test_chair_can_approve_request(): void
    {
        $approval = ApprovalRequest::factory()->create([
            'department_id' => $this->department->id,
            'requested_by' => $this->chairStaff->id,
        ]);

        Sanctum::actingAs($this->chairUser);

        $response = $this->postJson("/api/v1/department-chair/approval-requests/{$approval->id}/approve", [
            'notes' => 'Looks good',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('approval_requests', [
            'id' => $approval->id,
            'status' => 'approved',
        ]);
    }

    public function test_chair_can_deny_request(): void
    {
        $approval = ApprovalRequest::factory()->create([
            'department_id' => $this->department->id,
            'requested_by' => $this->chairStaff->id,
        ]);

        Sanctum::actingAs($this->chairUser);

        $response = $this->postJson("/api/v1/department-chair/approval-requests/{$approval->id}/deny", [
            'denial_reason' => 'Not justified',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('approval_requests', [
            'id' => $approval->id,
            'status' => 'denied',
        ]);
    }

    public function test_chair_cannot_see_other_department_requests(): void
    {
        $otherDept = Department::factory()->create(['faculty_id' => Faculty::factory()]);
        ApprovalRequest::factory()->create([
            'department_id' => $otherDept->id,
        ]);

        Sanctum::actingAs($this->chairUser);

        $response = $this->getJson('/api/v1/department-chair/approval-requests?status=pending');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_non_chair_gets_403(): void
    {
        $regularUser = User::factory()->create();
        $staffRole = Role::firstOrCreate(['name' => 'staff'], ['description' => 'Staff']);
        $regularUser->roles()->attach($staffRole);

        Sanctum::actingAs($regularUser);

        $response = $this->getJson('/api/v1/department-chair/approval-requests');

        $response->assertForbidden();
    }
}
