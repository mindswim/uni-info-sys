<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Role;
use Laravel\Sanctum\Sanctum;

class StudentCrudTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $adminUser, $studentUser;
    private $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create Roles
        $adminRole = Role::create(['name' => 'admin']);
        $studentRole = Role::create(['name' => 'student']);

        // Create Admin User
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);

        // Create Student User
        $this->studentUser = User::factory()->create();
        $this->studentUser->roles()->attach($studentRole);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
    }

    public function test_admin_can_create_student()
    {
        Sanctum::actingAs($this->adminUser);
        
        $newUser = User::factory()->create();
        $studentData = [
            'user_id' => $newUser->id,
            'student_number' => 'STU' . $this->faker->unique()->numerify('####'),
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'date_of_birth' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'nationality' => 'American',
            'address' => $this->faker->address,
            'city' => $this->faker->city,
            'state' => $this->faker->stateAbbr,
            'postal_code' => $this->faker->postcode,
            'country' => 'USA',
            'phone' => $this->faker->phoneNumber,
            'emergency_contact_name' => $this->faker->name,
            'emergency_contact_phone' => $this->faker->phoneNumber,
        ];

        $response = $this->postJson('/api/v1/students', $studentData)
            ->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'student_number',
                    'first_name',
                    'last_name'
                ]
            ]);

        $this->assertDatabaseHas('students', [
            'user_id' => $newUser->id,
            'student_number' => $studentData['student_number'],
            'first_name' => $studentData['first_name'],
            'last_name' => $studentData['last_name']
        ]);
    }

    public function test_admin_can_update_student()
    {
        Sanctum::actingAs($this->adminUser);
        
        $updateData = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'phone' => '555-UPDATED'
        ];

        $this->putJson("/api/v1/students/{$this->student->id}", $updateData)
            ->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'first_name',
                    'last_name'
                ]
            ]);

        $this->assertDatabaseHas('students', [
            'id' => $this->student->id,
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'phone' => '555-UPDATED'
        ]);
    }

    public function test_admin_can_delete_student()
    {
        Sanctum::actingAs($this->adminUser);
        
        $this->deleteJson("/api/v1/students/{$this->student->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('students', [
            'id' => $this->student->id
        ]);
    }

    public function test_store_requires_validation()
    {
        Sanctum::actingAs($this->adminUser);
        
        $this->postJson('/api/v1/students', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'user_id', 'student_number', 'first_name', 'last_name', 
                'date_of_birth', 'gender', 'nationality', 'address', 
                'city', 'state', 'postal_code', 'country', 'phone',
                'emergency_contact_name', 'emergency_contact_phone'
            ]);
    }

    public function test_student_can_update_own_profile()
    {
        Sanctum::actingAs($this->studentUser);
        
        $updateData = [
            'phone' => '555-NEW-PHONE',
            'address' => '123 New Street'
        ];

        $this->putJson("/api/v1/students/{$this->student->id}", $updateData)
            ->assertStatus(200);

        $this->assertDatabaseHas('students', [
            'id' => $this->student->id,
            'phone' => '555-NEW-PHONE',
            'address' => '123 New Street'
        ]);
    }
}
