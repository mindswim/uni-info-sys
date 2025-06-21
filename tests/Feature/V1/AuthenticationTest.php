<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_endpoints_are_protected_by_auth_sanctum()
    {
        $response = $this->getJson('/api/v1/faculties');
        $response->assertStatus(401) // Unauthorized
            ->assertJson([
                'detail' => 'Unauthenticated.'
            ])
            ->assertJsonStructure(['type', 'title', 'status', 'detail']);
    }

    public function test_a_user_can_create_an_api_token()
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/tokens/create', [
            'email' => $user->email,
            'password' => 'password123',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token']);
    }

    public function test_a_user_cannot_create_an_api_token_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/tokens/create', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(422) // Validation Exception
            ->assertJson([
                'detail' => 'The given data was invalid.'
            ])
            ->assertJsonStructure([
                'type',
                'title', 
                'status',
                'detail',
                'errors'
            ])
            ->assertJsonValidationErrors('email');
    }

    public function test_a_user_can_authenticate_with_a_valid_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/faculties');

        $response->assertStatus(200);
    }

    public function test_a_user_cannot_authenticate_with_an_invalid_token()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token',
        ])->getJson('/api/v1/faculties');

        $response->assertStatus(401) // Unauthorized
            ->assertJson([
                'detail' => 'Unauthenticated.'
            ])
            ->assertJsonStructure(['type', 'title', 'status', 'detail']);
    }
}
