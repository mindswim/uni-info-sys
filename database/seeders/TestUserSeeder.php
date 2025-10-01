<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Test Admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Create student user
        $student = User::updateOrCreate(
            ['email' => 'student@test.com'],
            [
                'name' => 'Test Student',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Create faculty user
        $faculty = User::updateOrCreate(
            ['email' => 'faculty@test.com'],
            [
                'name' => 'Test Faculty',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        echo "Created test users:\n";
        echo "- Admin: admin@test.com / password123\n";
        echo "- Student: student@test.com / password123\n";
        echo "- Faculty: faculty@test.com / password123\n";
    }
}