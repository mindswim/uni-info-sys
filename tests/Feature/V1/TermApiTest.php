<?php

namespace Tests\Feature\Api\V1;

use App\Models\Term;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TermApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        
        $this->admin = User::factory()->create();
        
        // Assign admin role
        $this->admin->roles()->attach($adminRole);
    }

    private function getTermData(array $overrides = []): array
    {
        $year = $this->faker->numberBetween(2025, 2035);
        return array_merge([
            'name' => "Fall {$year}",
            'academic_year' => $year,
            'semester' => 'Fall',
            'start_date' => "{$year}-09-01",
            'end_date' => "{$year}-12-20",
        ], $overrides);
    }
    
    public function test_can_get_all_terms_paginated()
    {
        // Create specific terms to avoid unique constraint violations
        $years = range(2024, 2028);
        $semesters = ['Fall', 'Spring', 'Summer'];
        
        foreach ($years as $year) {
            foreach ($semesters as $semester) {
                Term::factory()->create([
                    'name' => "{$semester} {$year}",
                    'academic_year' => $year,
                    'semester' => $semester
                ]);
            }
        }

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/terms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'academic_year', 'semester', 'start_date', 'end_date']
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(10, 'data');
    }

    public function test_can_filter_terms_by_academic_year()
    {
        Term::factory()->create(['academic_year' => 2023, 'semester' => 'Fall']);
        Term::factory()->create(['academic_year' => 2023, 'semester' => 'Spring']);
        Term::factory()->create(['academic_year' => 2024, 'semester' => 'Fall']);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/terms?academic_year=2023');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
        foreach ($response->json('data') as $term) {
            $this->assertEquals(2023, $term['academic_year']);
        }
    }

    public function test_can_create_a_term()
    {
        $data = $this->getTermData();
        
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/terms', $data);
        
        $response->assertStatus(201)
            ->assertJsonFragment([
                'name' => $data['name'],
                'academic_year' => $data['academic_year'],
                'semester' => $data['semester'],
            ]);

        $this->assertDatabaseHas('terms', ['name' => $data['name']]);
    }

    public function test_create_term_fails_with_duplicate_year_and_semester()
    {
        $term = Term::factory()->create();

        $data = $this->getTermData([
            'academic_year' => $term->academic_year,
            'semester' => $term->semester,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/terms', $data);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['academic_year']);
    }

    public function test_can_get_a_single_term()
    {
        $term = Term::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/terms/{$term->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $term->id,
                'name' => $term->name,
            ]);
    }

    public function test_can_update_a_term()
    {
        $term = Term::factory()->create();
        
        $updateData = [
            'name' => 'Updated Term Name',
            'end_date' => '2099-12-31',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/terms/{$term->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Updated Term Name',
            ])
            ->assertJsonPath('data.end_date', '2099-12-31T00:00:00.000000Z');

        $this->assertDatabaseHas('terms', ['id' => $term->id, 'name' => 'Updated Term Name']);
    }

    public function test_can_delete_a_term()
    {
        $term = Term::factory()->create();
        
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/terms/{$term->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('terms', ['id' => $term->id]);
    }
}
