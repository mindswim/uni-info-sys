<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Program;
use App\Models\Course;
use App\Models\Term;
use App\Models\Building;
use App\Models\Room;
use App\Models\Staff;
use App\Models\CourseSection;
use App\Models\Student;
use App\Models\AcademicRecord;
use App\Models\Document;
use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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
        
        // Step 6: Create students and users  
        $this->seedStudents();
        
        // Step 7: Create applications and enrollments
        $this->seedApplicationsAndEnrollments();
        
        // Step 8: Create demo data
        $this->call([
            DemoSeeder::class,
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
                'capacity' => 100
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
        
        foreach ($courses as $courseData) {
            Course::create(array_merge($courseData, [
                'description' => 'A comprehensive course covering fundamental concepts and practical applications.',
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
                'office_location' => 'Building ' . fake()->buildingNumber() . ', Room ' . fake()->randomNumber(3),
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
                    'room_number' => (string)$i,
                    'capacity' => rand(20, 50),
                    'type' => 'classroom'
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
        
        foreach ($terms as $term) {
            foreach ($courses as $course) {
                // Create 1-2 sections per course per term
                $sectionCount = rand(1, 2);
                for ($i = 0; $i < $sectionCount; $i++) {
                    CourseSection::create([
                        'course_id' => $course->id,
                        'term_id' => $term->id,
                        'instructor_id' => $staff->random()->id,
                        'room_id' => $rooms->random()->id,
                        'section_number' => str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                        'capacity' => rand(20, 40),
                        'status' => 'open',
                        'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
                        'start_time' => '10:00:00',
                        'end_time' => '11:00:00',
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
                'student_number' => 'STU' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
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
                'institution_name' => fake()->company() . ' High School',
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
                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_section_id' => $section->id,
                        'status' => 'enrolled',
                        'enrollment_date' => fake()->dateTimeBetween('-3 months', 'now'),
                        'grade' => null,
                    ]);
                }
            }
        }
        
        // Create some full sections with waitlists
        $fullSections = $courseSections->take(5);
        foreach ($fullSections as $section) {
            // Fill to capacity
            $availableStudents = Student::whereHas('admissionApplications', function($q) {
                $q->where('status', 'accepted');
            })->whereDoesntHave('enrollments', function($q) use ($section) {
                $q->where('course_section_id', $section->id);
            })->take($section->capacity)->get();
            
            foreach ($availableStudents as $student) {
                Enrollment::create([
                    'student_id' => $student->id,
                    'course_section_id' => $section->id,
                    'status' => 'enrolled',
                    'enrollment_date' => fake()->dateTimeBetween('-3 months', 'now'),
        ]);
            }
            
            // Add waitlist students
            $waitlistStudents = Student::whereHas('admissionApplications', function($q) {
                $q->where('status', 'accepted');
            })->whereDoesntHave('enrollments', function($q) use ($section) {
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
}
