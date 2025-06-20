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
            'original_filename' => 'test.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1000,
            'status' => $this->faker->randomElement([
                'pending',
                'approved',
                'rejected'
            ]),
            'version' => 1,
            'is_active' => true,
            'verified' => $this->faker->boolean,
            'uploaded_at' => now(),
            'verified_at' => $this->faker->optional()->dateTime(),
        ];
    }
}
