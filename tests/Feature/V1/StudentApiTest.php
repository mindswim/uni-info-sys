<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Tests\Traits\CreatesUsersWithRoles;
use App\Models\User;
use App\Models\Student;
use App\Models\Role;
use Laravel\Sanctum\Sanctum;

class StudentApiTest extends TestCase
{
    use RefreshDatabase, WithFaker, CreatesUsersWithRoles;

    private $adminUser, $staffUser, $studentUser1, $studentUser2;
    private $student1, $student2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedPermissions();

        $adminRole = Role::where('name', 'admin')->first();
        $staffRole = Role::where('name', 'staff')->first();
        $studentRole = Role::where('name', 'student')->first();

        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);

        $this->staffUser = User::factory()->create();
        $this->staffUser->roles()->attach($staffRole);

        $this->studentUser1 = User::factory()->create();
        $this->studentUser1->roles()->attach($studentRole);
        $this->student1 = Student::factory()->create(['user_id' => $this->studentUser1->id]);

        $this->studentUser2 = User::factory()->create();
        $this->studentUser2->roles()->attach($studentRole);
        $this->student2 = Student::factory()->create(['user_id' => $this->studentUser2->id]);
    }

    public function test_unauthenticated_user_cannot_access_student_endpoints()
    {
        $this->getJson('/api/v1/students')->assertStatus(401);
        $this->getJson("/api/v1/students/{$this->student1->id}")->assertStatus(401);
        $this->postJson('/api/v1/students')->assertStatus(401);
        $this->putJson("/api/v1/students/{$this->student1->id}")->assertStatus(401);
        $this->deleteJson("/api/v1/students/{$this->student1->id}")->assertStatus(401);
    }

    public function test_admin_can_view_all_students()
    {
        Sanctum::actingAs($this->adminUser);
        $this->getJson('/api/v1/students')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_staff_can_view_all_students()
    {
        Sanctum::actingAs($this->staffUser);
        $this->getJson('/api/v1/students')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_student_can_only_view_their_own_record_from_index()
    {
        Sanctum::actingAs($this->studentUser1);
        $response = $this->getJson('/api/v1/students')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
        
        $this->assertEquals($this->student1->id, $response->json('data.0.id'));
    }

    public function test_student_can_view_their_own_record_from_show()
    {
        Sanctum::actingAs($this->studentUser1);
        $this->getJson("/api/v1/students/{$this->student1->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $this->student1->id]);
    }

    public function test_student_cannot_view_another_students_record()
    {
        Sanctum::actingAs($this->studentUser1);
        $this->getJson("/api/v1/students/{$this->student2->id}")
            ->assertStatus(403);
    }

    public function test_student_index_can_include_user_data()
    {
        Sanctum::actingAs($this->adminUser);
        $this->getJson('/api/v1/students?include_user=true')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'student_number',
                        'user' => ['id', 'name', 'email']
                    ]
                ]
            ]);
    }

    public function test_student_show_can_include_user_data()
    {
        Sanctum::actingAs($this->adminUser);
        $this->getJson("/api/v1/students/{$this->student1->id}?include_user=true")
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'student_number',
                    'user' => ['id', 'name', 'email']
                ]
            ]);
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

        $this->putJson("/api/v1/students/{$this->student1->id}", $updateData)
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
            'id' => $this->student1->id,
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'phone' => '555-UPDATED'
        ]);
    }

    public function test_admin_can_delete_student()
    {
        Sanctum::actingAs($this->adminUser);
        
        $this->deleteJson("/api/v1/students/{$this->student1->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('students', [
            'id' => $this->student1->id
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


}
