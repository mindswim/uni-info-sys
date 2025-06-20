<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\AcademicRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicRecordCrudTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_create_academic_record_for_student()
    {
        // Create admin user
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        // Create student
        $student = Student::factory()->create();
        
        $academicData = [
            'institution_name' => 'University of California',
            'qualification_type' => 'Bachelor of Science',
            'start_date' => '2020-09-01',
            'end_date' => '2024-06-15',
            'gpa' => 3.85,
            'transcript_url' => 'https://example.com/transcript.pdf',
        ];
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/academic-records", $academicData);
        
        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'student_id',
                    'institution_name',
                    'qualification_type',
                    'start_date',
                    'end_date',
                    'gpa',
                    'transcript_url',
                    'verified',
                    'created_at',
                    'updated_at'
                ]
            ])
            ->assertJson([
                'message' => 'Academic record created successfully',
                'data' => [
                    'student_id' => $student->id,
                    'institution_name' => 'University of California',
                    'qualification_type' => 'Bachelor of Science',
                    'gpa' => 3.85,
                    'verified' => false
                ]
            ]);
        
        // Verify record was created in database
        $this->assertDatabaseHas('academic_records', [
            'student_id' => $student->id,
            'institution_name' => 'University of California',
            'qualification_type' => 'Bachelor of Science',
            'gpa' => 3.85,
            'verified' => false
        ]);
    }

    /** @test */
    public function student_cannot_create_academic_record()
    {
        // Create student user
        $user = User::factory()->create();
        $user->assignRole('student');
        $student = Student::factory()->create(['user_id' => $user->id]);
        
        $academicData = [
            'institution_name' => 'University of California',
            'qualification_type' => 'Bachelor of Science',
            'start_date' => '2020-09-01',
            'end_date' => '2024-06-15',
            'gpa' => 3.85,
        ];
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/academic-records", $academicData);
        
        $response->assertStatus(403);
    }

    /** @test */
    public function validation_works_for_academic_record_creation()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $student = Student::factory()->create();
        
        // Test missing required fields
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/academic-records", []);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'institution_name',
                'qualification_type',
                'start_date',
                'end_date',
                'gpa'
            ]);
        
        // Test invalid GPA
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/academic-records", [
                'institution_name' => 'University of California',
                'qualification_type' => 'Bachelor of Science',
                'start_date' => '2020-09-01',
                'end_date' => '2024-06-15',
                'gpa' => 5.0, // Invalid GPA > 4.0
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['gpa']);
        
        // Test invalid date range
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/academic-records", [
                'institution_name' => 'University of California',
                'qualification_type' => 'Bachelor of Science',
                'start_date' => '2024-06-15',
                'end_date' => '2020-09-01', // End date before start date
                'gpa' => 3.85,
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date', 'end_date']);
    }

    /** @test */
    public function admin_can_view_student_academic_records()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $student = Student::factory()->create();
        
        // Create some academic records for the student
        AcademicRecord::factory()->count(3)->create(['student_id' => $student->id]);
        
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/academic-records");
        
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function student_can_view_own_academic_records()
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        $student = Student::factory()->create(['user_id' => $user->id]);
        
        AcademicRecord::factory()->count(2)->create(['student_id' => $student->id]);
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/academic-records");
        
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function admin_can_update_academic_record()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $academicRecord = AcademicRecord::factory()->create([
            'institution_name' => 'Old University',
            'gpa' => 3.0
        ]);
        
        $updateData = [
            'institution_name' => 'New University',
            'gpa' => 3.8
        ];
        
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/academic-records/{$academicRecord->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Academic record updated successfully',
                'data' => [
                    'institution_name' => 'New University',
                    'gpa' => 3.8
                ]
            ]);
        
        $this->assertDatabaseHas('academic_records', [
            'id' => $academicRecord->id,
            'institution_name' => 'New University',
            'gpa' => 3.8
        ]);
    }

    /** @test */
    public function admin_can_delete_academic_record()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $academicRecord = AcademicRecord::factory()->create();
        
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/academic-records/{$academicRecord->id}");
        
        $response->assertStatus(200)
            ->assertJson(['message' => 'Academic record deleted successfully']);
        
        // Verify record was deleted from database
        $this->assertDatabaseMissing('academic_records', ['id' => $academicRecord->id]);
    }

    /** @test */
    public function student_cannot_update_or_delete_academic_records()
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        $student = Student::factory()->create(['user_id' => $user->id]);
        $academicRecord = AcademicRecord::factory()->create(['student_id' => $student->id]);
        
        // Test update
        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/academic-records/{$academicRecord->id}", [
                'institution_name' => 'Updated University'
            ]);
        
        $response->assertStatus(403);
        
        // Test delete
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/academic-records/{$academicRecord->id}");
        
        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_academic_records()
    {
        $student = Student::factory()->create();
        
        $response = $this->getJson("/api/v1/students/{$student->id}/academic-records");
        $response->assertStatus(401);
        
        $response = $this->postJson("/api/v1/students/{$student->id}/academic-records", [
            'institution_name' => 'University',
            'qualification_type' => 'Bachelor',
            'start_date' => '2020-01-01',
            'end_date' => '2024-01-01',
            'gpa' => 3.5
        ]);
        $response->assertStatus(401);
    }
}
