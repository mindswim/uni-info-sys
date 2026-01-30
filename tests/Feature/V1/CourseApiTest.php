<?php

namespace Tests\Feature\Api\V1;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Tests\Traits\CreatesUsersWithRoles;

class CourseApiTest extends TestCase
{
    use CreatesUsersWithRoles, RefreshDatabase, WithFaker;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
    }

    private function getCourseData(array $overrides = []): array
    {
        $department = Department::factory()->create();

        return array_merge([
            'title' => $this->faker->sentence(3),
            'course_code' => $this->faker->unique()->bothify('CS###'),
            'description' => $this->faker->paragraph,
            'credits' => $this->faker->numberBetween(1, 5),
            'department_id' => $department->id,
            'prerequisites' => [],
        ], $overrides);
    }

    public function test_can_get_all_courses_paginated()
    {
        Course::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/courses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'course_code', 'credits', 'description', 'department', 'prerequisite_courses'],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(10, 'data'); // Default pagination
    }

    public function test_can_filter_courses_by_department()
    {
        $department1 = Department::factory()->create();
        $department2 = Department::factory()->create();
        Course::factory()->count(3)->create(['department_id' => $department1->id]);
        Course::factory()->count(2)->create(['department_id' => $department2->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/courses?department_id={$department1->id}");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
        foreach ($response->json('data') as $course) {
            $this->assertEquals($department1->id, $course['department']['id']);
        }
    }

    public function test_can_create_a_course_without_prerequisites()
    {
        $data = $this->getCourseData();

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/courses', $data);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'title' => $data['title'],
                'course_code' => $data['course_code'],
            ]);

        $this->assertDatabaseHas('courses', ['title' => $data['title']]);
        $this->assertCount(0, $response->json('data.prerequisite_courses'));
    }

    public function test_can_create_a_course_with_prerequisites()
    {
        $prereq1 = Course::factory()->create();
        $prereq2 = Course::factory()->create();
        $data = $this->getCourseData([
            'prerequisites' => [$prereq1->id, $prereq2->id],
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/courses', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('course_prerequisites', ['course_id' => $response->json('data.id'), 'prerequisite_id' => $prereq1->id]);
        $this->assertDatabaseHas('course_prerequisites', ['course_id' => $response->json('data.id'), 'prerequisite_id' => $prereq2->id]);
        $this->assertCount(2, $response->json('data.prerequisite_courses'));
    }

    public function test_create_course_validation_fails()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/courses', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'course_code', 'credits', 'department_id']);
    }

    public function test_can_get_a_single_course()
    {
        $course = Course::factory()->create();
        $prereq = Course::factory()->create();
        $course->prerequisiteCourses()->attach($prereq->id);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/courses/{$course->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $course->id,
                'title' => $course->title,
            ])
            ->assertJsonCount(1, 'data.prerequisite_courses');
    }

    public function test_can_update_a_course()
    {
        $course = Course::factory()->create();
        $prereq = Course::factory()->create();
        $newDepartment = Department::factory()->create();

        $updateData = [
            'title' => 'Updated Title',
            'prerequisites' => [$prereq->id],
            'department_id' => $newDepartment->id,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/courses/{$course->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Updated Title'])
            ->assertJsonFragment(['id' => $newDepartment->id]);

        $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => 'Updated Title']);
        $this->assertDatabaseHas('course_prerequisites', ['course_id' => $course->id, 'prerequisite_id' => $prereq->id]);
        $this->assertCount(1, $response->json('data.prerequisite_courses'));
    }

    public function test_update_can_remove_prerequisites()
    {
        $prereq = Course::factory()->create();
        $course = Course::factory()->hasAttached($prereq, [], 'prerequisiteCourses')->create();

        $this->assertDatabaseHas('course_prerequisites', ['course_id' => $course->id, 'prerequisite_id' => $prereq->id]);

        $updateData = ['prerequisites' => []];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/courses/{$course->id}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('course_prerequisites', ['course_id' => $course->id, 'prerequisite_id' => $prereq->id]);
        $this->assertCount(0, $response->json('data.prerequisite_courses'));
    }

    public function test_can_delete_a_course()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/courses/{$course->id}");

        $response->assertStatus(204);

        // Check for soft delete
        $this->assertSoftDeleted('courses', ['id' => $course->id]);
    }
}
