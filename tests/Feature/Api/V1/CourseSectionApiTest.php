<?php

namespace Tests\Feature\Api\V1;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Building;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourseSectionApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Term $term;
    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user, ['*']);

        $this->term = Term::factory()->create();
        $department = Department::factory()->for(Faculty::factory())->create();
        $this->course = Course::factory()->for($department)->create();
    }

    private function createCourseSection(array $overrides = []): CourseSection
    {
        return CourseSection::factory()->for($this->course)->for($this->term)->create($overrides);
    }

    public function test_can_get_paginated_course_sections()
    {
        $this->createCourseSection();
        $response = $this->getJson('/api/v1/course-sections');
        $response->assertOk()->assertJsonStructure(['data' => [['id']], 'links', 'meta']);
    }

    public function test_can_filter_course_sections_by_term()
    {
        $this->createCourseSection();
        $otherTerm = Term::factory()->create();
        $this->createCourseSection(['term_id' => $otherTerm->id]);

        $response = $this->getJson('/api/v1/course-sections?term_id=' . $this->term->id);
        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_can_filter_course_sections_by_instructor()
    {
        $staff = Staff::factory()->for(User::factory())->create();
        $this->createCourseSection(['instructor_id' => $staff->id]);
        $this->createCourseSection();

        $response = $this->getJson('/api/v1/course-sections?instructor_id=' . $staff->id);
        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_can_include_enrollment_counts()
    {
        $section = $this->createCourseSection(['capacity' => 10]);
        Enrollment::factory()->count(5)->for($section)->create();

        $response = $this->getJson("/api/v1/course-sections/{$section->id}?include_enrollment_counts=true");
        $response->assertOk()
            ->assertJsonPath('data.enrolled_count', 5)
            ->assertJsonPath('data.available_spots', 5);
    }

    public function test_can_create_a_course_section()
    {
        $room = Room::factory()->for(Building::factory())->create();
        $staff = Staff::factory()->for(User::factory())->create();
        $data = [
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'section_number' => 'A1',
            'capacity' => 100,
            'instructor_id' => $staff->id,
            'room_id' => $room->id,
            'schedule_days' => 'MWF',
            'start_time' => '10:00',
            'end_time' => '11:00',
        ];

        $response = $this->postJson('/api/v1/course-sections', $data);

        $response->assertStatus(201)->assertJsonPath('data.section_number', 'A1');
        $this->assertDatabaseHas('course_sections', ['section_number' => 'A1']);
    }

    public function test_create_section_validates_unique_section_number_per_course_term()
    {
        $this->createCourseSection(['section_number' => 'A1']);
        $data = [
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'section_number' => 'A1',
            'capacity' => 50
        ];
        $response = $this->postJson('/api/v1/course-sections', $data);
        $response->assertStatus(422)->assertJsonValidationErrors('section_number');
    }

    public function test_can_get_a_single_course_section()
    {
        $section = $this->createCourseSection();
        $response = $this->getJson('/api/v1/course-sections/' . $section->id);
        $response->assertOk()->assertJsonPath('data.id', $section->id);
    }

    public function test_can_update_a_course_section()
    {
        $section = $this->createCourseSection();
        $updateData = ['capacity' => 150];
        $response = $this->putJson('/api/v1/course-sections/' . $section->id, $updateData);
        $response->assertOk()->assertJsonPath('data.capacity', 150);
        $this->assertDatabaseHas('course_sections', ['id' => $section->id, 'capacity' => 150]);
    }

    public function test_can_delete_a_course_section()
    {
        $section = $this->createCourseSection();
        $response = $this->deleteJson('/api/v1/course-sections/' . $section->id);
        $response->assertNoContent();
        $this->assertDatabaseMissing('course_sections', ['id' => $section->id]);
    }
}
