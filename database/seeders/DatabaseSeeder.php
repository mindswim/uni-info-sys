<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            StudentSeeder::class,
            ProgramSeeder::class,
            AcademicRecordSeeder::class,
            DocumentSeeder::class,
            AdmissionApplicationSeeder::class,
            ProgramChoiceSeeder::class,
        ]);
    }
}
