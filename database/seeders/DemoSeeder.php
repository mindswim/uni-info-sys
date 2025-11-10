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
use Carbon\Carbon;

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

        // STUDENT 2: David Park - Accepted and Enrolled
        $david = User::create([
            'name' => 'David Park',
            'email' => 'david@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $david->roles()->attach($studentRole);

        $davidStudent = Student::create([
            'user_id' => $david->id,
            'student_number' => 'STU2025002',
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
        ]);

        // David's application - accepted
        $davidApp = AdmissionApplication::create([
            'student_id' => $davidStudent->id,
            'term_id' => $currentTerm->id,
            'status' => 'accepted',
            'application_date' => now()->subDays(30),
            'decision_date' => now()->subDays(20),
            'decision_status' => 'accepted',
            'comments' => 'Strong background in mathematics and programming competitions',
        ]);

        ProgramChoice::create([
            'application_id' => $davidApp->id,
            'program_id' => $csProgram->id,
            'preference_order' => 1,
            'status' => 'accepted',
        ]);

        // David is enrolled in AI course (taking 1 of 2 spots)
        Enrollment::create([
            'student_id' => $davidStudent->id,
            'course_section_id' => $aiSection->id,
            'status' => 'enrolled',
            'enrollment_date' => now()->subDays(10),
        ]);

        // Also enrolled in Data Structures
        Enrollment::create([
            'student_id' => $davidStudent->id,
            'course_section_id' => $dsSection->id,
            'status' => 'enrolled',
            'enrollment_date' => now()->subDays(10),
        ]);

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

        // Create another student to fill the second AI spot
        $fillerUser = User::create([
            'name' => 'Alex Chen',
            'email' => 'alex@demo.com',
            'password' => 'password', // Don't bcrypt - User model handles hashing
            'email_verified_at' => now(),
        ]);
        $fillerUser->roles()->attach($studentRole);

        $fillerStudent = Student::factory()->create([
            'user_id' => $fillerUser->id,
            'student_number' => 'STU2025004',
            'major_program_id' => $csProgram->id,
        ]);

        // Fill the second AI spot
        Enrollment::create([
            'student_id' => $fillerStudent->id,
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

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('');
        $this->command->info('Demo Accounts:');
        $this->command->info('Admin: admin@demo.com / password');
        $this->command->info('Student 1 (Just Applied): maria@demo.com / password');
        $this->command->info('Student 2 (Enrolled): david@demo.com / password');
        $this->command->info('Student 3 (Waitlisted): sophie@demo.com / password');
        $this->command->info('');
        $this->command->info('Demo Scenario:');
        $this->command->info('- Maria: Just submitted application from Mexico');
        $this->command->info('- David: Accepted student from Korea, enrolled in 2 courses');
        $this->command->info('- Sophie: Local student, waitlisted for popular AI course');
        $this->command->info('- AI Course: Full (2/2 capacity) with Sophie on waitlist');
    }
}
