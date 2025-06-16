<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\CourseSection;
use App\Models\User;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_create_an_enrollment()
    {
        $student = Student::factory()->for(User::factory())->create();
        $section = CourseSection::factory()->create();

        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $section->id,
            'status' => 'enrolled',
        ]);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_section_id' => $section->id
        ]);
        $this->assertEquals('enrolled', $enrollment->status);
    }

    /** @test */
    public function a_student_cannot_enroll_in_the_same_section_twice()
    {
        $this->expectException(QueryException::class);
        
        $student = Student::factory()->for(User::factory())->create();
        $section = CourseSection::factory()->create();

        Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $section->id,
        ]);

        Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $section->id,
        ]);
    }

    /** @test */
    public function enrollment_belongs_to_student_and_course_section()
    {
        $student = Student::factory()->for(User::factory())->create();
        $section = CourseSection::factory()->create();
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $section->id,
        ]);

        $this->assertInstanceOf(Student::class, $enrollment->student);
        $this->assertInstanceOf(CourseSection::class, $enrollment->courseSection);
        $this->assertTrue($enrollment->student->is($student));
        $this->assertTrue($enrollment->courseSection->is($section));
    }

    /** @test */
    public function deleting_a_student_cascades_to_enrollments()
    {
        $student = Student::factory()->for(User::factory())->create();
        $enrollment = Enrollment::factory()->create(['student_id' => $student->id]);

        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id]);
        $student->delete();
        $this->assertDatabaseMissing('enrollments', ['id' => $enrollment->id]);
    }

    /** @test */
    public function deleting_a_course_section_cascades_to_enrollments()
    {
        $section = CourseSection::factory()->create();
        $enrollment = Enrollment::factory()->create(['course_section_id' => $section->id]);

        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id]);
        $section->delete();
        $this->assertDatabaseMissing('enrollments', ['id' => $enrollment->id]);
    }
}
