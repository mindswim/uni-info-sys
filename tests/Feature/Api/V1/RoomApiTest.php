<?php

namespace Tests\Feature\Api\V1;

use App\Models\Building;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoomApiTest extends TestCase
{
    use RefreshDatabase;

    private Building $building;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(
            User::factory()->create(),
            ['*']
        );
        $this->building = Building::factory()->create();
    }

    public function test_can_get_paginated_rooms()
    {
        Room::factory()->count(20)->for($this->building)->create();

        $response = $this->getJson('/api/v1/rooms');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'room_number', 'capacity', 'type', 'building']
                ],
                'links',
                'meta'
            ])
            ->assertJsonCount(15, 'data');
    }

    public function test_can_filter_rooms_by_building()
    {
        Room::factory()->count(5)->for($this->building)->create();
        $otherBuilding = Building::factory()->create();
        Room::factory()->count(3)->for($otherBuilding)->create();

        $response = $this->getJson('/api/v1/rooms?building_id=' . $this->building->id);

        $response->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_can_filter_rooms_by_type()
    {
        Room::factory()->for($this->building)->create(['type' => 'classroom']);
        Room::factory()->for($this->building)->create(['type' => 'lab']);

        $response = $this->getJson('/api/v1/rooms?type=classroom');
        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_can_filter_rooms_by_min_capacity()
    {
        Room::factory()->for($this->building)->create(['capacity' => 20]);
        Room::factory()->for($this->building)->create(['capacity' => 100]);

        $response = $this->getJson('/api/v1/rooms?min_capacity=50');
        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_can_create_a_room()
    {
        $roomData = [
            'building_id' => $this->building->id,
            'room_number' => '101',
            'capacity' => 30,
            'type' => 'classroom',
        ];

        $response = $this->postJson('/api/v1/rooms', $roomData);

        $response->assertStatus(201)
            ->assertJsonPath('data.room_number', $roomData['room_number'])
            ->assertJsonPath('data.building.id', $this->building->id);

        $this->assertDatabaseHas('rooms', $roomData);
    }

    public function test_create_room_validation_fails()
    {
        $response = $this->postJson('/api/v1/rooms', ['building_id' => $this->building->id]);
        $response->assertStatus(422)->assertJsonValidationErrors(['room_number', 'capacity', 'type']);
    }

    public function test_room_number_is_unique_per_building()
    {
        Room::factory()->for($this->building)->create(['room_number' => '101']);

        $roomData = [
            'building_id' => $this->building->id,
            'room_number' => '101',
            'capacity' => 30,
            'type' => 'classroom',
        ];

        $response = $this->postJson('/api/v1/rooms', $roomData);
        $response->assertStatus(422)->assertJsonValidationErrors('room_number');
    }

    public function test_can_get_a_single_room()
    {
        $room = Room::factory()->for($this->building)->create();

        $response = $this->getJson('/api/v1/rooms/' . $room->id);

        $response->assertOk()
            ->assertJsonFragment(['id' => $room->id]);
    }

    public function test_can_update_a_room()
    {
        $room = Room::factory()->for($this->building)->create();
        $updateData = ['capacity' => 50];

        $response = $this->putJson('/api/v1/rooms/' . $room->id, $updateData);

        $response->assertOk()
            ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('rooms', $updateData);
    }

    public function test_can_delete_a_room()
    {
        $room = Room::factory()->for($this->building)->create();

        $response = $this->deleteJson('/api/v1/rooms/' . $room->id);

        $response->assertNoContent();

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
