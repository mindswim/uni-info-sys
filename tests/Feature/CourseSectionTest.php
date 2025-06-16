<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;
use App\Models\CourseSection;
use App\Models\Course;
use App\Models\Term;
use App\Models\Staff;
use App\Models\Room;
use App\Models\Building;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\User;

class CourseSectionTest extends TestCase
{
    use RefreshDatabase;

    private function create_prerequisites()
    {
        $faculty = Faculty::factory()->create();
        $department = Department::factory()->create(['faculty_id' => $faculty->id]);
        $course = Course::factory()->create(['department_id' => $department->id]);
        $term = Term::factory()->create();
        $instructor = Staff::factory()->create([
            'user_id' => User::factory()->create()->id,
            'department_id' => $department->id,
        ]);
        $building = Building::factory()->create();
        $room = Room::factory()->create(['building_id' => $building->id]);

        return ['course_id' => $course->id, 'term_id' => $term->id, 'instructor_id' => $instructor->id, 'room_id' => $room->id];
    }
    
    /** @test */
    public function can_create_a_course_section()
    {
        $data = $this->create_prerequisites();

        $section = CourseSection::factory()->create(array_merge($data, [
            'schedule_days' => 'MWF',
            'start_time' => '10:00:00',
            'capacity' => 50,
        ]));

        $this->assertDatabaseHas('course_sections', ['schedule_days' => 'MWF', 'start_time' => '10:00:00']);
        $this->assertEquals($data['course_id'], $section->course->id);
        $this->assertEquals($data['term_id'], $section->term->id);
        $this->assertEquals($data['instructor_id'], $section->instructor->id);
        $this->assertEquals($data['room_id'], $section->room->id);
    }

    /** @test */
    public function deleting_related_models_sets_foreign_keys_to_null()
    {
        $course = Course::factory()->create();
        $term = Term::factory()->create();
        $instructor = Staff::factory()->create();
        $room = Room::factory()->create();

        $section = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id
        ]);

        $course->delete();
        $section->refresh();
        $this->assertNull($section->course_id);

        $term->delete();
        $section->refresh();
        $this->assertNull($section->term_id);
        
        $instructor->delete();
        $section->refresh();
        $this->assertNull($section->instructor_id);

        $room->delete();
        $section->refresh();
        $this->assertNull($section->room_id);
    }
}
