<?php

namespace Tests\Feature\Api\V1;

use App\Models\Building;
use App\Models\Room;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class RoomApiTest extends TestCase
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

    private function getRoomData(array $overrides = []): array
    {
        $building = Building::factory()->create();
        return array_merge([
            'building_id' => $building->id,
            'room_number' => $this->faker->unique()->numerify('###'),
            'capacity' => $this->faker->numberBetween(20, 200),
            'type' => 'lecture_hall',
        ], $overrides);
    }
    
    public function test_can_get_all_rooms_paginated()
    {
        Room::factory()->count(15)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/rooms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'room_number', 'capacity', 'type', 'building']
                ],
                'links',
                'meta',
            ])
            ->assertJsonCount(10, 'data');
    }

    public function test_can_filter_rooms_by_building()
    {
        $building1 = Building::factory()->create();
        $building2 = Building::factory()->create();
        Room::factory()->count(3)->create(['building_id' => $building1->id]);
        Room::factory()->count(2)->create(['building_id' => $building2->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/rooms?building_id={$building1->id}");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
        foreach ($response->json('data') as $room) {
            $this->assertEquals($building1->id, $room['building']['id']);
        }
    }

    public function test_can_create_a_room()
    {
        $data = $this->getRoomData();
        
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/rooms', $data);
        
        $response->assertStatus(201)
            ->assertJsonFragment([
                'room_number' => $data['room_number'],
                'capacity' => $data['capacity'],
            ]);

        $this->assertDatabaseHas('rooms', ['room_number' => $data['room_number']]);
    }

    public function test_create_room_fails_with_duplicate_number_in_same_building()
    {
        $building = Building::factory()->create();
        $room = Room::factory()->create(['building_id' => $building->id]);

        $data = $this->getRoomData([
            'building_id' => $building->id,
            'room_number' => $room->room_number,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/rooms', $data);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['room_number']);
    }

    public function test_can_create_room_with_same_number_in_different_building()
    {
        $building1 = Building::factory()->create();
        $room = Room::factory()->create(['building_id' => $building1->id]);
        
        $building2 = Building::factory()->create();
        $data = $this->getRoomData([
            'building_id' => $building2->id,
            'room_number' => $room->room_number,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/rooms', $data);
        
        $response->assertStatus(201);
    }

    public function test_can_get_a_single_room()
    {
        $room = Room::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/rooms/{$room->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $room->id]);
    }

    public function test_can_update_a_room()
    {
        $room = Room::factory()->create();
        
        $updateData = ['capacity' => 500];

        $response = $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/rooms/{$room->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('rooms', ['id' => $room->id, 'capacity' => 500]);
    }

    public function test_can_delete_a_room()
    {
        $room = Room::factory()->create();
        
        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/rooms/{$room->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
