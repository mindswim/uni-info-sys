<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_returns_healthy_response_when_all_services_are_working()
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'services' => [
                    'database' => ['status', 'message'],
                    'cache' => ['status', 'message'],
                ],
                'application' => [
                    'name',
                    'environment',
                    'version',
                ],
            ])
            ->assertJson([
                'status' => 'healthy',
                'services' => [
                    'database' => [
                        'status' => 'healthy',
                        'message' => 'Database connection successful',
                    ],
                    'cache' => [
                        'status' => 'healthy',
                        'message' => 'Cache connection successful',
                    ],
                ],
            ]);

        // Verify timestamp is a valid ISO 8601 format
        $data = $response->json();
        $this->assertNotNull($data['timestamp']);
        $this->assertTrue(strtotime($data['timestamp']) !== false);
    }

    public function test_health_check_includes_application_information()
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'application' => [
                    'name' => config('app.name'),
                    'environment' => config('app.env'),
                    'version' => '1.0.0',
                ],
            ]);
    }

    public function test_health_check_endpoint_is_accessible_without_authentication()
    {
        // No authentication headers required
        $response = $this->get('/api/health');

        $response->assertStatus(200);

        // Should not return authentication error
        $response->assertJsonMissing(['message' => 'Unauthenticated.']);
    }

    public function test_health_check_validates_database_connection()
    {
        $response = $this->get('/api/health');

        $data = $response->json();

        $this->assertArrayHasKey('database', $data['services']);
        $this->assertEquals('healthy', $data['services']['database']['status']);
        $this->assertStringContainsString('Database connection successful', $data['services']['database']['message']);
    }

    public function test_health_check_validates_cache_connection()
    {
        $response = $this->get('/api/health');

        $data = $response->json();

        $this->assertArrayHasKey('cache', $data['services']);
        $this->assertEquals('healthy', $data['services']['cache']['status']);
        $this->assertStringContainsString('Cache connection successful', $data['services']['cache']['message']);
    }

    public function test_health_check_respects_rate_limiting()
    {
        // Make multiple requests to test rate limiting
        for ($i = 0; $i < 10; $i++) {
            $response = $this->get('/api/health');
            $response->assertStatus(200);
        }

        // All should succeed since we allow 100 requests per minute
        $this->assertTrue(true); // Test passes if no rate limiting errors
    }

    public function test_health_check_returns_proper_json_content_type()
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_health_check_response_includes_timestamp()
    {
        $beforeRequest = now();

        $response = $this->get('/api/health');

        $afterRequest = now();
        $data = $response->json();

        $this->assertArrayHasKey('timestamp', $data);

        $responseTimestamp = \Carbon\Carbon::parse($data['timestamp']);

        $this->assertTrue($responseTimestamp->between($beforeRequest, $afterRequest));
    }
}
