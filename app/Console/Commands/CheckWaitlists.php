<?php

namespace App\Console\Commands;

use App\Jobs\ProcessWaitlistPromotion;
use App\Models\CourseSection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckWaitlists extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'waitlists:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all course sections for waitlist promotions (failsafe)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking waitlists for promotion opportunities...');

        // Find course sections that have capacity and waitlisted students
        $sectionsToCheck = CourseSection::whereHas('enrollments', function ($query) {
            $query->where('status', 'waitlisted');
        })
            ->withCount([
                'enrollments as enrolled_count' => function ($query) {
                    $query->where('status', 'enrolled');
                },
                'enrollments as waitlisted_count' => function ($query) {
                    $query->where('status', 'waitlisted');
                },
            ])
            ->get()
            ->filter(function ($section) {
                // Only sections that have available capacity
                return $section->enrolled_count < $section->capacity;
            });

        if ($sectionsToCheck->isEmpty()) {
            $this->info('No course sections found with available capacity and waitlisted students.');

            return Command::SUCCESS;
        }

        $jobsDispatched = 0;

        foreach ($sectionsToCheck as $section) {
            ProcessWaitlistPromotion::dispatch($section);
            $jobsDispatched++;

            $courseName = $section->course ? $section->course->name : 'Unknown Course';
            $this->line("Dispatched waitlist promotion job for section {$section->id} ({$courseName})");

            Log::info('Waitlist promotion job dispatched by scheduled command', [
                'course_section_id' => $section->id,
                'enrolled_count' => $section->enrolled_count,
                'capacity' => $section->capacity,
                'waitlisted_count' => $section->waitlisted_count,
            ]);
        }

        $this->info("Completed. Dispatched {$jobsDispatched} waitlist promotion jobs.");

        Log::info('CheckWaitlists command completed', [
            'jobs_dispatched' => $jobsDispatched,
        ]);

        return Command::SUCCESS;
    }
}
