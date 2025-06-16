<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_not_found_returns_json_error()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->get('/api/v1/non-existent-route');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'The requested resource was not found.'
            ])
            ->assertJsonStructure(['message']);
    }

    public function test_api_unauthenticated_returns_json_error()
    {
        $response = $this->withHeaders([
            'Accept' => 'application/json',
        ])->get('/api/v1/faculties');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ])
            ->assertJsonStructure(['message']);
    }

    public function test_api_validation_error_returns_json_with_errors()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        // Try to create a faculty without required fields
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->post('/api/v1/faculties', []);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The given data was invalid.'
            ])
            ->assertJsonStructure([
                'message',
                'errors'
            ]);
    }

    public function test_api_generic_error_returns_json_error()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        // Try to access a faculty with an invalid ID format that might cause an error
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->get('/api/v1/faculties/invalid-id-format');

        // This should return either 404 or 500, both should be JSON
        $this->assertTrue(in_array($response->status(), [404, 500]));
        $response->assertJsonStructure(['message']);
    }

    public function test_debug_mode_includes_exception_details()
    {
        // Temporarily enable debug mode
        config(['app.debug' => true]);

        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->get('/api/v1/non-existent-route');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'message',
                'exception',
                'file',
                'line',
                'trace'
            ]);

        // Reset debug mode
        config(['app.debug' => false]);
    }
} 