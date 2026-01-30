<?php

namespace Database\Seeders;

use App\Models\AdmissionApplication;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramChoiceSeeder extends Seeder
{
    public function run(): void
    {
        AdmissionApplication::all()->each(function ($application) {
            $programs = Program::inRandomOrder()->take(2)->get();
            foreach ($programs as $index => $program) {
                $application->programChoices()->create([
                    'program_id' => $program->id,
                    'preference_order' => $index + 1,
                    'status' => fake()->randomElement(['pending', 'accepted', 'rejected']),
                ]);
            }
        });
    }
}
