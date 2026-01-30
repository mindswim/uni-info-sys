<?php

namespace Tests\Feature\Api\V1;

use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create student role so registration can assign it
        Role::factory()->create(['name' => 'student']);
    }

    public function test_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email', 'roles', 'student_id'],
        ]);
    }

    public function test_registration_creates_student_record(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);

        $student = Student::where('user_id', $user->id)->first();
        $this->assertNotNull($student);
        $this->assertEquals('prospective', $student->enrollment_status);
    }

    public function test_registration_assigns_student_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertTrue($user->roles->contains('name', 'student'));
    }

    public function test_cannot_register_with_existing_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_cannot_register_without_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_cannot_register_with_short_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422);
    }

    public function test_can_login_after_registration(): void
    {
        $regResponse = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $regResponse->assertStatus(201);

        $loginResponse = $this->postJson('/api/v1/tokens/create', [
            'email' => 'jane@example.com',
            'password' => 'password123',
            'device_name' => 'test',
        ]);

        $loginResponse->assertStatus(200);
        $loginResponse->assertJsonStructure(['token']);
    }
}
