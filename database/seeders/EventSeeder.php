<?php

namespace Database\Seeders;

use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Event;
use App\Models\Term;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Log::info('Seeding events...');

        $term = Term::where('name', 'Fall 2024')->first();
        $admin = User::whereHas('roles', fn ($q) => $q->where('name', 'admin'))->first();
        $departments = Department::all();
        $courseSections = CourseSection::with('course')->take(10)->get();

        if (! $term || ! $admin) {
            Log::warning('Missing term or admin user for event seeding');

            return;
        }

        // University-wide academic events
        $academicEvents = [
            [
                'title' => 'Fall Semester Begins',
                'description' => 'First day of classes for the Fall 2024 semester.',
                'start_time' => Carbon::parse($term->start_date),
                'end_time' => Carbon::parse($term->start_date)->addHours(8),
                'all_day' => true,
                'type' => 'academic',
                'visibility' => 'public',
            ],
            [
                'title' => 'Add/Drop Period Ends',
                'description' => 'Last day to add or drop courses without penalty.',
                'start_time' => Carbon::parse($term->start_date)->addWeeks(2),
                'end_time' => Carbon::parse($term->start_date)->addWeeks(2)->endOfDay(),
                'all_day' => true,
                'type' => 'deadline',
                'visibility' => 'students',
            ],
            [
                'title' => 'Midterm Examinations',
                'description' => 'Midterm examination period begins.',
                'start_time' => Carbon::parse($term->start_date)->addWeeks(7),
                'end_time' => Carbon::parse($term->start_date)->addWeeks(8),
                'all_day' => true,
                'type' => 'exam',
                'visibility' => 'students',
            ],
            [
                'title' => 'Registration Opens for Spring 2025',
                'description' => 'Course registration for Spring 2025 semester opens.',
                'start_time' => Carbon::parse($term->start_date)->addWeeks(10),
                'end_time' => Carbon::parse($term->start_date)->addWeeks(10)->addHours(8),
                'all_day' => true,
                'type' => 'registration',
                'visibility' => 'students',
            ],
            [
                'title' => 'Thanksgiving Break',
                'description' => 'University closed for Thanksgiving holiday.',
                'start_time' => Carbon::parse('2024-11-28'),
                'end_time' => Carbon::parse('2024-12-01'),
                'all_day' => true,
                'type' => 'holiday',
                'visibility' => 'public',
            ],
            [
                'title' => 'Last Day of Classes',
                'description' => 'Final day of regular classes for Fall 2024.',
                'start_time' => Carbon::parse($term->end_date)->subWeeks(1),
                'end_time' => Carbon::parse($term->end_date)->subWeeks(1)->endOfDay(),
                'all_day' => true,
                'type' => 'academic',
                'visibility' => 'public',
            ],
            [
                'title' => 'Final Examinations',
                'description' => 'Final examination period.',
                'start_time' => Carbon::parse($term->end_date)->subDays(5),
                'end_time' => Carbon::parse($term->end_date),
                'all_day' => true,
                'type' => 'exam',
                'visibility' => 'students',
            ],
            [
                'title' => 'Grade Submission Deadline',
                'description' => 'Final grades due from instructors.',
                'start_time' => Carbon::parse($term->end_date)->addDays(3),
                'end_time' => Carbon::parse($term->end_date)->addDays(3)->endOfDay(),
                'all_day' => true,
                'type' => 'deadline',
                'visibility' => 'staff',
            ],
        ];

        foreach ($academicEvents as $eventData) {
            Event::create(array_merge($eventData, [
                'created_by' => $admin->id,
                'term_id' => $term->id,
            ]));
        }

        // Orientation events
        $orientationEvents = [
            [
                'title' => 'New Student Orientation',
                'description' => 'Welcome session for new students. Meet faculty, staff, and fellow students.',
                'start_time' => Carbon::parse($term->start_date)->subDays(3)->setHour(9),
                'end_time' => Carbon::parse($term->start_date)->subDays(3)->setHour(16),
                'location' => 'Student Center, Main Hall',
                'type' => 'orientation',
                'visibility' => 'students',
            ],
            [
                'title' => 'Campus Tour',
                'description' => 'Guided tour of campus facilities and resources.',
                'start_time' => Carbon::parse($term->start_date)->subDays(2)->setHour(10),
                'end_time' => Carbon::parse($term->start_date)->subDays(2)->setHour(12),
                'location' => 'Meet at Main Entrance',
                'type' => 'orientation',
                'visibility' => 'students',
            ],
            [
                'title' => 'Academic Advising Session',
                'description' => 'Meet with academic advisors to plan your course schedule.',
                'start_time' => Carbon::parse($term->start_date)->subDays(1)->setHour(14),
                'end_time' => Carbon::parse($term->start_date)->subDays(1)->setHour(17),
                'location' => 'Advising Center, Building A',
                'type' => 'orientation',
                'visibility' => 'students',
            ],
        ];

        foreach ($orientationEvents as $eventData) {
            Event::create(array_merge($eventData, [
                'created_by' => $admin->id,
                'term_id' => $term->id,
            ]));
        }

        // Department-specific events
        foreach ($departments->take(3) as $dept) {
            Event::create([
                'title' => "{$dept->name} Welcome Reception",
                'description' => "Welcome reception for {$dept->name} students and faculty.",
                'start_time' => Carbon::parse($term->start_date)->addWeek()->setHour(17),
                'end_time' => Carbon::parse($term->start_date)->addWeek()->setHour(19),
                'location' => "{$dept->name} Building, Room 100",
                'type' => 'general',
                'visibility' => 'students',
                'created_by' => $admin->id,
                'term_id' => $term->id,
                'department_id' => $dept->id,
            ]);

            Event::create([
                'title' => "{$dept->name} Career Workshop",
                'description' => "Career development workshop for {$dept->name} majors.",
                'start_time' => Carbon::parse($term->start_date)->addWeeks(6)->setHour(14),
                'end_time' => Carbon::parse($term->start_date)->addWeeks(6)->setHour(16),
                'location' => 'Career Center',
                'type' => 'meeting',
                'visibility' => 'students',
                'created_by' => $admin->id,
                'term_id' => $term->id,
                'department_id' => $dept->id,
            ]);
        }

        // Course-specific events (office hours, review sessions)
        foreach ($courseSections->take(5) as $section) {
            // Midterm review session
            Event::create([
                'title' => "{$section->course->course_code} Midterm Review",
                'description' => 'Review session for the upcoming midterm exam.',
                'start_time' => Carbon::parse($term->start_date)->addWeeks(6)->addDays(5)->setHour(18),
                'end_time' => Carbon::parse($term->start_date)->addWeeks(6)->addDays(5)->setHour(20),
                'location' => $section->room ? "Room {$section->room->room_number}" : 'TBA',
                'type' => 'class',
                'visibility' => 'students',
                'created_by' => $admin->id,
                'term_id' => $term->id,
                'course_section_id' => $section->id,
            ]);

            // Final exam review
            Event::create([
                'title' => "{$section->course->course_code} Final Review",
                'description' => 'Review session before the final exam.',
                'start_time' => Carbon::parse($term->end_date)->subWeeks(2)->setHour(18),
                'end_time' => Carbon::parse($term->end_date)->subWeeks(2)->setHour(20),
                'location' => $section->room ? "Room {$section->room->room_number}" : 'TBA',
                'type' => 'class',
                'visibility' => 'students',
                'created_by' => $admin->id,
                'term_id' => $term->id,
                'course_section_id' => $section->id,
            ]);
        }

        // Upcoming events (relative to current date for demo purposes)
        $upcomingEvents = [
            [
                'title' => 'Career Fair',
                'description' => 'Annual career fair with 50+ employers. Bring your resume!',
                'start_time' => now()->addDays(7)->setHour(10),
                'end_time' => now()->addDays(7)->setHour(15),
                'location' => 'Recreation Center',
                'type' => 'general',
                'visibility' => 'public',
            ],
            [
                'title' => 'Study Abroad Information Session',
                'description' => 'Learn about study abroad opportunities for next year.',
                'start_time' => now()->addDays(10)->setHour(14),
                'end_time' => now()->addDays(10)->setHour(15)->addMinutes(30),
                'location' => 'International Center, Room 201',
                'type' => 'meeting',
                'visibility' => 'students',
            ],
            [
                'title' => 'Faculty Research Symposium',
                'description' => 'Faculty present their latest research projects.',
                'start_time' => now()->addDays(14)->setHour(13),
                'end_time' => now()->addDays(14)->setHour(17),
                'location' => 'Science Hall Auditorium',
                'type' => 'academic',
                'visibility' => 'public',
            ],
            [
                'title' => 'FAFSA Deadline Reminder',
                'description' => 'Priority deadline for FAFSA submission.',
                'start_time' => now()->addDays(21),
                'end_time' => now()->addDays(21)->endOfDay(),
                'all_day' => true,
                'type' => 'deadline',
                'visibility' => 'students',
            ],
            [
                'title' => 'Library Extended Hours',
                'description' => 'Library open 24/7 during finals prep week.',
                'start_time' => now()->addDays(30)->setHour(0),
                'end_time' => now()->addDays(37)->setHour(23)->setMinute(59),
                'all_day' => true,
                'location' => 'Main Library',
                'type' => 'general',
                'visibility' => 'public',
            ],
        ];

        foreach ($upcomingEvents as $eventData) {
            Event::create(array_merge($eventData, [
                'created_by' => $admin->id,
                'term_id' => $term->id,
            ]));
        }

        $eventCount = Event::count();
        Log::info("Created {$eventCount} events");
    }
}
