<?php

namespace Tests\Feature\Api\V1;

use App\Models\Building;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BuildingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(
            User::factory()->create(),
            ['*']
        );
    }

    public function test_can_get_paginated_buildings()
    {
        Building::factory()->count(20)->create();

        $response = $this->getJson('/api/v1/buildings');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'address']
                ],
                'links',
                'meta'
            ])
            ->assertJsonCount(15, 'data');
    }

    public function test_can_get_buildings_with_rooms()
    {
        $building = Building::factory()
            ->has(Room::factory()->count(3))
            ->create();

        $response = $this->getJson('/api/v1/buildings?include_rooms=true');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'rooms' => [
                            '*' => ['id', 'room_number']
                        ]
                    ]
                ]
            ])
            ->assertJsonCount(3, 'data.0.rooms');
    }

    public function test_can_get_buildings_with_rooms_count()
    {
        Building::factory()
            ->has(Room::factory()->count(5))
            ->create();

        $response = $this->getJson('/api/v1/buildings?include_rooms_count=true');

        $response->assertOk()
            ->assertJsonPath('data.0.rooms_count', 5);
    }

    public function test_can_create_a_building()
    {
        $buildingData = [
            'name' => 'Science Hall',
            'address' => '123 University Drive',
        ];

        $response = $this->postJson('/api/v1/buildings', $buildingData);

        $response->assertStatus(201)
            ->assertJsonFragment($buildingData);

        $this->assertDatabaseHas('buildings', $buildingData);
    }

    public function test_create_building_validation_fails()
    {
        $response = $this->postJson('/api/v1/buildings', ['name' => '']);
        $response->assertStatus(422)->assertJsonValidationErrors('name');
    }

    public function test_can_get_a_single_building()
    {
        $building = Building::factory()->create();

        $response = $this->getJson('/api/v1/buildings/' . $building->id);

        $response->assertOk()
            ->assertJsonFragment(['id' => $building->id]);
    }

    public function test_can_update_a_building()
    {
        $building = Building::factory()->create();
        $updateData = ['name' => 'Updated Science Hall'];

        $response = $this->putJson('/api/v1/buildings/' . $building->id, $updateData);

        $response->assertOk()
            ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('buildings', $updateData);
    }

    public function test_can_delete_a_building()
    {
        $building = Building::factory()->create();

        $response = $this->deleteJson('/api/v1/buildings/' . $building->id);

        $response->assertNoContent();

        $this->assertDatabaseMissing('buildings', ['id' => $building->id]);
    }

    public function test_deleting_building_cascades_to_rooms()
    {
        $building = Building::factory()
            ->has(Room::factory()->count(3))
            ->create();

        $this->assertDatabaseCount('rooms', 3);

        $building->delete();

        $this->assertDatabaseCount('rooms', 0);
    }
}
