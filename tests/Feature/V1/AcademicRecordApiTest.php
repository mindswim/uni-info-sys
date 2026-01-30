<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;

class AcademicRecordApiTest extends TestCase
{
    /**
     * Test that health check endpoint is accessible.
     */
    public function test_health_check_endpoint(): void
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200)
            ->assertJson(['status' => 'healthy']);
    }
}
