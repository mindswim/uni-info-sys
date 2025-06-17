<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\AdmissionApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdmissionApplicationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate user
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        
        // Create student with complete profile
        $this->student = Student::factory()->create([
            'user_id' => $this->user->id,
            'student_number' => 'ST12345',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '12345',
            'country' => 'Test Country',
            'phone' => '123-456-7890',
            'emergency_contact_name' => 'Jane Doe',
            'emergency_contact_phone' => '987-654-3210'
        ]);
    }

    public function test_can_create_application()
    {
        $applicationData = [
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
        ];

        $response = $this->postJson("/students/{$this->student->id}/applications", $applicationData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'academic_year' => '2024-2025',
                'semester' => 'Fall',
                'status' => 'draft' // The service always creates draft applications
            ]);
    }

    public function test_returns_existing_draft_application()
    {
        // Create first draft application
        $firstApplicationData = [
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
        ];

        $firstResponse = $this->postJson("/students/{$this->student->id}/applications", $firstApplicationData);
        $firstApplication = $firstResponse->json();

        // Try to create another draft application
        $secondApplicationData = [
            'academic_year' => '2025-2026',
            'semester' => 'Spring',
        ];

        $secondResponse = $this->postJson("/students/{$this->student->id}/applications", $secondApplicationData);
        $secondApplication = $secondResponse->json();

        // Should return the same application (existing draft)
        $this->assertEquals($firstApplication['id'], $secondApplication['id']);
        $this->assertEquals('draft', $secondApplication['status']);
        
        // Should only have one application in the database
        $this->assertEquals(1, AdmissionApplication::where('student_id', $this->student->id)->count());
    }

    public function test_can_list_applications()
    {
        AdmissionApplication::factory()->draft()->count(3)->create([
            'student_id' => $this->student->id,
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'application_date' => now()
        ]);

        $response = $this->getJson("/students/{$this->student->id}/applications");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_view_application()
    {
        $application = AdmissionApplication::factory()->draft()->create([
            'student_id' => $this->student->id,
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'application_date' => now()
        ]);

        $response = $this->getJson("/students/{$this->student->id}/applications/{$application->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'academic_year' => '2024-2025',
                'semester' => 'Fall'
            ]);
    }

    public function test_cannot_view_other_student_application()
    {
        $otherStudent = Student::factory()->create();
        $application = AdmissionApplication::factory()->draft()->create([
            'student_id' => $otherStudent->id,
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'application_date' => now()
        ]);

        $response = $this->getJson("/students/{$this->student->id}/applications/{$application->id}");

        $response->assertStatus(404);
    }

    public function test_can_update_application()
    {
        $application = AdmissionApplication::factory()->draft()->create([
            'student_id' => $this->student->id,
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'application_date' => now()
        ]);

        $updateData = [
            'status' => 'submitted',
            'comments' => 'Ready for review'
        ];

        $response = $this->putJson(
            "/students/{$this->student->id}/applications/{$application->id}",
            $updateData
        );

        $response->assertStatus(200)
            ->assertJsonFragment($updateData);
    }

    public function test_can_delete_application()
    {
        $application = AdmissionApplication::factory()->draft()->create([
            'student_id' => $this->student->id,
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'application_date' => now()
        ]);

        $response = $this->deleteJson("/students/{$this->student->id}/applications/{$application->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('admission_applications', ['id' => $application->id]);
    }

    public function test_can_create_a_draft_application()
    {
        // Ensure no existing draft applications
        $this->student->admissionApplications()->delete();

        $applicationData = [
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
        ];

        $response = $this->postJson('/applications/draft', $applicationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'academic_year',
                    'semester',
                    'status',
                    'application_date',
                    'comments'
                ]
            ])
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.academic_year', '2024-2025')
            ->assertJsonPath('data.semester', 'Fall');

        // Verify the application was created in the database
        $this->assertDatabaseHas('admission_applications', [
            'student_id' => $this->student->id,
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'status' => 'draft'
        ]);
    }

    public function test_storeDraft_requires_student_record()
    {
        // Create a user without a student record
        $userWithoutStudent = User::factory()->create();
        
        $applicationData = [
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
        ];

        $response = $this->actingAs($userWithoutStudent)
            ->postJson('/applications/draft', $applicationData);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Student record not found'
            ]);
    }
}
