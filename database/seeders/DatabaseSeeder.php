<?php

namespace Database\Seeders;

use App\Models\AcademicRecord;
use App\Models\AdmissionApplication;
use App\Models\Building;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Document;
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
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Log::info('Starting comprehensive database seeding...');

        // Step 1: Create foundational data (roles, permissions)
        $this->call([
            RolePermissionSeeder::class,
            PermissionSeeder::class,
        ]);

        // Step 2: Create academic hierarchy manually to avoid unique issues
        $this->seedAcademicHierarchy();

        // Step 3: Create infrastructure
        $this->seedInfrastructure();

        // Step 4: Create terms manually
        $this->seedTerms();

        // Step 5: Create course sections
        $this->seedCourseSections();

        // Step 5b: Add realistic course catalog and faculty
        $this->call([
            RealisticCourseCatalogSeeder::class,
            RealisticFacultySeeder::class,
        ]);

        // Step 6: Create students and users
        $this->seedStudents();

        // Step 7: Create applications and enrollments
        $this->seedApplicationsAndEnrollments();

        // Step 8: Create demo data
        $this->call([
            DemoSeeder::class,
        ]);

        // Step 9: Create academic core data (assignments, submissions, announcements, etc.)
        $this->call([
            AcademicCoreSeeder::class,
        ]);

        // Step 10: Create comprehensive admissions data (prospective students, applications, essays)
        $this->call([
            AdmissionsSeeder::class,
        ]);

        // Step 11: Create financial aid data (scholarships, aid packages, awards, disbursements)
        $this->call([
            FinancialAidSeeder::class,
        ]);

        // Step 12: Convert accepted students to enrolled (matriculation)
        $this->call([
            EnrollmentConversionSeeder::class,
        ]);

        // Step 13: Update student academic records (GPA, credits, standing)
        $this->call([
            StudentAcademicUpdateSeeder::class,
        ]);

        // Step 14: Create calendar events
        $this->call([
            EventSeeder::class,
        ]);

        // Step 15: Create messages and conversations
        $this->call([
            MessageSeeder::class,
        ]);

        // Step 16: Create billing data (tuition rates, invoices, payments)
        $this->call([
            BillingSeeder::class,
        ]);

        // Step 17: Create system settings
        $this->call([
            SystemSettingSeeder::class,
        ]);

        // Step 18: Create holds and action items for demo
        $this->call([
            HoldsAndActionItemsSeeder::class,
        ]);

        Log::info('Database seeding completed successfully!');
    }

    private function seedAcademicHierarchy(): void
    {
        Log::info('Seeding academic hierarchy...');

        // Create specific faculties
        $faculties = [
            Faculty::firstOrCreate(['name' => 'Faculty of Engineering']),
            Faculty::firstOrCreate(['name' => 'Faculty of Arts & Sciences']),
            Faculty::firstOrCreate(['name' => 'Faculty of Business']),
        ];

        // Create specific departments
        $departments = [
            Department::firstOrCreate(['code' => 'CS'], ['faculty_id' => $faculties[0]->id, 'name' => 'Computer Science']),
            Department::firstOrCreate(['code' => 'EE'], ['faculty_id' => $faculties[0]->id, 'name' => 'Electrical Engineering']),
            Department::firstOrCreate(['code' => 'MATH'], ['faculty_id' => $faculties[1]->id, 'name' => 'Mathematics']),
            Department::firstOrCreate(['code' => 'ENG'], ['faculty_id' => $faculties[1]->id, 'name' => 'English']),
            Department::firstOrCreate(['code' => 'BUS'], ['faculty_id' => $faculties[2]->id, 'name' => 'Business Administration']),
        ];

        // Create specific programs
        $programData = [
            ['dept_idx' => 0, 'name' => 'Bachelor of Computer Science'],
            ['dept_idx' => 1, 'name' => 'Bachelor of Electrical Engineering'],
            ['dept_idx' => 2, 'name' => 'Bachelor of Mathematics'],
            ['dept_idx' => 3, 'name' => 'Bachelor of English'],
            ['dept_idx' => 4, 'name' => 'Bachelor of Business Administration'],
        ];

        foreach ($programData as $progData) {
            Program::create([
                'department_id' => $departments[$progData['dept_idx']]->id,
                'name' => $progData['name'],
                'degree_level' => 'bachelor',
                'duration' => 4,
                'description' => 'A comprehensive undergraduate program providing foundational knowledge and practical skills.',
                'requirements' => 'High school diploma, standardized test scores, letters of recommendation.',
                'capacity' => 100,
            ]);
        }

        // Create specific courses
        $courses = [
            ['department_id' => $departments[0]->id, 'course_code' => 'CS101', 'title' => 'Introduction to Programming', 'credits' => 3],
            ['department_id' => $departments[0]->id, 'course_code' => 'CS201', 'title' => 'Data Structures', 'credits' => 3],
            ['department_id' => $departments[0]->id, 'course_code' => 'CS301', 'title' => 'Algorithms', 'credits' => 3],
            ['department_id' => $departments[1]->id, 'course_code' => 'EE101', 'title' => 'Circuit Analysis', 'credits' => 4],
            ['department_id' => $departments[1]->id, 'course_code' => 'EE201', 'title' => 'Electronics', 'credits' => 4],
            ['department_id' => $departments[2]->id, 'course_code' => 'MATH101', 'title' => 'Calculus I', 'credits' => 4],
            ['department_id' => $departments[2]->id, 'course_code' => 'MATH201', 'title' => 'Calculus II', 'credits' => 4],
            ['department_id' => $departments[3]->id, 'course_code' => 'ENG101', 'title' => 'English Composition', 'credits' => 3],
            ['department_id' => $departments[4]->id, 'course_code' => 'BUS101', 'title' => 'Business Fundamentals', 'credits' => 3],
            ['department_id' => $departments[4]->id, 'course_code' => 'BUS201', 'title' => 'Marketing Principles', 'credits' => 3],
        ];

        $descriptions = [
            'CS101' => 'An introductory course teaching programming fundamentals using Python, covering variables, control flow, functions, and basic data structures.',
            'CS201' => 'Explores linked lists, trees, hash tables, graphs, and sorting algorithms with emphasis on time/space complexity analysis.',
            'CS301' => 'Advanced study of algorithm design paradigms including divide-and-conquer, dynamic programming, greedy methods, and NP-completeness.',
            'EE101' => 'Covers Kirchhoff\'s laws, Thevenin/Norton equivalents, RC/RL circuits, and AC steady-state analysis using phasors.',
            'EE201' => 'Study of semiconductor devices, diode circuits, BJT and MOSFET amplifiers, and operational amplifier applications.',
            'MATH101' => 'Limits, derivatives, integrals, and the Fundamental Theorem of Calculus with applications to physics and engineering.',
            'MATH201' => 'Techniques of integration, infinite series, parametric equations, and polar coordinates.',
            'ENG101' => 'Develops academic writing skills through essay composition, rhetorical analysis, research methods, and revision strategies.',
            'BUS101' => 'Overview of management, marketing, finance, and operations within modern business organizations.',
            'BUS201' => 'Consumer behavior, market segmentation, product positioning, pricing strategies, and digital marketing channels.',
        ];

        foreach ($courses as $courseData) {
            Course::create(array_merge($courseData, [
                'description' => $descriptions[$courseData['course_code']] ?? 'Fundamental concepts and practical applications in the discipline.',
            ]));
        }

        // Create staff - assign to existing departments
        for ($i = 0; $i < 25; $i++) {
            $user = User::factory()->create();
            Staff::create([
                'user_id' => $user->id,
                'department_id' => $departments[array_rand($departments)]->id,
                'job_title' => fake()->jobTitle(),
                'bio' => fake()->paragraph(),
                'office_location' => 'Building '.fake()->buildingNumber().', Room '.fake()->randomNumber(3),
            ]);
        }
    }

    private function seedInfrastructure(): void
    {
        Log::info('Seeding infrastructure...');

        $buildings = [
            Building::create(['name' => 'Science Hall', 'address' => '123 University Ave']),
            Building::create(['name' => 'Engineering Building', 'address' => '456 College St']),
            Building::create(['name' => 'Liberal Arts Center', 'address' => '789 Academic Way']),
        ];

        foreach ($buildings as $building) {
            for ($i = 101; $i <= 110; $i++) {
                Room::create([
                    'building_id' => $building->id,
                    'room_number' => (string) $i,
                    'capacity' => rand(20, 50),
                    'type' => 'classroom',
                ]);
            }
        }
    }

    private function seedTerms(): void
    {
        Log::info('Seeding terms...');

        $terms = [
            Term::create(['name' => 'Fall 2024', 'academic_year' => 2024, 'semester' => 'Fall', 'start_date' => '2024-09-01', 'end_date' => '2024-12-15']),
            Term::create(['name' => 'Spring 2025', 'academic_year' => 2025, 'semester' => 'Spring', 'start_date' => '2025-01-15', 'end_date' => '2025-05-15']),
            Term::create(['name' => 'Summer 2025', 'academic_year' => 2025, 'semester' => 'Summer', 'start_date' => '2025-06-01', 'end_date' => '2025-08-15']),
        ];
    }

    private function seedCourseSections(): void
    {
        Log::info('Seeding course sections...');

        $courses = Course::all();
        $terms = Term::all();
        $staff = Staff::all();
        $rooms = Room::all();

        $scheduleOptions = [
            ['days' => ['Monday', 'Wednesday', 'Friday'], 'start' => '09:00:00', 'end' => '09:50:00'],
            ['days' => ['Monday', 'Wednesday', 'Friday'], 'start' => '10:00:00', 'end' => '10:50:00'],
            ['days' => ['Monday', 'Wednesday', 'Friday'], 'start' => '11:00:00', 'end' => '11:50:00'],
            ['days' => ['Monday', 'Wednesday', 'Friday'], 'start' => '13:00:00', 'end' => '13:50:00'],
            ['days' => ['Tuesday', 'Thursday'], 'start' => '09:30:00', 'end' => '10:45:00'],
            ['days' => ['Tuesday', 'Thursday'], 'start' => '11:00:00', 'end' => '12:15:00'],
            ['days' => ['Tuesday', 'Thursday'], 'start' => '14:00:00', 'end' => '15:15:00'],
            ['days' => ['Tuesday', 'Thursday'], 'start' => '15:30:00', 'end' => '16:45:00'],
            ['days' => ['Monday', 'Wednesday'], 'start' => '14:00:00', 'end' => '15:15:00'],
            ['days' => ['Monday', 'Wednesday'], 'start' => '16:00:00', 'end' => '17:15:00'],
        ];

        foreach ($terms as $term) {
            foreach ($courses as $course) {
                // Create 1-2 sections per course per term
                $sectionCount = rand(1, 2);
                for ($i = 0; $i < $sectionCount; $i++) {
                    $schedule = $scheduleOptions[array_rand($scheduleOptions)];
                    CourseSection::create([
                        'course_id' => $course->id,
                        'term_id' => $term->id,
                        'instructor_id' => $staff->random()->id,
                        'room_id' => $rooms->random()->id,
                        'section_number' => str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                        'capacity' => rand(20, 40),
                        'status' => 'open',
                        'schedule_days' => $schedule['days'],
                        'start_time' => $schedule['start'],
                        'end_time' => $schedule['end'],
                    ]);
                }
            }
        }
    }

    private function seedStudents(): void
    {
        Log::info('Seeding students...');

        $studentRole = Role::where('name', 'student')->first();
        $adminRole = Role::where('name', 'admin')->first();

        // Create admin
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@university.edu',
            'email_verified_at' => now(),
        ]);
        $adminUser->roles()->attach($adminRole);

        // Create 100 students
        for ($i = 0; $i < 100; $i++) {
            $user = User::factory()->create([
                'email_verified_at' => now(),
            ]);
            $user->roles()->attach($studentRole);

            $student = Student::create([
                'user_id' => $user->id,
                'student_number' => 'STU'.str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'date_of_birth' => fake()->dateTimeBetween('-25 years', '-17 years')->format('Y-m-d'),
                'gender' => fake()->randomElement(['male', 'female', 'other']),
                'nationality' => 'American',
                'address' => fake()->streetAddress(),
                'city' => fake()->city(),
                'state' => fake()->stateAbbr(),
                'postal_code' => fake()->postcode(),
                'country' => 'United States',
                'phone' => fake()->phoneNumber(),
                'emergency_contact_name' => fake()->name(),
                'emergency_contact_phone' => fake()->phoneNumber(),
            ]);

            // Create academic records
            AcademicRecord::create([
                'student_id' => $student->id,
                'institution_name' => fake()->company().' High School',
                'qualification_type' => 'High School Diploma',
                'gpa' => fake()->randomFloat(2, 2.5, 4.0),
                'start_date' => fake()->dateTimeBetween('-6 years', '-2 years')->format('Y-m-d'),
                'end_date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
                'verified' => true,
            ]);

            // Create documents
            Document::factory()->count(2)->create(['student_id' => $student->id]);
        }
    }

    private function seedApplicationsAndEnrollments(): void
    {
        Log::info('Seeding applications and enrollments...');

        $students = Student::all();
        $programs = Program::all();
        $terms = Term::all();
        $courseSections = CourseSection::all();

        // Create admission applications for most students
        foreach ($students->take(80) as $student) {
            $application = AdmissionApplication::create([
                'student_id' => $student->id,
                'term_id' => $terms->first()->id,
                'status' => fake()->randomElement(['pending', 'accepted', 'accepted', 'accepted']), // More accepted
                'application_date' => fake()->dateTimeBetween('-6 months', 'now'),
            ]);

            // Create program choice
            ProgramChoice::create([
                'application_id' => $application->id,
                'program_id' => $programs->random()->id,
                'preference_order' => 1,
                'status' => $application->status,
            ]);

            // If accepted, create enrollments
            if ($application->status === 'accepted') {
                $studentSections = $courseSections->random(rand(3, 5));
                foreach ($studentSections as $section) {
                    // 60% of enrollments get grades (completed courses)
                    $isCompleted = fake()->boolean(60);

                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_section_id' => $section->id,
                        'status' => $isCompleted ? 'completed' : 'enrolled',
                        'enrollment_date' => fake()->dateTimeBetween('-3 months', 'now'),
                        'grade' => $isCompleted ? $this->generateRealisticGrade() : null,
                    ]);
                }
            }
        }

        // Create some full sections with waitlists
        $fullSections = $courseSections->take(5);
        foreach ($fullSections as $section) {
            // Fill to capacity
            $availableStudents = Student::whereHas('admissionApplications', function ($q) {
                $q->where('status', 'accepted');
            })->whereDoesntHave('enrollments', function ($q) use ($section) {
                $q->where('course_section_id', $section->id);
            })->take($section->capacity)->get();

            foreach ($availableStudents as $student) {
                $isCompleted = fake()->boolean(60);

                Enrollment::create([
                    'student_id' => $student->id,
                    'course_section_id' => $section->id,
                    'status' => $isCompleted ? 'completed' : 'enrolled',
                    'enrollment_date' => fake()->dateTimeBetween('-3 months', 'now'),
                    'grade' => $isCompleted ? $this->generateRealisticGrade() : null,
                ]);
            }

            // Add waitlist students
            $waitlistStudents = Student::whereHas('admissionApplications', function ($q) {
                $q->where('status', 'accepted');
            })->whereDoesntHave('enrollments', function ($q) use ($section) {
                $q->where('course_section_id', $section->id);
            })->take(3)->get();

            foreach ($waitlistStudents as $student) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'course_section_id' => $section->id,
                    'status' => 'waitlisted',
                    'enrollment_date' => fake()->dateTimeBetween('-3 months', 'now'),
                ]);
            }
        }
    }

    /**
     * Generate realistic grade following a normal distribution
     * Grade distribution: A (10%), A- (10%), B+ (15%), B (20%), B- (15%), C+ (15%), C (10%), C- (3%), D (1%), F (1%)
     */
    private function generateRealisticGrade(): string
    {
        $random = rand(1, 100);

        if ($random <= 10) {
            return 'A';
        }      // 10%
        if ($random <= 20) {
            return 'A-';
        }     // 10%
        if ($random <= 35) {
            return 'B+';
        }     // 15%
        if ($random <= 55) {
            return 'B';
        }      // 20%
        if ($random <= 70) {
            return 'B-';
        }     // 15%
        if ($random <= 85) {
            return 'C+';
        }     // 15%
        if ($random <= 95) {
            return 'C';
        }      // 10%
        if ($random <= 98) {
            return 'C-';
        }     // 3%
        if ($random <= 99) {
            return 'D';
        }      // 1%

        return 'F';                         // 1%
    }
}
