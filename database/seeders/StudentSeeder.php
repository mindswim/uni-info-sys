<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        // Get all users except admin
        User::where('email', '!=', 'admin@example.com')
            ->get()
            ->each(function ($user) {
                Student::create([
                    'user_id' => $user->id,
                    'student_number' => 'ST'.str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT),
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'date_of_birth' => fake()->date(),
                    'gender' => fake()->randomElement(['male', 'female', 'other']),
                    'nationality' => fake()->country(),
                    'address' => fake()->streetAddress(),
                    'city' => fake()->city(),
                    'state' => fake()->state(),
                    'postal_code' => fake()->postcode(),
                    'country' => fake()->country(),
                    'phone' => fake()->phoneNumber(),
                    'emergency_contact_name' => fake()->name(),
                    'emergency_contact_phone' => fake()->phoneNumber(),
                ]);
            });
    }
}
