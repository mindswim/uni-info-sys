<?php

namespace Tests\Feature\Api\V1;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Faculty;
use App\Models\Role;
use App\Models\Staff;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FacultyPerformanceApiTest extends TestCase
{
    use RefreshDatabase;

    private User $chairUser;

    private Staff $chairStaff;

    private Department $department;

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

        // Create an instructor in the department with a section and enrollment
        $term = Term::factory()->create(['is_current' => true]);
        $course = Course::factory()->create(['department_id' => $this->department->id]);
        $instructor = Staff::factory()->create(['department_id' => $this->department->id]);
        $section = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'instructor_id' => $instructor->id,
        ]);
        Enrollment::factory()->create([
            'course_section_id' => $section->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_chair_can_view_faculty_performance(): void
    {
        Sanctum::actingAs($this->chairUser);

        $response = $this->getJson('/api/v1/department-chair/faculty-performance');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'email',
                    'job_title',
                    'sections_taught',
                    'total_enrolled',
                    'avg_enrollment',
                    'avg_evaluation_score',
                    'grade_distribution',
                ],
            ],
        ]);
    }

    public function test_performance_scoped_to_department(): void
    {
        // Create faculty in another department
        $otherFaculty = Faculty::factory()->create();
        $otherDept = Department::factory()->create(['faculty_id' => $otherFaculty->id]);
        Staff::factory()->count(3)->create(['department_id' => $otherDept->id]);

        Sanctum::actingAs($this->chairUser);

        $response = $this->getJson('/api/v1/department-chair/faculty-performance');

        $response->assertOk();
        $data = $response->json('data');
        foreach ($data as $member) {
            $staff = Staff::find($member['id']);
            $this->assertEquals($this->department->id, $staff->department_id);
        }
    }
}
