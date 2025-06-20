<?php

namespace Tests\Feature\Api\V1;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CourseSectionApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    private function getSectionData(array $overrides = []): array
    {
        return array_merge([
            'course_id' => Course::factory()->create()->id,
            'term_id' => Term::factory()->create()->id,
            'instructor_id' => Staff::factory()->create()->id,
            'room_id' => Room::factory()->create()->id,
            'capacity' => 100,
            'schedule_days' => ['Monday', 'Wednesday'],
            'start_time' => '10:00',
            'end_time' => '11:30',
        ], $overrides);
    }
    
    public function test_can_get_all_course_sections_paginated()
    {
        CourseSection::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/course-sections');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['*' => ['id', 'capacity', 'schedule_days', 'course', 'term', 'instructor', 'room']],
                'links',
                'meta',
            ])
            ->assertJsonCount(10, 'data');
    }

    public function test_can_filter_course_sections()
    {
        $course1 = Course::factory()->create();
        $course2 = Course::factory()->create();
        $term = Term::factory()->create();

        CourseSection::factory()->count(3)->create(['course_id' => $course1->id, 'term_id' => $term->id]);
        CourseSection::factory()->count(2)->create(['course_id' => $course2->id, 'term_id' => $term->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/course-sections?course_id={$course1->id}&term_id={$term->id}");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
        foreach($response->json('data') as $section) {
            $this->assertEquals($course1->id, $section['course']['id']);
            $this->assertEquals($term->id, $section['term']['id']);
        }
    }

    public function test_can_create_a_course_section()
    {
        $data = $this->getSectionData();
        
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/course-sections', $data);
        
        $response->assertStatus(201)
            ->assertJsonFragment([
                'capacity' => 100,
                'schedule_days' => ['Monday', 'Wednesday'],
                'start_time' => '10:00',
            ])
            ->assertJsonPath('data.course.id', $data['course_id']);

        $this->assertDatabaseHas('course_sections', ['course_id' => $data['course_id'], 'capacity' => 100]);
    }

    public function test_can_get_a_single_course_section()
    {
        $section = CourseSection::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/course-sections/{$section->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $section->id]);
    }

    public function test_can_update_a_course_section()
    {
        $section = CourseSection::factory()->create();
        $newRoom = Room::factory()->create();
        
        $updateData = ['capacity' => 150, 'room_id' => $newRoom->id];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/course-sections/{$section->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJsonFragment(['capacity' => 150])
            ->assertJsonPath('data.room.id', $newRoom->id);

        $this->assertDatabaseHas('course_sections', ['id' => $section->id, 'capacity' => 150]);
    }

    public function test_can_delete_a_course_section()
    {
        $section = CourseSection::factory()->create();
        
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/course-sections/{$section->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('course_sections', ['id' => $section->id]);
    }
}
