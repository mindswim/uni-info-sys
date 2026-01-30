<?php

namespace Tests\Feature\Api\V1;

use App\Models\Course;
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

class InstructorAssignmentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $chairUser;
    private Staff $chairStaff;
    private Department $department;
    private CourseSection $section;
    private Staff $instructor;
    private Term $term;

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

        $this->instructor = Staff::factory()->create([
            'department_id' => $this->department->id,
        ]);

        $this->term = Term::factory()->create();
        $course = Course::factory()->create(['department_id' => $this->department->id]);
        $this->section = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $this->term->id,
        ]);
    }

    public function test_chair_can_assign_instructor_to_own_department_section(): void
    {
        Sanctum::actingAs($this->chairUser);

        $response = $this->putJson("/api/v1/department-chair/sections/{$this->section->id}/assign-instructor", [
            'instructor_id' => $this->instructor->id,
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.instructor_id', $this->instructor->id);
        $this->assertDatabaseHas('course_sections', [
            'id' => $this->section->id,
            'instructor_id' => $this->instructor->id,
        ]);
    }

    public function test_chair_cannot_assign_to_other_department_section(): void
    {
        $otherFaculty = Faculty::factory()->create();
        $otherDept = Department::factory()->create(['faculty_id' => $otherFaculty->id]);
        $otherCourse = Course::factory()->create(['department_id' => $otherDept->id]);
        $otherSection = CourseSection::factory()->create([
            'course_id' => $otherCourse->id,
            'term_id' => $this->term->id,
        ]);

        Sanctum::actingAs($this->chairUser);

        $response = $this->putJson("/api/v1/department-chair/sections/{$otherSection->id}/assign-instructor", [
            'instructor_id' => $this->instructor->id,
        ]);

        $response->assertNotFound();
    }

    public function test_validates_staff_exists(): void
    {
        Sanctum::actingAs($this->chairUser);

        $response = $this->putJson("/api/v1/department-chair/sections/{$this->section->id}/assign-instructor", [
            'instructor_id' => 99999,
        ]);

        $response->assertUnprocessable();
    }
}
