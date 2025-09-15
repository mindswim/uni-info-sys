<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Term;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Role;
use App\Models\Room;
use App\Models\Building;
use Faker\Factory as Faker;
use Carbon\Carbon;

class CourseSectionsAndEnrollmentSeeder extends Seeder
{
    /**
     * Create realistic course sections with proper scheduling and student enrollments
     * Follows real university patterns for class times, capacities, and enrollment distributions
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // First, create realistic student profiles
        $this->createDiverseStudents($faker);
        
        // Create course sections for current and next terms
        $currentTerm = $this->getCurrentTerm();
        $nextTerm = $this->getNextTerm();
        
        $this->createCourseSections($currentTerm, $faker);
        $this->createCourseSections($nextTerm, $faker);
        
        // Generate realistic student enrollments
        $this->createStudentEnrollments($currentTerm, $faker);
        
        $this->command->info('Created course sections and realistic student enrollment patterns');
    }

    private function createDiverseStudents($faker): void
    {
        $studentRole = Role::where('name', 'student')->first();
        if (!$studentRole) {
            $studentRole = Role::create(['name' => 'student', 'description' => 'Student users']);
        }

        // Create diverse student profiles with realistic names and backgrounds
        $studentProfiles = [
            // Computer Science Students (Various Years)
            ['Maria', 'Rodriguez', 'Mexico', 'maria.rodriguez@student.edu', 'first_year'],
            ['David', 'Park', 'South Korea', 'david.park@student.edu', 'second_year'],
            ['Sarah', 'Johnson', 'United States', 'sarah.johnson@student.edu', 'third_year'],
            ['Ahmed', 'Al-Hassan', 'Egypt', 'ahmed.alhassan@student.edu', 'fourth_year'],
            ['Li', 'Zhang', 'China', 'li.zhang@student.edu', 'graduate'],
            ['Priya', 'Patel', 'India', 'priya.patel@student.edu', 'second_year'],
            ['James', 'Thompson', 'Canada', 'james.thompson@student.edu', 'third_year'],
            ['Fatima', 'Benali', 'Morocco', 'fatima.benali@student.edu', 'first_year'],
            
            // Business Students
            ['Sophie', 'Turner', 'United Kingdom', 'sophie.turner@student.edu', 'second_year'],
            ['Carlos', 'Silva', 'Brazil', 'carlos.silva@student.edu', 'third_year'],
            ['Yuki', 'Tanaka', 'Japan', 'yuki.tanaka@student.edu', 'first_year'],
            ['Emma', 'Wilson', 'Australia', 'emma.wilson@student.edu', 'fourth_year'],
            
            // Mathematics Students
            ['Alexander', 'Petrov', 'Russia', 'alexander.petrov@student.edu', 'graduate'],
            ['Isabella', 'Garcia', 'Spain', 'isabella.garcia@student.edu', 'second_year'],
            ['Michael', 'O\'Connor', 'Ireland', 'michael.oconnor@student.edu', 'third_year'],
            
            // Physics Students
            ['Anna', 'Kowalski', 'Poland', 'anna.kowalski@student.edu', 'graduate'],
            ['Omar', 'Khalil', 'Jordan', 'omar.khalil@student.edu', 'second_year'],
            ['Jennifer', 'Lee', 'United States', 'jennifer.lee@student.edu', 'fourth_year'],
            
            // Engineering Students
            ['Hans', 'Mueller', 'Germany', 'hans.mueller@student.edu', 'third_year'],
            ['Aisha', 'Okafor', 'Nigeria', 'aisha.okafor@student.edu', 'second_year'],
            ['Diego', 'Morales', 'Colombia', 'diego.morales@student.edu', 'first_year'],
            
            // Additional diverse students
            ['Raj', 'Kumar', 'India', 'raj.kumar@student.edu', 'fourth_year'],
            ['Grace', 'Kim', 'South Korea', 'grace.kim@student.edu', 'first_year'],
            ['Nicolas', 'Dubois', 'France', 'nicolas.dubois@student.edu', 'graduate'],
            ['Zara', 'Hassan', 'Pakistan', 'zara.hassan@student.edu', 'second_year'],
        ];

        foreach ($studentProfiles as $profile) {
            [$firstName, $lastName, $country, $email, $year] = $profile;
            
            // Skip if user already exists
            if (User::where('email', $email)->exists()) {
                continue;
            }
            
            // Create user account
            $user = User::create([
                'name' => "$firstName $lastName",
                'email' => $email,
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
            
            $user->roles()->attach($studentRole);
            
            // Create student profile
            Student::create([
                'user_id' => $user->id,
                'student_number' => 'STU' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'date_of_birth' => $faker->dateTimeBetween('-25 years', '-18 years'),
                'gender' => $faker->randomElement(['Male', 'Female', 'Other']),
                'nationality' => $country,
                'address' => $faker->streetAddress,
                'city' => $faker->city,
                'state' => $faker->state,
                'postal_code' => $faker->postcode,
                'country' => $country,
                'phone' => $faker->phoneNumber,
                'emergency_contact_name' => $faker->name,
                'emergency_contact_phone' => $faker->phoneNumber,
            ]);
        }
    }

    private function getCurrentTerm(): Term
    {
        $currentTerm = Term::where('name', 'Fall 2025')->first();
        if (!$currentTerm) {
            $currentTerm = Term::create([
                'name' => 'Fall 2025',
                'academic_year' => 2025,
                'semester' => 'Fall',
                'start_date' => '2025-08-25',
                'end_date' => '2025-12-15',
                'add_drop_deadline' => '2025-09-10',
            ]);
        }
        return $currentTerm;
    }

    private function getNextTerm(): Term
    {
        $nextTerm = Term::where('name', 'Spring 2026')->first();
        if (!$nextTerm) {
            $nextTerm = Term::create([
                'name' => 'Spring 2026',
                'academic_year' => 2026,
                'semester' => 'Spring',
                'start_date' => '2026-01-20',
                'end_date' => '2026-05-15',
                'add_drop_deadline' => '2026-02-05',
            ]);
        }
        return $nextTerm;
    }

    private function createCourseSections(Term $term, $faker): void
    {
        // Get courses that should be offered this term
        $courses = Course::with('department')->get();
        
        // Realistic scheduling patterns
        $timeSlots = [
            // Morning slots (preferred for intro courses)
            '08:00-09:30', '09:00-10:30', '10:00-11:30', '11:00-12:30',
            // Afternoon slots  
            '12:00-13:30', '13:00-14:30', '14:00-15:30', '15:00-16:30', '16:00-17:30',
            // Evening slots (for working students)
            '18:00-19:30', '19:00-20:30'
        ];
        
        $dayPatterns = [
            'MWF', 'TTh', 'MW', 'WF', 'Th'  // Most common university patterns
        ];

        foreach ($courses as $course) {
            // Number of sections based on course level and demand
            $sectionCount = $this->getSectionCount($course);
            
            for ($i = 1; $i <= $sectionCount; $i++) {
                $sectionCode = str_pad($i, 3, '0', STR_PAD_LEFT);
                
                // Assign faculty based on specialization
                $instructor = $this->assignInstructor($course);
                
                // Generate realistic schedule
                $timeSlot = $faker->randomElement($timeSlots);
                $dayPattern = $faker->randomElement($dayPatterns);
                $schedule = "$dayPattern $timeSlot";
                
                // Realistic capacity based on course type
                $capacity = $this->getCourseCapacity($course, $i);
                
                // Get appropriate room
                $room = $this->getAppropriateRoom($course, $capacity);
                
                // Parse schedule into separate components
                [$days, $timeRange] = explode(' ', $schedule);
                [$startTime, $endTime] = explode('-', $timeRange);
                
                // Convert day pattern to JSON array
                $dayArray = [];
                for ($d = 0; $d < strlen($days); $d++) {
                    $dayArray[] = $days[$d];
                }
                
                // Check if section already exists
                if (CourseSection::where('course_id', $course->id)
                    ->where('term_id', $term->id)
                    ->where('section_number', $sectionCode)
                    ->exists()) {
                    continue; // Skip this section if it already exists
                }
                
                CourseSection::create([
                    'course_id' => $course->id,
                    'term_id' => $term->id,
                    'section_number' => $sectionCode,
                    'instructor_id' => $instructor->id ?? null,
                    'room_id' => $room->id ?? null,
                    'capacity' => $capacity,
                    'status' => 'open',
                    'schedule_days' => json_encode($dayArray),
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                ]);
            }
        }
    }

    private function getSectionCount(Course $course): int
    {
        // Lower division courses typically have more sections
        if ($course->level === 'lower_division') {
            return rand(2, 4); // 2-4 sections for intro courses
        } elseif ($course->level === 'upper_division') {
            return rand(1, 2); // 1-2 sections for advanced courses
        } else { // graduate
            return 1; // Usually 1 section for graduate courses
        }
    }

    private function assignInstructor(Course $course)
    {
        // Find faculty in the same department with relevant specialization
        $faculty = Staff::whereHas('user', function($query) {
            $query->whereHas('roles', function($q) {
                $q->where('name', 'faculty');
            });
        })
        ->where('department_id', $course->department_id)
        ->get();

        if ($faculty->isEmpty()) {
            // Fallback to any faculty if none in department
            $faculty = Staff::whereHas('user', function($query) {
                $query->whereHas('roles', function($q) {
                    $q->where('name', 'faculty');
                });
            })->get();
        }

        return $faculty->random();
    }

    private function getCourseCapacity(Course $course, int $sectionNumber): int
    {
        // Realistic capacity based on course level and section number
        if ($course->level === 'lower_division') {
            return $sectionNumber === 1 ? rand(100, 200) : rand(50, 100); // First section larger
        } elseif ($course->level === 'upper_division') {
            return rand(25, 50);
        } else { // graduate
            return rand(12, 25);
        }
    }

    private function getAppropriateRoom(Course $course, int $capacity)
    {
        // Create some rooms if they don't exist
        $building = Building::firstOrCreate(['name' => 'Academic Building'], [
            'address' => '123 University Ave'
        ]);

        // Try to find existing room or create new one
        $room = Room::where('capacity', '>=', $capacity)
                   ->where('building_id', $building->id)
                   ->first();
                   
        if (!$room) {
            $roomNumber = 'Room ' . rand(100, 999);
            $roomType = $capacity > 50 ? 'lecture_hall' : 'classroom';
            
            $room = Room::create([
                'building_id' => $building->id,
                'room_number' => $roomNumber,
                'capacity' => $capacity + rand(5, 20), // Room slightly bigger than needed
                'type' => $roomType,
            ]);
        }

        return $room;
    }

    private function createStudentEnrollments(Term $term, $faker): void
    {
        $students = Student::all();
        $sections = CourseSection::where('term_id', $term->id)
                                ->with('course')
                                ->get();

        foreach ($students as $student) {
            // Each student enrolls in 3-5 courses (12-20 credit hours)
            $courseLoad = rand(3, 5);
            $enrolledSections = collect();
            
            // Prioritize courses by student level and prerequisites
            $availableSections = $this->getAppropriateCoursesForStudent($student, $sections);
            
            for ($i = 0; $i < $courseLoad && $availableSections->count() > 0; $i++) {
                $section = $availableSections->random();
                
                // Check if student can enroll (capacity, prerequisites, schedule conflicts)
                if ($this->canStudentEnroll($student, $section, $enrolledSections)) {
                    // Check if enrollment already exists
                    if (Enrollment::where('student_id', $student->id)
                        ->where('course_section_id', $section->id)
                        ->exists()) {
                        continue; // Skip if already enrolled
                    }
                    
                    $enrolledCount = $section->enrollments()->where('status', 'enrolled')->count();
                    $status = $enrolledCount >= $section->capacity ? 'waitlisted' : 'enrolled';
                    
                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_section_id' => $section->id,
                        'status' => $status,
                        'enrollment_date' => $faker->dateTimeBetween('-2 months', 'now'),
                        'grade' => null, // Current term, no grades yet
                    ]);
                    
                    // Enrollment count is calculated dynamically via relationship
                    
                    $enrolledSections->push($section);
                }
                
                // Remove this section to avoid conflicts
                $availableSections = $availableSections->reject(function($s) use ($section) {
                    return $s->id === $section->id || 
                           $s->course_id === $section->course_id; // Don't enroll in multiple sections of same course
                });
            }
        }
        
        // Generate some completed enrollments from previous terms for transcript history
        $this->createHistoricalEnrollments($faker);
    }

    private function getAppropriateCoursesForStudent(Student $student, $sections)
    {
        // Filter courses appropriate for student level
        // This is simplified - in reality you'd check completed prerequisites, etc.
        return $sections->filter(function($section) use ($student) {
            $course = $section->course;
            
            // New students take more lower division courses
            if (str_contains($student->student_number, 'STU1') || str_contains($student->student_number, 'STU2')) {
                return $course->level === 'lower_division';
            }
            
            // Advanced students take upper division
            return in_array($course->level, ['lower_division', 'upper_division']);
        });
    }

    private function canStudentEnroll(Student $student, CourseSection $section, $enrolledSections): bool
    {
        // Check capacity (allow waitlisting)
        $enrolledCount = $section->enrollments()->where('status', 'enrolled')->count();
        if ($enrolledCount >= ($section->capacity * 1.2)) { // 20% over capacity for waitlist
            return false;
        }
        
        // Check schedule conflicts using separate schedule fields
        foreach ($enrolledSections as $enrolledSection) {
            if ($this->hasScheduleConflictFromFields($section, $enrolledSection)) {
                return false;
            }
        }
        
        return true;
    }

    private function hasScheduleConflictFromFields($section1, $section2): bool
    {
        // Get schedule days as arrays
        $days1 = json_decode($section1->schedule_days, true) ?? [];
        $days2 = json_decode($section2->schedule_days, true) ?? [];
        
        // Check for day overlap
        if (empty(array_intersect($days1, $days2))) {
            return false; // No overlapping days
        }
        
        // Check for time overlap
        $start1 = strtotime($section1->start_time);
        $end1 = strtotime($section1->end_time);
        $start2 = strtotime($section2->start_time);
        $end2 = strtotime($section2->end_time);
        
        // Overlaps if one starts before the other ends
        return !($end1 <= $start2 || $end2 <= $start1);
    }

    private function createHistoricalEnrollments($faker): void
    {
        // Create some completed enrollments for transcript history
        $students = Student::limit(15)->get(); // Subset of students
        $completedGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
        $gradeWeights = [5, 15, 10, 15, 20, 10, 10, 8, 4, 2, 1]; // Realistic grade distribution
        
        // Create past term
        $pastTerm = Term::firstOrCreate(['name' => 'Spring 2025'], [
            'academic_year' => 2025,
            'semester' => 'Spring',
            'start_date' => '2025-01-20',
            'end_date' => '2025-05-15',
            'add_drop_deadline' => '2025-02-05',
        ]);
        
        // Create some basic course sections for the past term
        $basicCourses = Course::where('level', 'lower_division')->take(10)->get();
        
        foreach ($basicCourses as $course) {
            // Check if historical section already exists
            if (CourseSection::where('course_id', $course->id)
                ->where('term_id', $pastTerm->id)
                ->where('section_number', '001')
                ->exists()) {
                continue; // Skip if already exists
            }
            
            $section = CourseSection::create([
                'course_id' => $course->id,
                'term_id' => $pastTerm->id,
                'section_number' => '001',
                'instructor_id' => $this->assignInstructor($course)->id,
                'capacity' => 100,
                'schedule_days' => json_encode(['M', 'W', 'F']),
                'start_time' => '10:00',
                'end_time' => '11:30',
                'status' => 'open',
            ]);
            
            // Enroll some students with completed grades
            foreach ($students->take(rand(5, 12)) as $student) {
                $grade = $faker->randomElement($completedGrades, $gradeWeights);
                
                Enrollment::create([
                    'student_id' => $student->id,
                    'course_section_id' => $section->id,
                    'status' => 'enrolled',
                    'enrollment_date' => $faker->dateTimeBetween('2025-01-20', '2025-02-05'),
                    'grade' => $grade,
                ]);
            }
        }
    }
}