<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicRecordControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate a user
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Create a student for testing
        $this->student = Student::factory()->create();
    }

    public function test_can_get_student_academic_records(): void
    {
        AcademicRecord::factory()->count(3)->create([
            'student_id' => $this->student->id
        ]);

        $response = $this->getJson("/students/{$this->student->id}/academic-records");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_create_academic_record(): void
    {
        $recordData = [
            'institution_name' => 'Test University',
            'qualification_type' => 'Bachelor Degree',
            'start_date' => '2020-09-01',
            'end_date' => '2024-06-30',
            'gpa' => 3.75,
            'transcript_url' => 'path/to/transcript.pdf',
            'verified' => false
        ];

        $response = $this->postJson(
            "/students/{$this->student->id}/academic-records",
            $recordData
        );

        $response->assertStatus(201)
            ->assertJsonFragment([
                'institution_name' => 'Test University',
                'qualification_type' => 'Bachelor Degree'
            ]);
    }

    public function test_can_show_academic_record(): void
    {
        $record = AcademicRecord::factory()->create([
            'student_id' => $this->student->id
        ]);

        $response = $this->getJson("/students/{$this->student->id}/academic-records/{$record->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $record->id,
                'institution_name' => $record->institution_name
            ]);
    }

    public function test_can_update_academic_record(): void
    {
        $record = AcademicRecord::factory()->create([
            'student_id' => $this->student->id
        ]);

        $updateData = [
            'institution_name' => 'Updated University',
            'gpa' => 3.90
        ];

        $response = $this->putJson(
            "/students/{$this->student->id}/academic-records/{$record->id}",
            $updateData
        );

        $response->assertStatus(200)
            ->assertJsonFragment([
                'institution_name' => 'Updated University',
                'gpa' => 3.90
            ]);
    }

    public function test_can_delete_academic_record(): void
    {
        $record = AcademicRecord::factory()->create([
            'student_id' => $this->student->id
        ]);

        $response = $this->deleteJson(
            "/students/{$this->student->id}/academic-records/{$record->id}"
        );

        $response->assertStatus(204);
        $this->assertDatabaseMissing('academic_records', ['id' => $record->id]);
    }

    public function test_validate_required_fields_for_creation(): void
    {
        $response = $this->postJson(
            "/students/{$this->student->id}/academic-records",
            []
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'institution_name',
                'qualification_type',
                'start_date',
                'end_date',
                'gpa'
            ]);
    }

    public function test_cannot_access_other_student_records(): void
    {
        $otherStudent = Student::factory()->create();
        $record = AcademicRecord::factory()->create([
            'student_id' => $otherStudent->id
        ]);

        $response = $this->getJson(
            "/students/{$this->student->id}/academic-records/{$record->id}"
        );

        $response->assertStatus(404);
    }

    public function test_end_date_must_be_after_start_date(): void
    {
        $recordData = [
            'institution_name' => 'Test University',
            'qualification_type' => 'Bachelor Degree',
            'start_date' => '2024-01-01',
            'end_date' => '2023-01-01', // Date before start_date
            'gpa' => 3.75
        ];

        $response = $this->postJson(
            "/students/{$this->student->id}/academic-records",
            $recordData
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }
}
