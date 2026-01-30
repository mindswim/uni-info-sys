<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassSession;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Staff;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AcademicCoreSeeder extends Seeder
{
    private array $assignmentTemplates = [
        'CS' => [
            ['title' => 'Programming Assignment: Variables and Data Types', 'type' => 'homework', 'points' => 100],
            ['title' => 'Lab: Setting Up Development Environment', 'type' => 'lab', 'points' => 50],
            ['title' => 'Quiz: Fundamentals Review', 'type' => 'quiz', 'points' => 25],
            ['title' => 'Project: Build a Simple Application', 'type' => 'project', 'points' => 200],
            ['title' => 'Midterm Exam', 'type' => 'midterm', 'points' => 150],
        ],
        'MATH' => [
            ['title' => 'Problem Set: Chapter 1', 'type' => 'homework', 'points' => 50],
            ['title' => 'Problem Set: Chapter 2', 'type' => 'homework', 'points' => 50],
            ['title' => 'Quiz: Core Concepts', 'type' => 'quiz', 'points' => 30],
            ['title' => 'Midterm Examination', 'type' => 'midterm', 'points' => 200],
            ['title' => 'Final Project: Applied Mathematics', 'type' => 'project', 'points' => 150],
        ],
        'ENG' => [
            ['title' => 'Essay: Personal Narrative', 'type' => 'paper', 'points' => 100],
            ['title' => 'Reading Response: Week 1-2', 'type' => 'homework', 'points' => 50],
            ['title' => 'Peer Review Workshop', 'type' => 'participation', 'points' => 25],
            ['title' => 'Research Paper Draft', 'type' => 'paper', 'points' => 150],
            ['title' => 'Final Research Paper', 'type' => 'paper', 'points' => 200],
        ],
        'BUS' => [
            ['title' => 'Case Study Analysis: Market Entry', 'type' => 'homework', 'points' => 100],
            ['title' => 'Group Presentation: Industry Analysis', 'type' => 'presentation', 'points' => 150],
            ['title' => 'Quiz: Business Fundamentals', 'type' => 'quiz', 'points' => 50],
            ['title' => 'Midterm Exam', 'type' => 'midterm', 'points' => 150],
            ['title' => 'Final Business Plan', 'type' => 'project', 'points' => 250],
        ],
        'EE' => [
            ['title' => 'Lab Report: Circuit Analysis', 'type' => 'lab', 'points' => 75],
            ['title' => 'Problem Set: Ohm\'s Law Applications', 'type' => 'homework', 'points' => 50],
            ['title' => 'Lab: Building Basic Circuits', 'type' => 'lab', 'points' => 100],
            ['title' => 'Midterm Examination', 'type' => 'midterm', 'points' => 200],
            ['title' => 'Final Project: Circuit Design', 'type' => 'project', 'points' => 200],
        ],
        'DEFAULT' => [
            ['title' => 'Assignment 1', 'type' => 'homework', 'points' => 100],
            ['title' => 'Assignment 2', 'type' => 'homework', 'points' => 100],
            ['title' => 'Midterm Quiz', 'type' => 'quiz', 'points' => 50],
            ['title' => 'Midterm Exam', 'type' => 'midterm', 'points' => 150],
            ['title' => 'Final Project', 'type' => 'project', 'points' => 200],
        ],
    ];

    private array $systemAnnouncements = [
        ['title' => 'Fall 2025 Registration Now Open', 'content' => 'Course registration for Fall 2025 is now available. Please log in to your student portal to view available courses and register before the deadline.', 'priority' => 'important'],
        ['title' => 'Library Hours Extended for Finals', 'content' => 'The university library will be open 24/7 during finals week (December 8-15). Study rooms can be reserved online.', 'priority' => 'normal'],
        ['title' => 'Campus Maintenance Notice', 'content' => 'The Science Building will undergo scheduled maintenance this Saturday. Some areas may be temporarily inaccessible.', 'priority' => 'normal'],
        ['title' => 'New Student Services Portal', 'content' => 'We have launched a new student services portal with improved features for course registration, grade viewing, and financial aid management.', 'priority' => 'normal'],
        ['title' => 'Academic Advising Week', 'content' => 'Meet with your academic advisor next week to plan your spring semester. Walk-in hours available Monday through Friday.', 'priority' => 'important'],
    ];

    private array $courseAnnouncements = [
        ['title' => 'Welcome to the Course', 'content' => 'Welcome to this semester! Please review the syllabus and course expectations. Office hours are available for questions.'],
        ['title' => 'Assignment Deadline Reminder', 'content' => 'Reminder: The upcoming assignment is due this Friday at 11:59 PM. Late submissions will receive a 10% penalty per day.'],
        ['title' => 'Class Cancelled - Instructor Illness', 'content' => 'Class is cancelled today due to instructor illness. We will resume next session. Please use this time to review the reading materials.'],
        ['title' => 'Guest Speaker Next Week', 'content' => 'We have an exciting guest speaker joining us next week from industry. Attendance is highly encouraged.'],
        ['title' => 'Midterm Review Session', 'content' => 'A midterm review session will be held this Thursday at 4 PM in the usual classroom. Bring your questions!'],
    ];

    public function run(): void
    {
        $this->command->info('Seeding academic core data...');

        $this->seedClassSessions();
        $this->seedAssignments();
        $this->seedSubmissions();
        $this->seedAnnouncements();

        // Call existing attendance seeder
        $this->call(AttendanceSeeder::class);

        $this->command->info('Academic core data seeded successfully!');
    }

    private function seedClassSessions(): void
    {
        $this->command->info('Creating class sessions...');

        $sections = CourseSection::with('term')->get();
        $sessionCount = 0;

        foreach ($sections as $section) {
            $scheduleDays = $section->schedule_days ?? [];
            if (empty($scheduleDays)) {
                continue;
            }

            $termStart = Carbon::parse($section->term->start_date ?? now()->subMonths(2));
            $termEnd = Carbon::parse($section->term->end_date ?? now()->addMonths(2));

            // Only create sessions up to today
            $endDate = $termEnd->lt(now()) ? $termEnd : now();

            $current = $termStart->copy();
            $sessionNumber = 1;

            while ($current->lte($endDate)) {
                $dayName = $current->format('l');

                if (in_array($dayName, $scheduleDays)) {
                    ClassSession::create([
                        'course_section_id' => $section->id,
                        'session_date' => $current->toDateString(),
                        'start_time' => $section->start_time ?? '10:00:00',
                        'end_time' => $section->end_time ?? '11:00:00',
                        'session_number' => $sessionNumber,
                        'title' => "Session {$sessionNumber}",
                        'description' => 'Regular class session covering course material.',
                        'status' => $current->lt(now()) ? 'completed' : 'scheduled',
                    ]);
                    $sessionNumber++;
                    $sessionCount++;
                }

                $current->addDay();
            }
        }

        $this->command->info("Created {$sessionCount} class sessions");
    }

    private function seedAssignments(): void
    {
        $this->command->info('Creating assignments...');

        $sections = CourseSection::with(['course.department', 'term'])->get();
        $assignmentCount = 0;

        foreach ($sections as $section) {
            $deptCode = $section->course->department->code ?? 'DEFAULT';
            $templates = $this->assignmentTemplates[$deptCode] ?? $this->assignmentTemplates['DEFAULT'];

            // Get term dates for realistic due dates
            $termStart = Carbon::parse($section->term->start_date ?? now()->subMonths(2));
            $termEnd = Carbon::parse($section->term->end_date ?? now()->addMonths(2));
            $termDuration = $termStart->diffInDays($termEnd);

            foreach ($templates as $index => $template) {
                // Spread assignments across the term
                $daysOffset = (int) (($index + 1) / (count($templates) + 1) * $termDuration);
                $dueDate = $termStart->copy()->addDays($daysOffset);

                // Published if due date is within 3 weeks from now or in the past
                $isPublished = $dueDate->lte(now()->addWeeks(3));

                Assignment::create([
                    'course_section_id' => $section->id,
                    'title' => $template['title'],
                    'description' => $this->generateDescription($template['type']),
                    'type' => $template['type'],
                    'max_points' => $template['points'],
                    'due_date' => $dueDate->setHour(23)->setMinute(59),
                    'available_from' => $dueDate->copy()->subWeeks(2),
                    'is_published' => $isPublished,
                    'allows_late' => ! in_array($template['type'], ['exam', 'midterm', 'final']),
                    'late_penalty_per_day' => in_array($template['type'], ['exam', 'midterm', 'final']) ? 0 : 10,
                    'sort_order' => $index,
                ]);

                $assignmentCount++;
            }
        }

        $this->command->info("Created {$assignmentCount} assignments");
    }

    private function seedSubmissions(): void
    {
        $this->command->info('Creating assignment submissions...');

        // Get assignments that are past due and published
        $pastDueAssignments = Assignment::where('is_published', true)
            ->where('due_date', '<', now())
            ->with('courseSection')
            ->get();

        $submissionCount = 0;
        $gradedCount = 0;

        foreach ($pastDueAssignments as $assignment) {
            // Get enrolled students for this section
            $enrollments = Enrollment::where('course_section_id', $assignment->course_section_id)
                ->whereIn('status', ['enrolled', 'completed'])
                ->get();

            foreach ($enrollments as $enrollment) {
                // 85% of students submit past-due assignments
                if (rand(1, 100) > 85) {
                    continue;
                }

                $submittedAt = Carbon::parse($assignment->due_date)
                    ->subHours(rand(1, 72)); // Submit 1-72 hours before deadline

                $lateDays = 0;
                // 10% submit late
                if (rand(1, 100) <= 10) {
                    $lateDays = rand(1, 3);
                    $submittedAt = Carbon::parse($assignment->due_date)
                        ->addDays($lateDays);
                }

                $submission = AssignmentSubmission::create([
                    'assignment_id' => $assignment->id,
                    'enrollment_id' => $enrollment->id,
                    'content' => $this->generateSubmissionContent($assignment->type),
                    'submitted_at' => $submittedAt,
                    'late_days' => $lateDays,
                    'status' => 'submitted',
                ]);

                $submissionCount++;

                // 70% of submissions are graded
                if (rand(1, 100) <= 70) {
                    $baseScore = $this->generateRealisticScore($assignment->max_points);

                    // Apply late penalty if applicable
                    $latePenalty = 0;
                    if ($lateDays > 0 && $assignment->late_penalty_per_day > 0) {
                        $latePenalty = $lateDays * $assignment->late_penalty_per_day;
                        $latePenalty = min($latePenalty, $baseScore); // Can't go negative
                    }

                    $finalScore = $baseScore - $latePenalty;

                    $submission->update([
                        'score' => $baseScore,
                        'late_penalty_applied' => $latePenalty,
                        'final_score' => $finalScore,
                        'feedback' => $this->generateFeedback($finalScore, $assignment->max_points),
                        'graded_at' => $submittedAt->copy()->addDays(rand(1, 7)),
                        'graded_by' => $assignment->courseSection->instructor_id,
                        'status' => 'graded',
                    ]);

                    $gradedCount++;
                }
            }
        }

        $this->command->info("Created {$submissionCount} submissions ({$gradedCount} graded)");
    }

    private function seedAnnouncements(): void
    {
        $this->command->info('Creating announcements...');

        $announcementCount = 0;

        // Get a staff member to be the author (use first instructor)
        $author = Staff::first();
        if (! $author) {
            $this->command->warn('No staff found. Skipping announcements.');

            return;
        }

        // System-wide announcements (null announceable = university-wide)
        foreach ($this->systemAnnouncements as $template) {
            Announcement::create([
                'announceable_type' => null,
                'announceable_id' => null,
                'author_id' => $author->id,
                'title' => $template['title'],
                'content' => $template['content'],
                'priority' => $template['priority'],
                'is_published' => true,
                'published_at' => now()->subDays(rand(1, 30)),
            ]);
            $announcementCount++;
        }

        // Course-specific announcements (for some sections)
        $sections = CourseSection::with('instructor')->inRandomOrder()->take(20)->get();

        foreach ($sections as $section) {
            $sectionAuthor = $section->instructor ?? $author;

            // 2-3 announcements per section
            $templates = collect($this->courseAnnouncements)->random(rand(2, 3));

            foreach ($templates as $template) {
                Announcement::create([
                    'announceable_type' => CourseSection::class,
                    'announceable_id' => $section->id,
                    'author_id' => $sectionAuthor->id,
                    'title' => $template['title'],
                    'content' => $template['content'],
                    'priority' => 'normal',
                    'is_published' => true,
                    'published_at' => now()->subDays(rand(1, 14)),
                ]);
                $announcementCount++;
            }
        }

        $this->command->info("Created {$announcementCount} announcements");
    }

    private function generateDescription(string $type): string
    {
        $descriptions = [
            'homework' => 'Complete this assignment demonstrating your understanding of the course material. Submit your work before the deadline.',
            'lab' => 'Hands-on laboratory exercise. Follow the instructions carefully and document your results. Include screenshots where applicable.',
            'quiz' => 'Short assessment covering recent material. You will have one attempt. Review your notes before starting.',
            'exam' => 'Comprehensive examination covering all material to date. No collaboration allowed. Bring a calculator if permitted.',
            'midterm' => 'Midterm examination covering material from the first half of the course. Prepare thoroughly.',
            'final' => 'Final examination. Comprehensive coverage of all course material. This is a significant portion of your grade.',
            'project' => 'Major project demonstrating mastery of course concepts. Follow the rubric carefully. Original work only.',
            'paper' => 'Written assignment. Follow the formatting guidelines in the syllabus. Cite all sources properly.',
            'presentation' => 'Prepare and deliver a presentation on the assigned topic. Visual aids encouraged.',
            'participation' => 'Active participation in class activities and discussions.',
            'other' => 'Complete this assignment according to the provided instructions.',
        ];

        return $descriptions[$type] ?? $descriptions['homework'];
    }

    private function generateSubmissionContent(string $type): string
    {
        $contents = [
            'homework' => 'Submitted assignment work. [Student submission content]',
            'lab' => 'Lab report with methodology, results, and conclusions.',
            'quiz' => 'Quiz responses submitted.',
            'exam' => 'Exam completed.',
            'midterm' => 'Midterm exam completed.',
            'final' => 'Final exam completed.',
            'project' => 'Project submission including all required components.',
            'paper' => 'Research paper submitted.',
            'presentation' => 'Presentation slides submitted.',
            'participation' => 'Participation recorded.',
            'other' => 'Assignment submitted.',
        ];

        return $contents[$type] ?? $contents['homework'];
    }

    private function generateRealisticScore(float $maxPoints): float
    {
        // Normal distribution centered around 82% with std dev of 12%
        $mean = 0.82;
        $stdDev = 0.12;

        // Box-Muller transform for normal distribution
        $u1 = rand(1, 1000) / 1000;
        $u2 = rand(1, 1000) / 1000;
        $z = sqrt(-2 * log($u1)) * cos(2 * M_PI * $u2);

        $percentage = $mean + $z * $stdDev;
        $percentage = max(0.4, min(1.0, $percentage)); // Clamp between 40% and 100%

        return round($percentage * $maxPoints, 2);
    }

    private function generateFeedback(float $score, float $maxPoints): string
    {
        $percentage = ($score / $maxPoints) * 100;

        if ($percentage >= 90) {
            return 'Excellent work! Your submission demonstrates strong understanding of the material.';
        } elseif ($percentage >= 80) {
            return 'Good job! Solid understanding shown. Minor areas for improvement noted.';
        } elseif ($percentage >= 70) {
            return 'Satisfactory work. Review the feedback and focus on the areas needing improvement.';
        } elseif ($percentage >= 60) {
            return 'Needs improvement. Please review the material and consider attending office hours.';
        } else {
            return 'Below expectations. Please see the instructor to discuss how to improve.';
        }
    }
}
