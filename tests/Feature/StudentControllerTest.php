<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate a user
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_can_get_students_list(): void
    {
        // Create students with specific users
        Student::factory()->count(3)->create();

        $response = $this->getJson('/students');

        $response->assertStatus(200);
    }

    public function test_can_create_student(): void
    {
        $studentData = [
            'user_id' => $this->user->id,
            'student_number' => 'ST12345',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'date_of_birth' => '1995-01-01',
            'gender' => 'male',
            'nationality' => 'US',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '12345',
            'country' => 'US',
            'phone' => '123-456-7890',
            'emergency_contact_name' => 'Jane Doe',
            'emergency_contact_phone' => '098-765-4321'
        ];

        $response = $this->post('/students', $studentData);

        $response->assertStatus(302);
        $response->assertRedirect('/students');
        $this->assertDatabaseHas('students', ['student_number' => 'ST12345']);
    }

    public function test_can_show_student(): void
    {
        $student = Student::factory()->create();

        $response = $this->get("/students/{$student->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Show')
            ->has('student', fn ($prop) => $prop->where('id', $student->id)->etc())
        );
    }

    public function test_can_update_student(): void
    {
        $student = Student::factory()->create();

        $updateData = [
            'first_name' => 'Updated Name',
            'phone' => '999-999-9999'
        ];

        $response = $this->put("/students/{$student->id}", $updateData);

        $response->assertStatus(302);
        $response->assertRedirect("/students/{$student->id}");
        $this->assertDatabaseHas('students', ['first_name' => 'Updated Name']);
    }

    public function test_can_delete_student(): void
    {
        $student = Student::factory()->create();

        $response = $this->delete("/students/{$student->id}");

        $response->assertStatus(302);
        $response->assertRedirect('/students');
        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }

    public function test_validate_required_fields_for_creation(): void
    {
        $response = $this->postJson('/students', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'user_id',
                'student_number',
                'first_name',
                'last_name',
                'date_of_birth',
                'gender',
                'nationality',
                'address',
                'city',
                'state',
                'postal_code',
                'country',
                'phone',
                'emergency_contact_name',
                'emergency_contact_phone'
            ]);
    }

    public function test_api_can_show_student_as_json_resource(): void
    {
        $student = Student::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'student_number' => 'ST12345',
            'nationality' => 'US'
        ]);

        // Create a Sanctum token for API authentication
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/students/{$student->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'student_id_number',
                    'name',
                    'date_of_birth',
                    'nationality',
                    'profile_complete',
                    'applications',
                    'documents',
                    'academic_records'
                ]
            ])
            ->assertJsonFragment([
                'student_id_number' => 'ST12345',
                'name' => 'John Doe',
                'nationality' => 'US'
            ]);
    }

    public function test_api_shows_student_with_nested_relationships(): void
    {
        $student = Student::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'student_number' => 'ST67890',
            'nationality' => 'CA'
        ]);

        // Create related data
        $application = $student->admissionApplications()->create([
            'academic_year' => '2024-2025',
            'semester' => 'Fall',
            'status' => 'draft',
            'application_date' => now()
        ]);

        // Create a Sanctum token for API authentication
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/students/{$student->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'student_id_number',
                    'name',
                    'date_of_birth',
                    'nationality',
                    'profile_complete',
                    'applications' => [
                        '*' => [
                            'id',
                            'academic_year',
                            'semester',
                            'status',
                            'application_date',
                            'comments',
                            'program_choices'
                        ]
                    ],
                    'documents',
                    'academic_records'
                ]
            ])
            ->assertJsonFragment([
                'student_id_number' => 'ST67890',
                'name' => 'Jane Smith',
                'nationality' => 'CA'
            ])
            ->assertJsonPath('data.applications.0.academic_year', '2024-2025')
            ->assertJsonPath('data.applications.0.status', 'draft');
    }
}
