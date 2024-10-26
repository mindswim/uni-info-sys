<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'document_type' => $this->faker->randomElement([
                'passport', 
                'transcript', 
                'recommendation_letter', 
                'cv'
            ]),
            'file_path' => 'documents/test.pdf',
            'status' => $this->faker->randomElement([
                'pending',
                'approved',
                'rejected'
            ]),
            'verified' => $this->faker->boolean,
            'uploaded_at' => now(),
            'verified_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
