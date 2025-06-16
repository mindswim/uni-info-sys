<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;
use App\Models\Building;
use App\Models\Room;

class InfrastructureTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_create_a_building()
    {
        $building = Building::factory()->create(['name' => 'Science Hall']);
        $this->assertDatabaseHas('buildings', ['name' => 'Science Hall']);
    }

    /** @test */
    public function building_name_must_be_unique()
    {
        $this->expectException(QueryException::class);
        Building::factory()->create(['name' => 'Main Library']);
        Building::factory()->create(['name' => 'Main Library']);
    }

    /** @test */
    public function can_create_a_room_in_a_building()
    {
        $building = Building::factory()->create();
        $room = Room::factory()->create([
            'building_id' => $building->id,
            'room_number' => '101',
            'capacity' => 30
        ]);

        $this->assertDatabaseHas('rooms', [
            'room_number' => '101',
            'capacity' => 30
        ]);
        $this->assertEquals($building->id, $room->building->id);
    }

    /** @test */
    public function room_number_must_be_unique_per_building()
    {
        $this->expectException(QueryException::class);
        $building = Building::factory()->create();
        Room::factory()->create(['building_id' => $building->id, 'room_number' => '202']);
        Room::factory()->create(['building_id' => $building->id, 'room_number' => '202']);
    }

    /** @test */
    public function room_number_can_be_the_same_in_different_buildings()
    {
        $building1 = Building::factory()->create();
        $building2 = Building::factory()->create();
        
        $room1 = Room::factory()->create(['building_id' => $building1->id, 'room_number' => '303']);
        $room2 = Room::factory()->create(['building_id' => $building2->id, 'room_number' => '303']);

        $this->assertDatabaseHas('rooms', ['id' => $room1->id]);
        $this->assertDatabaseHas('rooms', ['id' => $room2->id]);
    }

    /** @test */
    public function building_has_many_rooms()
    {
        $building = Building::factory()->create();
        Room::factory()->count(5)->create(['building_id' => $building->id]);

        $this->assertCount(5, $building->rooms);
        $this->assertInstanceOf(Room::class, $building->rooms->first());
    }

    /** @test */
    public function deleting_a_building_cascades_to_its_rooms()
    {
        $building = Building::factory()->create();
        $room = Room::factory()->create(['building_id' => $building->id]);

        $this->assertDatabaseHas('rooms', ['id' => $room->id]);

        $building->delete();

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }
}
