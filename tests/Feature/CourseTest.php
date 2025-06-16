<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;
use App\Models\Course;
use App\Models\Department;
use App\Models\Faculty;

class CourseTest extends TestCase
{
    use RefreshDatabase;

    protected function create_department(): Department
    {
        $faculty = Faculty::factory()->create();
        return Department::factory()->create(['faculty_id' => $faculty->id]);
    }

    /** @test */
    public function can_create_a_course()
    {
        $department = $this->create_department();

        $course = Course::factory()->create([
            'department_id' => $department->id,
            'course_code' => 'CS101',
            'title' => 'Introduction to Computer Science',
            'credits' => 3,
        ]);

        $this->assertDatabaseHas('courses', ['course_code' => 'CS101']);
        $this->assertEquals($department->id, $course->department->id);
    }

    /** @test */
    public function course_code_must_be_unique()
    {
        $this->expectException(QueryException::class);
        $department = $this->create_department();

        Course::factory()->create(['course_code' => 'ENG202', 'department_id' => $department->id]);
        Course::factory()->create(['course_code' => 'ENG202', 'department_id' => $department->id]);
    }

    /** @test */
    public function course_belongs_to_a_department()
    {
        $department = $this->create_department();
        $course = Course::factory()->create(['department_id' => $department->id]);

        $this->assertInstanceOf(Department::class, $course->department);
        $this->assertEquals($department->name, $course->department->name);
    }

    /** @test */
    public function deleting_a_department_cascades_to_courses()
    {
        $department = $this->create_department();
        $course = Course::factory()->create(['department_id' => $department->id]);

        $this->assertDatabaseHas('courses', ['id' => $course->id]);

        $department->delete();

        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    /** @test */
    public function can_add_and_retrieve_prerequisites_for_a_course()
    {
        $department = $this->create_department();
        $course1 = Course::factory()->create(['department_id' => $department->id]);
        $prereq1 = Course::factory()->create(['department_id' => $department->id]);
        $prereq2 = Course::factory()->create(['department_id' => $department->id]);

        $course1->prerequisites()->attach([$prereq1->id, $prereq2->id]);

        $this->assertCount(2, $course1->prerequisites);
        $this->assertTrue($course1->prerequisites->contains($prereq1));
        $this->assertTrue($course1->prerequisites->contains($prereq2));
    }

    /** @test */
    public function can_retrieve_courses_for_which_a_course_is_a_prerequisite()
    {
        $department = $this->create_department();
        $main_course1 = Course::factory()->create(['department_id' => $department->id]);
        $main_course2 = Course::factory()->create(['department_id' => $department->id]);
        $prereq = Course::factory()->create(['department_id' => $department->id]);

        $main_course1->prerequisites()->attach($prereq->id);
        $main_course2->prerequisites()->attach($prereq->id);

        $this->assertCount(2, $prereq->isPrerequisiteFor);
        $this->assertTrue($prereq->isPrerequisiteFor->contains($main_course1));
        $this->assertTrue($prereq->isPrerequisiteFor->contains($main_course2));
    }

    /** @test */
    public function deleting_course_removes_prerequisite_pivot_records()
    {
        $department = $this->create_department();
        $course = Course::factory()->create(['department_id' => $department->id]);
        $prereq = Course::factory()->create(['department_id' => $department->id]);

        $course->prerequisites()->attach($prereq->id);
        $this->assertDatabaseHas('course_prerequisites', [
            'course_id' => $course->id,
            'prerequisite_id' => $prereq->id
        ]);

        $course->delete();
        $this->assertDatabaseMissing('course_prerequisites', [
            'course_id' => $course->id,
            'prerequisite_id' => $prereq->id
        ]);
    }
}
