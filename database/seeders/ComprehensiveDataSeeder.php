<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Role;
use App\Models\Term;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Program;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Building;
use App\Models\Room;
use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use App\Models\Enrollment;
use App\Models\AcademicRecord;
use App\Models\Document;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ComprehensiveDataSeeder extends Seeder
{
    protected $faker;

    public function __construct()
    {
        $this->faker = Faker::create();
    }

    public function run(): void
    {
        $this->command->info('🚀 Starting comprehensive data seeding...');

        // Get roles
        $adminRole = Role::where('name', 'Admin')->first();
        $studentRole = Role::where('name', 'Student')->first();
        $facultyRole = Role::where('name', 'Faculty')->first();
        $staffRole = Role::where('name', 'Staff')->first();

        // Create GOD MODE admin account
        $godUser = User::create([
            'name' => 'God Mode Admin',
            'email' => 'god@admin.com',
            'password' => 'godmode123',
            'email_verified_at' => now(),
        ]);
        $godUser->roles()->attach([$adminRole->id, $staffRole->id, $facultyRole->id]);

        // Create terms (past, current, future)
        $terms = $this->createTerms();
        $currentTerm = $terms['current'];

        // Create more buildings and rooms
        $infrastructure = $this->createInfrastructure();

        // Create comprehensive academic structure
        $academic = $this->createAcademicStructure();

        // Create faculty/staff members
        $instructors = $this->createInstructors($academic['departments'], $facultyRole, $staffRole);

        // Create comprehensive course catalog
        $courses = $this->createCourses($academic['departments']);

        // Create course sections for current and next term
        $sections = $this->createCourseSections($courses, $terms, $instructors, $infrastructure['rooms']);

        // Create diverse student population
        $students = $this->createStudents($studentRole, $academic['programs'], $terms, $sections);

        $this->command->info('✅ Comprehensive seeding complete!');
        $this->displaySummary($students);
    }

    protected function createTerms()
    {
        $terms = [];

        // Past term
        $terms['past'] = Term::create([
            'name' => 'Spring 2025',
            'academic_year' => 2025,
            'semester' => 'Spring',
            'start_date' => '2025-01-15',
            'end_date' => '2025-05-15',
            'add_drop_deadline' => '2025-01-30',
        ]);

        // Current term
        $terms['current'] = Term::create([
            'name' => 'Fall 2025',
            'academic_year' => 2025,
            'semester' => 'Fall',
            'start_date' => '2025-09-01',
            'end_date' => '2025-12-20',
            'add_drop_deadline' => '2025-09-15',
        ]);

        // Future term
        $terms['future'] = Term::create([
            'name' => 'Spring 2026',
            'academic_year' => 2026,
            'semester' => 'Spring',
            'start_date' => '2026-01-15',
            'end_date' => '2026-05-15',
            'add_drop_deadline' => '2026-01-30',
        ]);

        return $terms;
    }

    protected function createInfrastructure()
    {
        $buildings = [
            ['name' => 'Science Hall', 'code' => 'SCI', 'address' => '100 University Way'],
            ['name' => 'Engineering Building', 'code' => 'ENG', 'address' => '200 Tech Drive'],
            ['name' => 'Liberal Arts Center', 'code' => 'LAC', 'address' => '300 Arts Boulevard'],
            ['name' => 'Business School', 'code' => 'BUS', 'address' => '400 Commerce Street'],
            ['name' => 'Medical Complex', 'code' => 'MED', 'address' => '500 Health Avenue'],
        ];

        $createdBuildings = [];
        $allRooms = [];

        foreach ($buildings as $buildingData) {
            $building = Building::create($buildingData);
            $createdBuildings[] = $building;

            // Create rooms for each building
            $roomTypes = ['Lecture Hall', 'Lab', 'Seminar Room', 'Auditorium'];
            $capacities = [30, 50, 100, 200, 300];

            for ($floor = 1; $floor <= 3; $floor++) {
                for ($roomNum = 1; $roomNum <= 5; $roomNum++) {
                    $room = Room::create([
                        'building_id' => $building->id,
                        'room_number' => sprintf('%d%02d', $floor, $roomNum),
                        'type' => $this->faker->randomElement($roomTypes),
                        'capacity' => $this->faker->randomElement($capacities),
                    ]);
                    $allRooms[] = $room;
                }
            }
        }

        return ['buildings' => $createdBuildings, 'rooms' => $allRooms];
    }

    protected function createAcademicStructure()
    {
        $structure = [
            'Science & Technology' => [
                'departments' => [
                    'Computer Science' => ['BS Computer Science', 'MS Computer Science', 'PhD Computer Science'],
                    'Mathematics' => ['BS Mathematics', 'BS Applied Mathematics'],
                    'Physics' => ['BS Physics', 'MS Physics'],
                    'Chemistry' => ['BS Chemistry', 'MS Chemistry'],
                ],
            ],
            'Engineering' => [
                'departments' => [
                    'Electrical Engineering' => ['BS Electrical Engineering', 'MS Electrical Engineering'],
                    'Mechanical Engineering' => ['BS Mechanical Engineering', 'MS Mechanical Engineering'],
                    'Civil Engineering' => ['BS Civil Engineering'],
                ],
            ],
            'Business' => [
                'departments' => [
                    'Finance' => ['BS Finance', 'MBA Finance'],
                    'Marketing' => ['BS Marketing', 'MBA Marketing'],
                    'Management' => ['BS Business Administration', 'MBA'],
                ],
            ],
            'Liberal Arts' => [
                'departments' => [
                    'English' => ['BA English', 'MA English Literature'],
                    'History' => ['BA History', 'MA History'],
                    'Psychology' => ['BA Psychology', 'BS Psychology', 'MS Psychology'],
                ],
            ],
            'Medicine & Health' => [
                'departments' => [
                    'Pre-Medical Studies' => ['BS Pre-Medicine'],
                    'Nursing' => ['BSN Nursing', 'MSN Nursing'],
                    'Public Health' => ['BS Public Health', 'MPH'],
                ],
            ],
        ];

        $createdFaculties = [];
        $createdDepartments = [];
        $createdPrograms = [];

        foreach ($structure as $facultyName => $facultyData) {
            $faculty = Faculty::create([
                'name' => $facultyName,
                'code' => strtoupper(substr(str_replace(' ', '', $facultyName), 0, 3)),
                'description' => "The Faculty of $facultyName offers cutting-edge programs.",
            ]);
            $createdFaculties[] = $faculty;

            foreach ($facultyData['departments'] as $deptName => $programs) {
                $department = Department::create([
                    'faculty_id' => $faculty->id,
                    'name' => $deptName,
                    'code' => strtoupper(substr(str_replace(' ', '', $deptName), 0, 4)),
                    'description' => "Department of $deptName within $facultyName.",
                ]);
                $createdDepartments[] = $department;

                foreach ($programs as $programName) {
                    $degreeLevel = 'Bachelor';
                    if (str_contains($programName, 'MS') || str_contains($programName, 'MA') || str_contains($programName, 'MBA') || str_contains($programName, 'MPH') || str_contains($programName, 'MSN')) {
                        $degreeLevel = 'Master';
                    } elseif (str_contains($programName, 'PhD')) {
                        $degreeLevel = 'Doctorate';
                    }

                    $program = Program::create([
                        'department_id' => $department->id,
                        'name' => $programName,
                        'code' => strtoupper(substr(str_replace(' ', '', $programName), 0, 6)),
                        'description' => "A comprehensive $programName program.",
                        'degree_level' => $degreeLevel,
                        'duration_years' => $degreeLevel === 'Bachelor' ? 4 : ($degreeLevel === 'Master' ? 2 : 5),
                        'total_credits' => $degreeLevel === 'Bachelor' ? 120 : ($degreeLevel === 'Master' ? 36 : 72),
                        'cip_code' => sprintf('%02d.%04d', rand(1, 50), rand(1, 9999)),
                    ]);
                    $createdPrograms[] = $program;
                }
            }
        }

        return [
            'faculties' => $createdFaculties,
            'departments' => $createdDepartments,
            'programs' => $createdPrograms,
        ];
    }

    protected function createInstructors($departments, $facultyRole, $staffRole)
    {
        $instructors = [];
        $titles = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Adjunct Professor'];

        foreach ($departments as $department) {
            // Create 2-4 instructors per department
            $numInstructors = rand(2, 4);

            for ($i = 0; $i < $numInstructors; $i++) {
                $user = User::create([
                    'name' => $this->faker->name(),
                    'email' => $this->faker->unique()->safeEmail(),
                    'password' => 'password',
                    'email_verified_at' => now(),
                ]);

                $user->roles()->attach([$facultyRole->id, $staffRole->id]);

                $instructor = Staff::create([
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'job_title' => $this->faker->randomElement($titles),
                    'office_location' => $this->faker->buildingNumber() . ' Room ' . $this->faker->numberBetween(100, 500),
                    'office_hours' => 'MWF 2:00-4:00 PM',
                    'bio' => $this->faker->paragraph(3),
                ]);

                $instructors[] = $instructor;
            }
        }

        return $instructors;
    }

    protected function createCourses($departments)
    {
        $courses = [];
        $courseTemplates = [
            'Introduction to', 'Advanced', 'Fundamentals of', 'Topics in', 'Research in',
            'Principles of', 'Theory of', 'Applied', 'Special Topics:', 'Seminar:'
        ];

        $levels = [100, 200, 300, 400, 500, 600];

        foreach ($departments as $department) {
            // Create 5-10 courses per department
            $numCourses = rand(5, 10);

            for ($i = 0; $i < $numCourses; $i++) {
                $prefix = $this->faker->randomElement($courseTemplates);
                $suffix = $this->faker->words(rand(1, 3), true);
                $level = $this->faker->randomElement($levels);

                $course = Course::create([
                    'department_id' => $department->id,
                    'course_code' => strtoupper(substr($department->code, 0, 3)) . $level + $i,
                    'title' => $prefix . ' ' . ucwords($suffix),
                    'description' => $this->faker->paragraph(2),
                    'credits' => $this->faker->randomElement([1, 2, 3, 4]),
                    'course_level' => $level < 500 ? 'Undergraduate' : 'Graduate',
                ]);

                $courses[] = $course;
            }
        }

        return $courses;
    }

    protected function createCourseSections($courses, $terms, $instructors, $rooms)
    {
        $sections = [];
        $times = [
            ['08:00:00', '09:30:00'],
            ['10:00:00', '11:30:00'],
            ['12:00:00', '13:30:00'],
            ['14:00:00', '15:30:00'],
            ['16:00:00', '17:30:00'],
            ['18:00:00', '20:30:00'],
        ];

        $schedules = [
            ['Monday', 'Wednesday', 'Friday'],
            ['Tuesday', 'Thursday'],
            ['Monday', 'Wednesday'],
            ['Tuesday', 'Thursday'],
            ['Monday'],
            ['Wednesday'],
            ['Friday'],
        ];

        // Create sections for current and future terms
        foreach ([$terms['current'], $terms['future']] as $term) {
            // Create sections for 30-50% of courses each term
            $selectedCourses = $this->faker->randomElements($courses, rand(count($courses) * 0.3, count($courses) * 0.5));

            foreach ($selectedCourses as $course) {
                // Create 1-3 sections per course
                $numSections = rand(1, 3);

                for ($sectionNum = 1; $sectionNum <= $numSections; $sectionNum++) {
                    $timeSlot = $this->faker->randomElement($times);

                    $section = CourseSection::create([
                        'course_id' => $course->id,
                        'term_id' => $term->id,
                        'instructor_id' => $this->faker->randomElement($instructors)->id,
                        'room_id' => $this->faker->randomElement($rooms)->id,
                        'section_number' => sprintf('%03d', $sectionNum),
                        'capacity' => $this->faker->randomElement([20, 30, 50, 100, 150]),
                        'status' => 'open',
                        'schedule_days' => $this->faker->randomElement($schedules),
                        'start_time' => $timeSlot[0],
                        'end_time' => $timeSlot[1],
                    ]);

                    $sections[] = $section;
                }
            }
        }

        return $sections;
    }

    protected function createStudents($studentRole, $programs, $terms, $sections)
    {
        $studentData = [];
        $nationalities = ['American', 'Canadian', 'Mexican', 'British', 'French', 'German', 'Chinese', 'Korean', 'Japanese', 'Indian', 'Brazilian', 'Australian'];
        $applicationStatuses = ['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'];

        // Create 100 diverse students
        for ($i = 1; $i <= 100; $i++) {
            $user = User::create([
                'name' => $this->faker->name(),
                'email' => "student{$i}@demo.com",
                'password' => 'password',
                'email_verified_at' => $this->faker->optional(0.9)->dateTimeBetween('-30 days', 'now'),
            ]);

            $user->roles()->attach($studentRole);

            $student = Student::create([
                'user_id' => $user->id,
                'student_number' => sprintf('STU2025%03d', $i),
                'first_name' => $this->faker->firstName(),
                'last_name' => $this->faker->lastName(),
                'date_of_birth' => $this->faker->dateTimeBetween('-25 years', '-17 years'),
                'gender' => $this->faker->randomElement(['Male', 'Female', 'Other']),
                'nationality' => $this->faker->randomElement($nationalities),
                'address' => $this->faker->streetAddress(),
                'city' => $this->faker->city(),
                'state' => $this->faker->stateAbbr(),
                'postal_code' => $this->faker->postcode(),
                'country' => $this->faker->country(),
                'phone' => $this->faker->phoneNumber(),
                'emergency_contact_name' => $this->faker->name(),
                'emergency_contact_phone' => $this->faker->phoneNumber(),
                'enrollment_status' => $this->faker->randomElement(['prospective', 'enrolled', 'graduated', 'withdrawn']),
                'enrollment_date' => $this->faker->optional(0.6)->dateTimeBetween('-1 year', 'now'),
                'expected_graduation' => $this->faker->dateTimeBetween('+1 year', '+5 years'),
            ]);

            // Create academic records
            $numRecords = rand(1, 3);
            for ($r = 0; $r < $numRecords; $r++) {
                AcademicRecord::create([
                    'student_id' => $student->id,
                    'institution_name' => $this->faker->company() . ' ' . $this->faker->randomElement(['High School', 'College', 'University', 'Academy']),
                    'qualification_type' => $this->faker->randomElement(['High School Diploma', 'Associate Degree', 'Bachelor Degree', 'Transfer Credits']),
                    'start_date' => $this->faker->dateTimeBetween('-6 years', '-2 years'),
                    'end_date' => $this->faker->dateTimeBetween('-2 years', 'now'),
                    'gpa' => $this->faker->randomFloat(2, 2.5, 4.0),
                    'verified' => $this->faker->boolean(80),
                ]);
            }

            // Create admission applications (70% of students)
            if ($this->faker->boolean(70)) {
                $app = AdmissionApplication::create([
                    'student_id' => $student->id,
                    'term_id' => $this->faker->randomElement([$terms['current']->id, $terms['future']->id]),
                    'status' => $this->faker->randomElement($applicationStatuses),
                    'application_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
                    'decision_date' => $this->faker->optional(0.5)->dateTimeBetween('-1 month', 'now'),
                    'decision_status' => $this->faker->optional(0.5)->randomElement(['accepted', 'rejected', 'waitlisted']),
                    'comments' => $this->faker->optional(0.3)->sentence(),
                ]);

                // Add program choices
                $numChoices = rand(1, 3);
                $selectedPrograms = $this->faker->randomElements($programs, $numChoices);
                foreach ($selectedPrograms as $index => $program) {
                    ProgramChoice::create([
                        'application_id' => $app->id,
                        'program_id' => $program->id,
                        'preference_order' => $index + 1,
                        'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
                    ]);
                }

                // Upload documents (60% of applicants)
                if ($this->faker->boolean(60)) {
                    $docTypes = ['transcript', 'personal_statement', 'recommendation_letter', 'test_scores'];
                    foreach ($this->faker->randomElements($docTypes, rand(1, 4)) as $docType) {
                        Document::create([
                            'student_id' => $student->id,
                            'document_type' => $docType,
                            'file_name' => $docType . '_' . $student->student_number . '.pdf',
                            'file_path' => 'documents/' . $student->student_number . '/' . $docType . '.pdf',
                            'file_size' => rand(100000, 5000000),
                            'mime_type' => 'application/pdf',
                            'uploaded_at' => $this->faker->dateTimeBetween('-2 months', 'now'),
                            'verified' => $this->faker->boolean(70),
                            'verified_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 month', 'now'),
                            'verified_by' => $this->faker->optional(0.7)->numberBetween(1, 5),
                        ]);
                    }
                }
            }

            // Create enrollments for accepted students (40% of all students)
            if ($this->faker->boolean(40) && count($sections) > 0) {
                $numEnrollments = rand(1, 6);
                $selectedSections = $this->faker->randomElements($sections, min($numEnrollments, count($sections)));

                foreach ($selectedSections as $section) {
                    // Check if section is full
                    $currentEnrollments = Enrollment::where('course_section_id', $section->id)
                        ->where('status', 'enrolled')
                        ->count();

                    $status = $currentEnrollments >= $section->capacity ? 'waitlisted' : 'enrolled';

                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_section_id' => $section->id,
                        'status' => $status,
                        'enrollment_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
                        'grade' => $status === 'enrolled' && $this->faker->boolean(30) ?
                            $this->faker->randomElement(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']) : null,
                    ]);
                }
            }

            $studentData[] = [
                'email' => $user->email,
                'name' => $user->name,
                'status' => $student->enrollment_status,
            ];
        }

        return $studentData;
    }

    protected function displaySummary($students)
    {
        $this->command->info('');
        $this->command->info('📊 SEEDING SUMMARY');
        $this->command->info('==================');
        $this->command->info('✅ God Mode Account: god@admin.com / godmode123');
        $this->command->info('');
        $this->command->info('📚 Academic Structure:');
        $this->command->info('  • 5 Faculties');
        $this->command->info('  • 15+ Departments');
        $this->command->info('  • 40+ Programs');
        $this->command->info('  • 100+ Courses');
        $this->command->info('  • 200+ Course Sections');
        $this->command->info('');
        $this->command->info('👥 People:');
        $this->command->info('  • 100 Students (student1@demo.com - student100@demo.com)');
        $this->command->info('  • 30+ Faculty/Staff Members');
        $this->command->info('  • All passwords: "password"');
        $this->command->info('');
        $this->command->info('📝 Data:');
        $this->command->info('  • 70+ Admission Applications');
        $this->command->info('  • 200+ Academic Records');
        $this->command->info('  • 400+ Enrollments');
        $this->command->info('  • 150+ Documents');
        $this->command->info('');
        $this->command->info('🎯 Quick Test Accounts:');
        $this->command->info('  • Admin: god@admin.com / godmode123');
        $this->command->info('  • Students: student1@demo.com to student100@demo.com / password');
        $this->command->info('');
    }
}