<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\GradeChangeRequest;
use Illuminate\Database\Seeder;

class GradeChangeSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding grade change requests...');

        // Get enrollments that have grades
        $enrollments = Enrollment::whereNotNull('grade')
            ->with(['student', 'courseSection.instructor'])
            ->take(10)
            ->get();

        if ($enrollments->isEmpty()) {
            $this->command->warn('No graded enrollments found. Run other seeders first.');

            return;
        }

        $reasons = [
            'Grading error - incorrect calculation',
            'Missing assignment was submitted before deadline',
            'Exam was re-graded and score improved',
            'Extra credit work was not included in final grade',
            'Attendance bonus points not applied',
            'Lab work score was incorrectly recorded',
        ];

        $statuses = ['pending', 'approved', 'denied'];
        $count = 0;

        foreach ($enrollments->take(6) as $enrollment) {
            $status = $statuses[array_rand($statuses)];
            $oldGrade = $enrollment->grade;

            // Generate a new grade (one letter grade higher)
            $gradeMap = ['F' => 'D', 'D' => 'C', 'C' => 'B', 'B' => 'A'];
            $newGrade = $gradeMap[$oldGrade] ?? 'A';

            $request = GradeChangeRequest::create([
                'enrollment_id' => $enrollment->id,
                'requested_by' => $enrollment->courseSection->instructor_id,
                'old_grade' => $oldGrade,
                'new_grade' => $newGrade,
                'reason' => $reasons[array_rand($reasons)],
                'status' => $status,
            ]);

            if ($status === 'approved') {
                $request->update([
                    'approved_by' => $enrollment->courseSection->instructor_id,
                    'approved_at' => now()->subDays(rand(0, 10)),
                ]);
            } elseif ($status === 'denied') {
                $request->update([
                    'denial_reason' => 'Insufficient documentation provided for grade change.',
                ]);
            }

            $count++;
        }

        $this->command->info("Created {$count} grade change requests");
        $this->command->info('Grade change request data seeded successfully!');
    }
}
