<?php

namespace Tests\Unit\Services;

use App\Models\ApprovalRequest;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Staff;
use App\Services\ApprovalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApprovalServiceTest extends TestCase
{
    use RefreshDatabase;

    private ApprovalService $service;

    private Department $department;

    private Staff $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ApprovalService::class);

        $faculty = Faculty::factory()->create();
        $this->department = Department::factory()->create(['faculty_id' => $faculty->id]);
        $this->staff = Staff::factory()->create(['department_id' => $this->department->id]);
    }

    public function test_create_request(): void
    {
        $course = \App\Models\Course::factory()->create(['department_id' => $this->department->id]);
        $section = CourseSection::factory()->create(['course_id' => $course->id]);

        $result = $this->service->createRequest(
            'section_offering',
            $section,
            $this->department,
            $this->staff,
            'Test notes',
        );

        $this->assertInstanceOf(ApprovalRequest::class, $result);
        $this->assertEquals('pending', $result->status);
        $this->assertEquals($this->department->id, $result->department_id);
    }

    public function test_approve(): void
    {
        $approval = ApprovalRequest::factory()->create([
            'department_id' => $this->department->id,
            'requested_by' => $this->staff->id,
        ]);

        $result = $this->service->approve($approval, $this->staff, 'Approved');

        $this->assertEquals('approved', $result->status);
        $this->assertEquals($this->staff->id, $result->approved_by);
        $this->assertNotNull($result->approved_at);
    }

    public function test_approve_enrollment_override_increments_capacity(): void
    {
        $course = \App\Models\Course::factory()->create(['department_id' => $this->department->id]);
        $section = CourseSection::factory()->create([
            'course_id' => $course->id,
            'capacity' => 30,
        ]);

        $approval = ApprovalRequest::factory()->create([
            'type' => ApprovalRequest::TYPE_ENROLLMENT_OVERRIDE,
            'department_id' => $this->department->id,
            'requested_by' => $this->staff->id,
            'metadata' => ['course_section_id' => $section->id],
        ]);

        $this->service->approve($approval, $this->staff);

        $section->refresh();
        $this->assertEquals(31, $section->capacity);
    }

    public function test_deny(): void
    {
        $approval = ApprovalRequest::factory()->create([
            'department_id' => $this->department->id,
            'requested_by' => $this->staff->id,
        ]);

        $result = $this->service->deny($approval, $this->staff, 'Not justified');

        $this->assertEquals('denied', $result->status);
        $this->assertEquals('Not justified', $result->denial_reason);
    }
}
