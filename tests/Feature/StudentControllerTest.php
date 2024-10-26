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

        $response = $this->postJson('/students', $studentData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'first_name' => 'John',
                'last_name' => 'Doe'
            ]);
    }

    public function test_can_show_student(): void
    {
        $student = Student::factory()->create();

        $response = $this->getJson("/students/{$student->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $student->id,
                'first_name' => $student->first_name
            ]);
    }

    public function test_can_update_student(): void
    {
        $student = Student::factory()->create();

        $updateData = [
            'first_name' => 'Updated Name',
            'phone' => '999-999-9999'
        ];

        $response = $this->putJson("/students/{$student->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'first_name' => 'Updated Name',
                'phone' => '999-999-9999'
            ]);
    }

    public function test_can_delete_student(): void
    {
        $student = Student::factory()->create();

        $response = $this->deleteJson("/students/{$student->id}");

        $response->assertStatus(204);
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
}
