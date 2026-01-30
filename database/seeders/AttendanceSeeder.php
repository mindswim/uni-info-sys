<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding attendance data...');

        // Get all enrolled students in course sections
        $enrollments = Enrollment::where('status', 'enrolled')
            ->with(['courseSection', 'student'])
            ->get();

        if ($enrollments->isEmpty()) {
            $this->command->warn('No enrollments found. Run DemoSeeder first.');

            return;
        }

        $recordCount = 0;

        // Create attendance records for the past 4 weeks
        $startDate = Carbon::now()->subWeeks(4)->startOfWeek();
        $endDate = Carbon::now();

        foreach ($enrollments as $enrollment) {
            $section = $enrollment->courseSection;
            $scheduleDays = $section->schedule_days ?? [];

            // Skip if no schedule days
            if (empty($scheduleDays)) {
                continue;
            }

            // Generate attendance for each scheduled day in the date range
            $current = $startDate->copy();
            while ($current->lte($endDate)) {
                // Check if this day is a scheduled class day
                $dayName = $current->format('l'); // e.g., "Monday"

                if (in_array($dayName, $scheduleDays)) {
                    // Randomly assign attendance status (weighted toward present)
                    $rand = rand(1, 100);
                    if ($rand <= 85) {
                        $status = 'present';
                    } elseif ($rand <= 95) {
                        $status = 'late';
                    } else {
                        $status = 'absent';
                    }

                    AttendanceRecord::create([
                        'enrollment_id' => $enrollment->id,
                        'course_section_id' => $section->id,
                        'student_id' => $enrollment->student_id,
                        'attendance_date' => $current->toDateString(),
                        'status' => $status,
                        'notes' => $status === 'late' ? 'Arrived 10 minutes late' : null,
                        'recorded_by' => $section->instructor_id,
                    ]);

                    $recordCount++;
                }

                $current->addDay();
            }
        }

        $this->command->info("Created {$recordCount} attendance records");
        $this->command->info('Attendance data seeded successfully!');
    }
}
