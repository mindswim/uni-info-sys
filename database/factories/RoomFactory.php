<?php

namespace Database\Factories;

use App\Models\Building;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'building_id' => Building::factory(),
            'room_number' => $this->faker->unique()->numerify('###'),
            'capacity' => $this->faker->numberBetween(10, 200),
            'type' => $this->faker->randomElement(['classroom', 'lab', 'lecture_hall', 'office', 'other']),
        ];
    }
}
