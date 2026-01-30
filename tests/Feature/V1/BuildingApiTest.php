<?php

namespace Tests\Feature\Api\V1;

use App\Models\Building;
use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BuildingApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user with admin role
        $this->admin = User::factory()->create();
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator']);
        $this->admin->roles()->attach($adminRole);
    }

    public function test_can_get_all_buildings_paginated_with_rooms()
    {
        Building::factory()->has(Room::factory()->count(3))->count(5)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/buildings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'address', 'rooms'],
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(5, 'data')
            ->assertJsonCount(3, 'data.0.rooms');
    }

    public function test_can_create_a_building()
    {
        $data = [
            'name' => $this->faker->unique()->word.' Hall',
            'address' => $this->faker->address,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/buildings', $data);

        $response->assertStatus(201)
            ->assertJsonFragment($data);

        $this->assertDatabaseHas('buildings', $data);
    }

    public function test_create_building_fails_with_duplicate_name()
    {
        $building = Building::factory()->create();

        $data = ['name' => $building->name];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/buildings', $data);

        $response->assertStatus(422)->assertJsonValidationErrors(['name']);
    }

    public function test_can_get_a_single_building_with_rooms()
    {
        $building = Building::factory()->has(Room::factory()->count(2))->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/buildings/{$building->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $building->id])
            ->assertJsonCount(2, 'data.rooms');
    }

    public function test_can_update_a_building()
    {
        $building = Building::factory()->create();

        $updateData = ['name' => 'Updated Building Name'];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/buildings/{$building->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('buildings', ['id' => $building->id, 'name' => 'Updated Building Name']);
    }

    public function test_can_delete_a_building()
    {
        $building = Building::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/buildings/{$building->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('buildings', ['id' => $building->id]);
    }

    public function test_deleting_a_building_deletes_its_rooms()
    {
        $building = Building::factory()->has(Room::factory()->count(1))->create();
        $roomId = $building->rooms->first()->id;

        $this->assertDatabaseHas('rooms', ['id' => $roomId]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/buildings/{$building->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('buildings', ['id' => $building->id]);
        $this->assertDatabaseMissing('rooms', ['id' => $roomId]); // Assumes onDelete('cascade')
    }
}
