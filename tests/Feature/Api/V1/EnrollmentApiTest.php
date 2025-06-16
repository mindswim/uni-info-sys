<?php

namespace Tests\Feature\Api\V1;

use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class EnrollmentApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
    }

    private function getEnrollmentData(array $overrides = []): array
    {
        return array_merge([
            'student_id' => Student::factory()->create()->id,
            'course_section_id' => CourseSection::factory()->create()->id,
        ], $overrides);
    }
    
    public function test_can_get_all_enrollments_paginated()
    {
        Enrollment::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/enrollments');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['*' => ['id', 'status', 'student', 'course_section']],
                'links',
                'meta',
            ])
            ->assertJsonCount(10, 'data');
    }

    public function test_can_filter_enrollments()
    {
        $student1 = Student::factory()->create();
        $student2 = Student::factory()->create();
        $section = CourseSection::factory()->create();

        Enrollment::factory()->create(['student_id' => $student1->id, 'course_section_id' => $section->id]);
        Enrollment::factory()->create(['student_id' => $student2->id, 'course_section_id' => $section->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/enrollments?student_id={$student1->id}");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($student1->id, $response->json('data.0.student.id'));
    }

    public function test_can_create_an_enrollment()
    {
        $data = $this->getEnrollmentData();
        
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/enrollments', $data);
        
        $response->assertStatus(201)
            ->assertJsonFragment(['status' => 'enrolled'])
            ->assertJsonPath('data.student.id', $data['student_id']);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $data['student_id'],
            'course_section_id' => $data['course_section_id'],
            'status' => 'enrolled'
        ]);
    }

    public function test_cannot_enroll_in_full_course_section()
    {
        $section = CourseSection::factory()->create(['capacity' => 1]);
        Enrollment::factory()->create(['course_section_id' => $section->id]);

        $data = $this->getEnrollmentData(['course_section_id' => $section->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/enrollments', $data);
        
        $response->assertStatus(422)->assertJsonValidationErrors(['course_section_id']);
    }

    public function test_cannot_enroll_in_same_section_twice()
    {
        $enrollment = Enrollment::factory()->create();

        $data = [
            'student_id' => $enrollment->student_id,
            'course_section_id' => $enrollment->course_section_id,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/enrollments', $data);
        
        $response->assertStatus(422)->assertJsonValidationErrors(['student_id']);
    }

    public function test_can_get_a_single_enrollment()
    {
        $enrollment = Enrollment::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/enrollments/{$enrollment->id}");

        $response->assertStatus(200)->assertJsonFragment(['id' => $enrollment->id]);
    }

    public function test_can_update_enrollment_status()
    {
        $enrollment = Enrollment::factory()->create(['status' => 'enrolled']);
        
        $updateData = ['status' => 'completed'];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/enrollments/{$enrollment->id}", $updateData);
        
        $response->assertStatus(200)->assertJsonFragment($updateData);

        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id, 'status' => 'completed']);
    }

    public function test_destroy_enrollment_withdraws_student()
    {
        $enrollment = Enrollment::factory()->create(['status' => 'enrolled']);
        
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/enrollments/{$enrollment->id}");

        $response->assertStatus(200)->assertJsonFragment(['status' => 'withdrawn']);

        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id, 'status' => 'withdrawn']);
    }
}
