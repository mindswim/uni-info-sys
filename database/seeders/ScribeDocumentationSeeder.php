<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Course;
use App\Models\Term;
use App\Models\Building;
use App\Models\Room;
use App\Models\User;
use App\Models\Staff;
use App\Models\Student;
use App\Models\CourseSection;
use App\Models\Enrollment;

class ScribeDocumentationSeeder extends Seeder
{
    /**
     * Run the database seeds for Scribe documentation generation.
     */
    public function run(): void
    {
        // Create basic academic hierarchy
        $faculty = Faculty::firstOrCreate(['name' => 'Faculty of Engineering']);
        $department = Department::firstOrCreate([
            'name' => 'Computer Science',
            'faculty_id' => $faculty->id
        ]);
        
        // Create a course
        $course = Course::firstOrCreate([
            'course_code' => 'CS101',
            'title' => 'Introduction to Programming',
            'description' => 'Basic programming concepts',
            'credits' => 3,
            'department_id' => $department->id
        ]);
        
        // Create a term
        $term = Term::firstOrCreate([
            'name' => 'Fall 2024',
            'academic_year' => 2024,
            'semester' => 'Fall',
            'start_date' => '2024-09-01',
            'end_date' => '2024-12-15'
        ]);
        
        // Create infrastructure
        $building = Building::firstOrCreate([
            'name' => 'Science Building',
            'address' => '123 University Ave'
        ]);
        
        $room = Room::firstOrCreate([
            'building_id' => $building->id,
            'room_number' => '101',
            'capacity' => 50,
            'type' => 'classroom'
        ]);
        
        // Create users and staff
        $instructorUser = User::firstOrCreate([
            'email' => 'instructor@university.edu'
        ], [
            'name' => 'Dr. John Smith',
            'password' => bcrypt('password')
        ]);
        
        $staff = Staff::firstOrCreate([
            'user_id' => $instructorUser->id,
            'department_id' => $department->id,
            'job_title' => 'Professor',
            'office_location' => 'Science Building 201',
            'phone_number' => '555-0123',
            'hire_date' => '2020-01-01'
        ]);
        
        // Create a student
        $studentUser = User::firstOrCreate([
            'email' => 'student@university.edu'
        ], [
            'name' => 'Jane Doe',
            'password' => bcrypt('password')
        ]);
        
        $student = Student::firstOrCreate([
            'user_id' => $studentUser->id,
            'student_number' => 'STU001',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'date_of_birth' => '2000-01-01',
            'gender' => 'Female',
            'nationality' => 'American',
            'address' => '456 Student St',
            'city' => 'University City',
            'state' => 'State',
            'postal_code' => '12345',
            'country' => 'USA',
            'phone' => '555-0456',
            'emergency_contact_name' => 'John Doe',
            'emergency_contact_phone' => '555-0789'
        ]);
        
        // Create a course section
        $courseSection = CourseSection::firstOrCreate([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'section_number' => '001'
        ], [
            'instructor_id' => $staff->id,
            'room_id' => $room->id,
            'capacity' => 30,
            'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
            'start_time' => '10:00:00',
            'end_time' => '11:00:00'
        ]);
        
        // Create an enrollment
        Enrollment::firstOrCreate([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id
        ], [
            'status' => 'enrolled'
        ]);
    }
}
