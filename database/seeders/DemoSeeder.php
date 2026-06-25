<?php

namespace Database\Seeders;

use App\Models\AcademicRecord;
use App\Models\AdmissionApplication;
use App\Models\Building;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Faculty;
use App\Models\Program;
use App\Models\ProgramChoice;
use App\Models\Role;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles (using correct capitalization from database)
        $adminRole = Role::where('name', 'Admin')->first();
        $studentRole = Role::where('name', 'Student')->first();
        $instructorRole = Role::where('name', 'Faculty')->first(); // Faculty is the instructor role

        // Create demo admin
        $adminUser = User::create([
            'name' => 'Dr. Elizabeth Harper',
            'email' => 'admin@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $adminUser->roles()->attach($adminRole);

        // Create a completed past term for academic history
        $pastTerm = Term::firstOrCreate(
            ['academic_year' => 2025, 'semester' => 'Spring'],
            [
                'name' => 'Spring 2025',
                'start_date' => '2025-01-15',
                'end_date' => '2025-05-15',
                'add_drop_deadline' => '2025-01-30',
            ]
        );

        // Get current term (Fall 2025) - or create if doesn't exist
        $currentTerm = Term::firstOrCreate(
            ['academic_year' => 2025, 'semester' => 'Fall'],
            [
                'name' => 'Fall 2025',
                'start_date' => '2025-09-01',
                'end_date' => '2025-12-20',
                'add_drop_deadline' => '2025-09-15',
            ]
        );

        // Get academic structure
        $csFaculty = Faculty::where('name', 'like', '%Science%')->first();
        $csDepartment = Department::where('name', 'like', '%Computer%')->first();
        $csProgram = Program::where('name', 'like', '%Computer Science%')
            ->where('degree_level', 'Bachelor')
            ->first();

        // Create some compelling courses if they don't exist
        $aiCourse = Course::firstOrCreate(
            ['course_code' => 'CS350'],
            [
                'title' => 'Introduction to Artificial Intelligence',
                'description' => 'Fundamentals of AI including machine learning, neural networks, and ethical considerations',
                'credits' => 3,
                'department_id' => $csDepartment->id,
            ]
        );

        $dataStructuresCourse = Course::firstOrCreate(
            ['course_code' => 'CS201'],
            [
                'title' => 'Data Structures and Algorithms',
                'description' => 'Essential data structures and algorithmic thinking for software development',
                'credits' => 3,
                'department_id' => $csDepartment->id,
            ]
        );

        $webDevCourse = Course::firstOrCreate(
            ['course_code' => 'CS220'],
            [
                'title' => 'Full Stack Web Development',
                'description' => 'Modern web development with React, Node.js, and cloud deployment',
                'credits' => 3,
                'department_id' => $csDepartment->id,
            ]
        );

        // Create instructor for courses
        $instructorUser = User::create([
            'name' => 'Prof. Alan Turing',
            'email' => 'turing@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $instructorUser->roles()->attach($instructorRole);

        $instructor = Staff::create([
            'user_id' => $instructorUser->id,
            'department_id' => $csDepartment->id,
            'job_title' => 'Professor of Computer Science',
            'office_location' => 'Science Building 301',
        ]);

        // Create course sections
        $building = Building::first();
        $room1 = Room::where('building_id', $building->id)->first();

        // AI Course - Popular, limited capacity
        $aiSection = CourseSection::create([
            'course_id' => $aiCourse->id,
            'term_id' => $currentTerm->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room1->id,
            'section_number' => '001',
            'capacity' => 2, // Very limited to show waitlist
            'status' => 'open',
            'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
            'start_time' => '10:00:00',
            'end_time' => '11:30:00',
        ]);

        // Data Structures - Normal capacity
        $dsSection = CourseSection::create([
            'course_id' => $dataStructuresCourse->id,
            'term_id' => $currentTerm->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room1->id,
            'section_number' => '001',
            'capacity' => 30,
            'status' => 'open',
            'schedule_days' => ['Tuesday', 'Thursday'],
            'start_time' => '14:00:00',
            'end_time' => '15:30:00',
        ]);

        // Web Dev - Normal capacity
        $webSection = CourseSection::create([
            'course_id' => $webDevCourse->id,
            'term_id' => $currentTerm->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room1->id,
            'section_number' => '001',
            'capacity' => 25,
            'status' => 'open',
            'schedule_days' => ['Monday', 'Wednesday'],
            'start_time' => '14:00:00',
            'end_time' => '15:30:00',
        ]);

        // STUDENT 1: Maria Rodriguez - Just Applied
        $maria = User::create([
            'name' => 'Maria Rodriguez',
            'email' => 'maria@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $maria->roles()->attach($studentRole);

        $mariaStudent = Student::create([
            'user_id' => $maria->id,
            'student_number' => 'STU2025001',
            'first_name' => 'Maria',
            'last_name' => 'Rodriguez',
            'date_of_birth' => '2005-03-15',
            'gender' => 'Female',
            'nationality' => 'Mexican',
            'address' => '123 Innovation Drive',
            'city' => 'Mexico City',
            'state' => 'CDMX',
            'postal_code' => '01000',
            'country' => 'Mexico',
            'phone' => '+52-555-123-4567',
            'emergency_contact_name' => 'Carlos Rodriguez',
            'emergency_contact_phone' => '+52-555-765-4321',
            'major_program_id' => $csProgram->id,
        ]);

        // Maria's academic record - high achiever
        AcademicRecord::create([
            'student_id' => $mariaStudent->id,
            'institution_name' => 'Instituto Tecnológico de México',
            'qualification_type' => 'High School Diploma',
            'start_date' => '2020-09-01',
            'end_date' => '2023-06-15',
            'gpa' => 9.8, // Mexican scale out of 10
            'verified' => true,
        ]);

        // Maria's application - just submitted
        $mariaApp = AdmissionApplication::create([
            'student_id' => $mariaStudent->id,
            'term_id' => $currentTerm->id,
            'status' => 'submitted',
            'application_date' => now()->subDays(2),
        ]);

        ProgramChoice::create([
            'application_id' => $mariaApp->id,
            'program_id' => $csProgram->id,
            'preference_order' => 1,
            'status' => 'pending',
        ]);

        // STUDENT 2: David Park - Senior nearing graduation
        $david = User::create([
            'name' => 'David Park',
            'email' => 'david@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $david->roles()->attach($studentRole);

        $davidStudent = Student::create([
            'user_id' => $david->id,
            'student_number' => 'STU2022015',
            'first_name' => 'David',
            'last_name' => 'Park',
            'date_of_birth' => '2004-11-22',
            'gender' => 'Male',
            'nationality' => 'Korean',
            'address' => '456 Tech Boulevard',
            'city' => 'Seoul',
            'state' => 'Seoul',
            'postal_code' => '04524',
            'country' => 'South Korea',
            'phone' => '+82-2-555-1234',
            'emergency_contact_name' => 'Min-Jung Park',
            'emergency_contact_phone' => '+82-2-555-4321',
            'major_program_id' => $csProgram->id,
            'enrollment_status' => 'full_time',
            'class_standing' => 'senior',
            'academic_status' => 'good_standing',
            'admission_date' => '2022-08-15',
            'expected_graduation_date' => '2026-05-15',
            'total_credits_earned' => 92,
            'credits_in_progress' => 14,
            'gpa' => 3.62,
        ]);

        // David's application - enrolled
        $davidApp = AdmissionApplication::create([
            'student_id' => $davidStudent->id,
            'term_id' => $currentTerm->id,
            'status' => 'enrolled',
            'application_date' => '2022-04-15',
            'decision_date' => '2022-05-10',
            'decision_status' => 'accepted',
            'comments' => 'Strong background in mathematics and programming competitions',
        ]);

        ProgramChoice::create([
            'application_id' => $davidApp->id,
            'program_id' => $csProgram->id,
            'preference_order' => 1,
            'status' => 'accepted',
        ]);

        // ── David's 6 semesters of completed coursework ──

        // Create past terms
        $davidTerms = [
            'fall2022' => Term::firstOrCreate(
                ['academic_year' => 2022, 'semester' => 'Fall'],
                ['name' => 'Fall 2022', 'start_date' => '2022-08-22', 'end_date' => '2022-12-16', 'add_drop_deadline' => '2022-09-05']
            ),
            'spring2023' => Term::firstOrCreate(
                ['academic_year' => 2023, 'semester' => 'Spring'],
                ['name' => 'Spring 2023', 'start_date' => '2023-01-17', 'end_date' => '2023-05-12', 'add_drop_deadline' => '2023-01-31']
            ),
            'fall2023' => Term::firstOrCreate(
                ['academic_year' => 2023, 'semester' => 'Fall'],
                ['name' => 'Fall 2023', 'start_date' => '2023-08-21', 'end_date' => '2023-12-15', 'add_drop_deadline' => '2023-09-04']
            ),
            'spring2024' => Term::firstOrCreate(
                ['academic_year' => 2024, 'semester' => 'Spring'],
                ['name' => 'Spring 2024', 'start_date' => '2024-01-16', 'end_date' => '2024-05-10', 'add_drop_deadline' => '2024-01-30']
            ),
            'fall2024' => Term::firstOrCreate(
                ['academic_year' => 2024, 'semester' => 'Fall'],
                ['name' => 'Fall 2024', 'start_date' => '2024-08-19', 'end_date' => '2024-12-13', 'add_drop_deadline' => '2024-09-02']
            ),
        ];

        // Humanities/social science electives not in catalog
        $mathDept = Department::where('code', 'MATH')->first();
        $engDept = Department::where('code', 'ENG')->first();
        $histElective = Course::firstOrCreate(['course_code' => 'HIST 10'], [
            'title' => 'World History',
            'credits' => 3,
            'department_id' => $engDept?->id ?? $csDepartment->id,
            'description' => 'Survey of world civilizations from antiquity to the present.',
        ]);
        $socElective = Course::firstOrCreate(['course_code' => 'SOC 1'], [
            'title' => 'Introduction to Sociology',
            'credits' => 3,
            'department_id' => $engDept?->id ?? $csDepartment->id,
            'description' => 'Fundamentals of sociological theory and method.',
        ]);
        $philElective = Course::firstOrCreate(['course_code' => 'PHIL 25'], [
            'title' => 'Ethics',
            'credits' => 3,
            'department_id' => $engDept?->id ?? $csDepartment->id,
            'description' => 'Introduction to moral philosophy and applied ethics.',
        ]);
        $psychElective = Course::firstOrCreate(['course_code' => 'PSYCH 1'], [
            'title' => 'General Psychology',
            'credits' => 3,
            'department_id' => $engDept?->id ?? $csDepartment->id,
            'description' => 'Introduction to psychological science.',
        ]);
        $capstoneCourse = Course::firstOrCreate(['course_code' => 'CS 195'], [
            'title' => 'Senior Capstone Project',
            'credits' => 6,
            'department_id' => $csDepartment->id,
            'description' => 'Capstone project integrating knowledge from the CS curriculum.',
        ]);

        // Helper to look up catalog courses
        $catalogCourse = fn (string $code) => Course::where('course_code', $code)->first();

        // David's semester-by-semester history
        $davidSemesters = [
            ['term' => $davidTerms['fall2022'], 'courses' => [
                [$catalogCourse('CS 61A'), 'B+'],
                [$catalogCourse('MATH 16A'), 'B'],
                [$catalogCourse('ENG 1A'), 'A-'],
                [$histElective, 'B+'],
            ]],
            ['term' => $davidTerms['spring2023'], 'courses' => [
                [$catalogCourse('CS 61B'), 'A-'],
                [$catalogCourse('MATH 16B'), 'B+'],
                [$catalogCourse('ENG 1B'), 'A'],
                [$catalogCourse('STAT 135'), 'B'],
            ]],
            ['term' => $davidTerms['fall2023'], 'courses' => [
                [$catalogCourse('CS 61C'), 'A'],
                [$catalogCourse('CS 70'), 'A-'],
                [$catalogCourse('MATH 53'), 'B+'],
                [$socElective, 'A'],
            ]],
            ['term' => $davidTerms['spring2024'], 'courses' => [
                [$catalogCourse('CS 162'), 'A-'],
                [$catalogCourse('CS 170'), 'A'],
                [$catalogCourse('MATH 54'), 'B+'],
                [$philElective, 'A-'],
            ]],
            ['term' => $davidTerms['fall2024'], 'courses' => [
                [$catalogCourse('CS 186'), 'A'],
                [$catalogCourse('CS 188'), 'A-'],
                [$catalogCourse('STAT 134'), 'A-'],
                [$psychElective, 'B+'],
            ]],
            ['term' => $pastTerm, 'courses' => [ // Spring 2025
                [$catalogCourse('CS 169'), 'A-'],
                [$catalogCourse('CS 161'), 'B+'],
                [$catalogCourse('ENG 45A'), 'A'],
                [$catalogCourse('ECON 1'), 'A-'],
            ]],
        ];

        foreach ($davidSemesters as $sem) {
            $term = $sem['term'];
            foreach ($sem['courses'] as [$course, $grade]) {
                $section = CourseSection::firstOrCreate(
                    ['course_id' => $course->id, 'term_id' => $term->id, 'section_number' => '001'],
                    [
                        'instructor_id' => $instructor->id,
                        'room_id' => $room1->id,
                        'capacity' => 30,
                        'status' => 'closed',
                        'schedule_days' => ['Tuesday', 'Thursday'],
                        'start_time' => '10:00:00',
                        'end_time' => '11:15:00',
                    ]
                );
                Enrollment::create([
                    'student_id' => $davidStudent->id,
                    'course_section_id' => $section->id,
                    'status' => 'completed',
                    'enrollment_date' => $term->start_date,
                    'completion_date' => $term->end_date,
                    'grade' => $grade,
                ]);
            }
        }

        // David's current term (Fall 2025): senior capstone + upper-division CS
        $davidCurrentCourses = [
            [$catalogCourse('CS 184'), 'A-'],
            [$catalogCourse('CS 189'), null],
            [$capstoneCourse, null],
        ];
        foreach ($davidCurrentCourses as [$course, $midtermGrade]) {
            $section = CourseSection::firstOrCreate(
                ['course_id' => $course->id, 'term_id' => $currentTerm->id, 'section_number' => '001'],
                [
                    'instructor_id' => $instructor->id,
                    'room_id' => $room1->id,
                    'capacity' => 30,
                    'status' => 'open',
                    'schedule_days' => ['Monday', 'Wednesday'],
                    'start_time' => '10:00:00',
                    'end_time' => '11:30:00',
                ]
            );
            Enrollment::create([
                'student_id' => $davidStudent->id,
                'course_section_id' => $section->id,
                'status' => 'enrolled',
                'enrollment_date' => $currentTerm->start_date,
                'grade' => $midtermGrade,
            ]);
        }

        // STUDENT 3: Sophie Turner - Waitlisted for popular course
        $sophie = User::create([
            'name' => 'Sophie Turner',
            'email' => 'sophie@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $sophie->roles()->attach($studentRole);

        $sophieStudent = Student::create([
            'user_id' => $sophie->id,
            'student_number' => 'STU2025003',
            'first_name' => 'Sophie',
            'last_name' => 'Turner',
            'date_of_birth' => '2005-07-10',
            'gender' => 'Female',
            'nationality' => 'American',
            'address' => '789 University Avenue',
            'city' => 'San Francisco',
            'state' => 'CA',
            'postal_code' => '94102',
            'country' => 'USA',
            'phone' => '+1-415-555-1234',
            'emergency_contact_name' => 'James Turner',
            'emergency_contact_phone' => '+1-415-555-4321',
            'major_program_id' => $csProgram->id,
        ]);

        // Sophie's application - accepted
        $sophieApp = AdmissionApplication::create([
            'student_id' => $sophieStudent->id,
            'term_id' => $currentTerm->id,
            'status' => 'accepted',
            'application_date' => now()->subDays(25),
            'decision_date' => now()->subDays(15),
            'decision_status' => 'accepted',
            'comments' => 'Impressive portfolio of personal coding projects',
        ]);

        ProgramChoice::create([
            'application_id' => $sophieApp->id,
            'program_id' => $csProgram->id,
            'preference_order' => 1,
            'status' => 'accepted',
        ]);

        // Create filler students to fill AI spots (David no longer takes AI)
        $fillerUser1 = User::create([
            'name' => 'Alex Chen',
            'email' => 'alex@demo.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);
        $fillerUser1->roles()->attach($studentRole);
        $fillerStudent1 = Student::factory()->create([
            'user_id' => $fillerUser1->id,
            'student_number' => 'STU2025004',
            'major_program_id' => $csProgram->id,
        ]);
        Enrollment::create([
            'student_id' => $fillerStudent1->id,
            'course_section_id' => $aiSection->id,
            'status' => 'enrolled',
            'enrollment_date' => now()->subDays(12),
        ]);

        $fillerUser2 = User::create([
            'name' => 'Jordan Lee',
            'email' => 'jordan@demo.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);
        $fillerUser2->roles()->attach($studentRole);
        $fillerStudent2 = Student::factory()->create([
            'user_id' => $fillerUser2->id,
            'student_number' => 'STU2025005',
            'major_program_id' => $csProgram->id,
        ]);
        Enrollment::create([
            'student_id' => $fillerStudent2->id,
            'course_section_id' => $aiSection->id,
            'status' => 'enrolled',
            'enrollment_date' => now()->subDays(9),
        ]);

        // Sophie is waitlisted for AI (course is now full)
        Enrollment::create([
            'student_id' => $sophieStudent->id,
            'course_section_id' => $aiSection->id,
            'status' => 'waitlisted',
            'enrollment_date' => now()->subDays(8),
        ]);

        // But she's enrolled in Web Development
        Enrollment::create([
            'student_id' => $sophieStudent->id,
            'course_section_id' => $webSection->id,
            'status' => 'enrolled',
            'enrollment_date' => now()->subDays(8),
        ]);

        // ── Sophie's past-term academic history ──
        $sophiePastCourses = [
            Course::firstOrCreate(['course_code' => 'CS101'], [
                'title' => 'Introduction to Programming',
                'credits' => 3,
                'department_id' => $csDepartment->id,
                'description' => 'Programming fundamentals using Python.',
            ]),
            Course::firstOrCreate(['course_code' => 'MATH101'], [
                'title' => 'Calculus I',
                'credits' => 4,
                'department_id' => Department::where('code', 'MATH')->first()?->id ?? $csDepartment->id,
                'description' => 'Limits, derivatives, and integrals.',
            ]),
            Course::firstOrCreate(['course_code' => 'ENG101'], [
                'title' => 'English Composition',
                'credits' => 3,
                'department_id' => Department::where('code', 'ENG')->first()?->id ?? $csDepartment->id,
                'description' => 'Academic writing and rhetorical analysis.',
            ]),
        ];

        $sophiePastGrades = ['B+', 'A-', 'B'];
        foreach ($sophiePastCourses as $idx => $course) {
            $section = CourseSection::firstOrCreate(
                ['course_id' => $course->id, 'term_id' => $pastTerm->id, 'section_number' => '001'],
                [
                    'instructor_id' => $instructor->id,
                    'room_id' => $room1->id,
                    'capacity' => 30,
                    'status' => 'closed',
                    'schedule_days' => ['Tuesday', 'Thursday'],
                    'start_time' => '10:00:00',
                    'end_time' => '11:15:00',
                ]
            );
            Enrollment::create([
                'student_id' => $sophieStudent->id,
                'course_section_id' => $section->id,
                'status' => 'completed',
                'enrollment_date' => '2025-01-15',
                'completion_date' => '2025-05-15',
                'grade' => $sophiePastGrades[$idx],
            ]);
        }

        // Give Sophie a grade on her current enrollment
        Enrollment::where('student_id', $sophieStudent->id)
            ->where('course_section_id', $webSection->id)
            ->update(['grade' => 'A']);

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('');
        $this->command->info('Demo Accounts:');
        $this->command->info('Admin: admin@demo.com / password');
        $this->command->info('Student 1 (Just Applied): maria@demo.com / password');
        $this->command->info('Student 2 (Senior): david@demo.com / password');
        $this->command->info('Student 3 (Waitlisted): sophie@demo.com / password');
        $this->command->info('');
        $this->command->info('Demo Scenario:');
        $this->command->info('- Maria: Just submitted application from Mexico');
        $this->command->info('- David: Senior from Korea, 92 credits, 3.62 GPA, graduating Spring 2026');
        $this->command->info('- Sophie: Local student, waitlisted for popular AI course');
        $this->command->info('- AI Course: Full (2/2 capacity) with Sophie on waitlist');
    }
}
