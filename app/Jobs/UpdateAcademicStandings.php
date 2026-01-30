<?php

namespace App\Jobs;

use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateAcademicStandings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(StudentService $studentService): void
    {
        $counts = [
            'good_standing' => 0,
            'probation' => 0,
            'honors' => 0,
            'deans_list' => 0,
            'total' => 0,
        ];

        Student::whereIn('enrollment_status', ['full_time', 'part_time', 'active'])
            ->chunk(100, function ($students) use ($studentService, &$counts) {
                foreach ($students as $student) {
                    $standing = $studentService->getAcademicStanding($student);

                    $statusMap = [
                        'good_standing' => 'good_standing',
                        'probation' => 'academic_probation',
                        'honors' => 'good_standing',
                        'deans_list' => 'good_standing',
                    ];

                    $student->update([
                        'academic_status' => $statusMap[$standing['status']] ?? 'good_standing',
                    ]);

                    $counts[$standing['status']] = ($counts[$standing['status']] ?? 0) + 1;
                    $counts['total']++;
                }
            });

        Log::info('UpdateAcademicStandings completed', $counts);
    }
}
