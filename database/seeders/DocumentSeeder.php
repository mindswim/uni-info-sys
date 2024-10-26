<?php
namespace Database\Seeders;

use App\Models\Student;
use App\Models\Document;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documentTypes = ['passport', 'transcript', 'recommendation_letter', 'cv'];
        
        Student::all()->each(function ($student) use ($documentTypes) {
            foreach($documentTypes as $type) {
                Document::create([
                    'student_id' => $student->id,
                    'document_type' => $type,
                    'file_path' => 'documents/dummy.pdf',
                    'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
                    'verified' => fake()->boolean(),
                    'uploaded_at' => now(),
                    'verified_at' => fake()->boolean() ? now() : null,
                ]);
            }
        });
    }
}
