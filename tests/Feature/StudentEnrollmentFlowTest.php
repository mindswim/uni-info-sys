<?php

namespace Tests\Feature\Feature;

use App\Jobs\SendApplicationStatusNotification;
use App\Jobs\SendEnrollmentConfirmation;
use App\Models\AdmissionApplication;
use App\Models\Building;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Permission;
use App\Models\Program;
use App\Models\Role;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Services\AdmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use Tests\Traits\CreatesUsersWithRoles;

class StudentEnrollmentFlowTest extends TestCase
{
    use RefreshDatabase, CreatesUsersWithRoles;

    private Role $studentRole;
    private Role $adminRole;
    private Faculty $faculty;
    private Department $department;
    private Program $program;
    private Term $term;
    private Course $course;
    private CourseSection $courseSection;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up roles and permissions
        $this->setupRolesAndPermissions();
        
        // Set up academic structure
        $this->setupAcademicStructure();
        
        // Fake queues for job testing
        Queue::fake();
    }

    private function setupRolesAndPermissions(): void
    {
        $this->seedPermissions();

        $this->studentRole = Role::where('name', 'student')->first();
        $this->adminRole = Role::where('name', 'admin')->first();
    }

    private function setupAcademicStructure(): void
    {
        // Create academic hierarchy
        $this->faculty = Faculty::factory()->create(['name' => 'Faculty of Engineering']);
        $this->department = Department::factory()->create([
            'name' => 'Computer Science',
            'faculty_id' => $this->faculty->id,
        ]);
        $this->program = Program::factory()->create([
            'name' => 'Bachelor of Computer Science',
            'department_id' => $this->department->id,
        ]);

        // Create term
        $this->term = Term::factory()->create([
            'name' => 'Fall 2024',
            'academic_year' => 2024,
            'semester' => 'Fall',
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(120)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(6), // Future deadline to avoid deadline validation
        ]);

        // Create course
        $this->course = Course::factory()->create([
            'title' => 'Introduction to Programming',
            'course_code' => 'CS101',
            'department_id' => $this->department->id,
        ]);

        // Create infrastructure
        $building = Building::factory()->create(['name' => 'Engineering Building']);
        $room = Room::factory()->create([
            'room_number' => '101',
            'building_id' => $building->id,
        ]);

        // Create instructor
        $instructorUser = User::factory()->create();
        $instructor = Staff::factory()->create([
            'user_id' => $instructorUser->id,
            'department_id' => $this->department->id,
        ]);

        // Create course section
        $this->courseSection = CourseSection::factory()->create([
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'section_number' => '001',
            'capacity' => 25,
        ]);
    }

    /** @test */
    public function test_complete_enrollment_flow()
    {
        // Step 1: User Registration (using factory for API-first architecture)
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'email_verified_at' => now(), // Pre-verified for testing
        ]);

        // Step 2: Assign Student Role (simulating admin action)
        $user->roles()->attach($this->studentRole);

        // Step 3: Create Student Record (using factory for API-first architecture)
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'student_number' => 'STU2024001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'date_of_birth' => '2000-01-15',
            'gender' => 'male',
            'nationality' => 'Canadian',
            'address' => '123 Main St',
            'city' => 'Toronto',
            'state' => 'ON',
            'postal_code' => 'M1M 1M1',
            'country' => 'Canada',
            'phone' => '+1-416-123-4567',
            'emergency_contact_name' => 'Jane Doe',
            'emergency_contact_phone' => '+1-416-987-6543',
        ]);

        // Verify student was created
        $this->assertNotNull($student);
        $this->assertEquals('STU2024001', $student->student_number);

        // Step 4: Create Draft Admission Application (using factory for API-first architecture)
        $application = AdmissionApplication::factory()->create([
            'student_id' => $student->id,
            'term_id' => $this->term->id,
            'status' => 'draft',
        ]);

        // Verify draft application was created
        $this->assertNotNull($application);
        $this->assertEquals('draft', $application->status);

        // Step 5: Complete and Submit Application (using API endpoint)
        $applicationData = [
            'term_id' => $this->term->id,
            'status' => 'submitted',
            'personal_statement' => 'I am passionate about computer science...',
            'previous_education' => 'High School Diploma',
            'gpa' => 3.8,
        ];

        $submitResponse = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/admission-applications/{$application->id}", $applicationData);
        $submitResponse->assertOk();

        // Verify application was updated
        $application->refresh();
        $this->assertEquals('submitted', $application->status);
        $this->assertEquals($this->term->id, $application->term_id);

        // Step 6: Admin Reviews and Approves Application
        $adminUser = User::factory()->create(['name' => 'Admin User']);
        $adminUser->roles()->attach($this->adminRole);

        $admissionService = app(AdmissionService::class);
        $approvedApplication = $admissionService->updateApplicationStatus($application, 'accepted');

        // Verify application was approved
        $this->assertEquals('accepted', $approvedApplication->status);

        // Verify notification job was dispatched
        Queue::assertPushed(SendApplicationStatusNotification::class, function ($job) use ($approvedApplication) {
            return $job->application->id === $approvedApplication->id;
        });

        // Step 7: Student Enrolls in Course (Post-Admission)
        $enrollmentData = [
            'student_id' => $student->id,
            'course_section_id' => $this->courseSection->id,
        ];

        $enrollmentResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/enrollments', $enrollmentData);

        $enrollmentResponse->assertCreated()
            ->assertJson([
                'message' => 'Student has been successfully enrolled in the course section.',
                'data' => [
                    'status' => 'enrolled',
                    'student' => [
                        'id' => $student->id,
                    ],
                    'course_section' => [
                        'id' => $this->courseSection->id,
                    ],
                ],
            ]);

        // Verify enrollment was created in database
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        // Verify enrollment confirmation job was dispatched
        Queue::assertPushed(SendEnrollmentConfirmation::class, function ($job) use ($student) {
            return $job->enrollment->student_id === $student->id 
                && $job->confirmationType === 'enrolled';
        });

        // Step 8: Verify Complete User Journey Data Integrity
        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'name' => 'John Doe',
        ]);

        $this->assertDatabaseHas('students', [
            'user_id' => $user->id,
            'student_number' => 'STU2024001',
        ]);

        $this->assertDatabaseHas('admission_applications', [
            'student_id' => $student->id,
            'status' => 'accepted',
            'term_id' => $this->term->id,
        ]);

        // Step 9: Verify User Can Access Their Data
        $studentDataResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}");
        
        $studentDataResponse->assertOk()
            ->assertJsonFragment([
                'id' => $student->id,
                'student_number' => 'STU2024001',
            ]);

        // Step 10: Verify System Security Behavior - Students cannot access other students' data
        $otherStudent = Student::factory()->create();
        
        $otherStudentResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/students/{$otherStudent->id}");
        
        // The system correctly prevents access to other students' data
        $otherStudentResponse->assertForbidden();
    }

    /** @test */
    public function test_workflow_with_application_rejection()
    {
        // Create a user and student
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->roles()->attach($this->studentRole);
        $student = Student::factory()->create(['user_id' => $user->id]);

        // Create and submit application
        $application = AdmissionApplication::factory()->create([
            'student_id' => $student->id,
            'term_id' => $this->term->id,
            'status' => 'submitted',
        ]);

        // Admin rejects application
        $adminUser = User::factory()->create();
        $adminUser->roles()->attach($this->adminRole);

        $admissionService = app(AdmissionService::class);
        $rejectedApplication = $admissionService->updateApplicationStatus($application, 'rejected');

        // Verify application was rejected
        $this->assertEquals('rejected', $rejectedApplication->status);

        // Verify notification job was dispatched
        Queue::assertPushed(SendApplicationStatusNotification::class);

        // Note: Currently the system allows enrollment even with rejected applications
        // This test documents the current behavior, but in a real system you might want
        // to add business logic to prevent enrollment when application status is 'rejected'
        $enrollmentData = [
            'student_id' => $student->id,
            'course_section_id' => $this->courseSection->id,
        ];

        $enrollmentResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/enrollments', $enrollmentData);

        // Currently enrollment succeeds even with rejected application
        // This is a potential area for business rule improvement
        $enrollmentResponse->assertCreated();
        
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_section_id' => $this->courseSection->id,
        ]);
    }

    /** @test */
    public function test_course_waitlist_workflow()
    {
        // Create a user and student
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->roles()->attach($this->studentRole);
        $student = Student::factory()->create(['user_id' => $user->id]);

        // Create accepted application
        AdmissionApplication::factory()->create([
            'student_id' => $student->id,
            'term_id' => $this->term->id,
            'status' => 'accepted',
        ]);

        // Fill course section to capacity
        $this->courseSection->update(['capacity' => 1]);
        $otherUser = User::factory()->create(['email_verified_at' => now()]);
        $otherUser->roles()->attach($this->studentRole);
        $otherStudent = Student::factory()->create(['user_id' => $otherUser->id]);
        
        // Create accepted application for other student
        AdmissionApplication::factory()->create([
            'student_id' => $otherStudent->id,
            'term_id' => $this->term->id,
            'status' => 'accepted',
        ]);
        
        $this->actingAs($otherUser, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $otherStudent->id,
                'course_section_id' => $this->courseSection->id,
            ]);

        // Student tries to enroll in full course (should be waitlisted)
        $enrollmentResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $student->id,
                'course_section_id' => $this->courseSection->id,
            ]);

        $enrollmentResponse->assertCreated()
            ->assertJson([
                'message' => 'Student has been added to the waitlist for this course section.',
                'data' => [
                    'status' => 'waitlisted',
                ],
            ]);

        // Verify waitlist confirmation job was dispatched
        Queue::assertPushed(SendEnrollmentConfirmation::class, function ($job) use ($student) {
            return $job->enrollment->student_id === $student->id 
                && $job->confirmationType === 'waitlisted';
        });
    }


}
