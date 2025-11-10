<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        $birthDate = $this->faker->dateTimeBetween('-25 years', '-17 years');
        
        return [
            'user_id' => User::factory(),
            'student_number' => 'STU' . $this->faker->unique()->numberBetween(100000, 999999),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $birthDate->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other', 'prefer not to say']),
            'nationality' => $this->faker->randomElement([
                'American', 'Canadian', 'British', 'Australian', 'German', 'French', 'Japanese', 
                'Chinese', 'Indian', 'Brazilian', 'Mexican', 'Spanish', 'Italian', 'Korean'
            ]),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->randomElement([
                'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'
            ]),
            'phone' => $this->faker->phoneNumber(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'major_program_id' => Program::inRandomOrder()->first()?->id,
        ];
    }
}
