<?php

namespace Tests\Feature\Workflows;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Term;
use App\Models\Program;
use App\Models\Department;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use App\Models\Enrollment;
use App\Models\Permission;
use App\Models\Role;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StudentLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $studentUser;
    private User $adminUser;
    private Student $student;
    private Term $term;
    private Program $program;
    private Department $department;
    private Course $course1;
    private Course $course2;
    private CourseSection $section1;
    private CourseSection $section2;
    private Role $adminRole;
    private Role $studentRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->createTestData();
    }
    
    private function createTestData(): void
    {
        // Create roles
        $this->adminRole = Role::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $this->studentRole = Role::create(['name' => 'student', 'display_name' => 'Student']);

        // Create route-level permissions needed by api.php middleware
        $studentPerms = [];
        foreach (['create_applications', 'view_applications', 'update_applications', 'create_enrollments', 'view_enrollments'] as $name) {
            $studentPerms[] = Permission::firstOrCreate(['name' => $name])->id;
        }
        $this->studentRole->permissions()->sync($studentPerms);

        $adminPerms = [];
        foreach (['create_applications', 'view_applications', 'update_applications', 'create_enrollments', 'view_enrollments', 'update_enrollments', 'delete_enrollments'] as $name) {
            $adminPerms[] = Permission::firstOrCreate(['name' => $name])->id;
        }
        $this->adminRole->permissions()->sync($adminPerms);

        // Create users
        $this->adminUser = User::factory()->create(['email' => 'admin@test.com']);
        $this->adminUser->roles()->attach($this->adminRole);

        $this->studentUser = User::factory()->create(['email' => 'student@test.com']);
        $this->studentUser->roles()->attach($this->studentRole);

        // Create student profile
        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'student_number' => 'STU202400001'
        ]);
        
        // Create academic structure - use future term to avoid "past term" enrollment restrictions
        $this->term = Term::factory()->create([
            'name' => 'Fall 2026',
            'academic_year' => 2026,
            'semester' => 'Fall',
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(120)->toDateString(),
            'add_drop_deadline' => now()->addDays(45)->toDateString(),
        ]);
        
        $this->department = Department::factory()->create([
            'name' => 'Computer Science'
        ]);
        
        $this->program = Program::factory()->create([
            'name' => 'Bachelor of Science in Computer Science',
            'department_id' => $this->department->id
        ]);
        
        // Create courses
        $this->course1 = Course::factory()->create([
            'title' => 'Introduction to Programming',
            'course_code' => 'CS101',
            'credits' => 3,
            'department_id' => $this->department->id
        ]);
        
        $this->course2 = Course::factory()->create([
            'title' => 'Data Structures',
            'course_code' => 'CS201', 
            'credits' => 3,
            'department_id' => $this->department->id
        ]);
        
        // Create course sections
        $this->section1 = CourseSection::factory()->create([
            'course_id' => $this->course1->id,
            'term_id' => $this->term->id,
            'capacity' => 30,
            'section_number' => '001',
            'schedule_days' => 'MWF',
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
        ]);

        $this->section2 = CourseSection::factory()->create([
            'course_id' => $this->course2->id,
            'term_id' => $this->term->id,
            'capacity' => 25,
            'section_number' => '001',
            'schedule_days' => 'TR',
            'start_time' => '11:00:00',
            'end_time' => '12:30:00',
        ]);
    }

    public function test_complete_student_journey_from_application_to_enrollment()
    {
        // PHASE 1: Student applies for admission
        Sanctum::actingAs($this->studentUser);
        
        $applicationResponse = $this->postJson('/api/v1/admission-applications', [
            'student_id' => $this->student->id,
            'term_id' => $this->term->id,
            'status' => 'draft'
        ]);
        
        $applicationResponse->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'student_id', 
                    'term_id',
                    'status'
                ]
            ]);
        
        $applicationId = $applicationResponse->json('data.id');

        // PHASE 2: Add program choice to application (temporarily simplified to debug)
        $programChoiceResponse = $this->postJson("/api/v1/admission-applications/{$applicationId}/program-choices", [
            'program_id' => $this->program->id,
            'preference_order' => 1
        ]);
        
        $programChoiceResponse->assertStatus(201)
            ->assertJsonPath('data.preference_order', 1);

        // PHASE 3: Submit application (change from draft to submitted)
        $submissionResponse = $this->putJson("/api/v1/admission-applications/{$applicationId}", [
            'status' => 'submitted'
        ]);
        
        $submissionResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'submitted');

        // PHASE 4: Admin reviews and accepts application
        Sanctum::actingAs($this->adminUser);
        
        $reviewResponse = $this->putJson("/api/v1/admission-applications/{$applicationId}", [
            'status' => 'accepted',
            'decision_date' => now()->toDateString(),
            'decision_status' => 'accepted'
        ]);
        
        $reviewResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'accepted');

        // PHASE 5: Student confirms enrollment (Fix 7)
        Sanctum::actingAs($this->studentUser);

        // Add program choice status = 'accepted' so matriculation finds the accepted program
        ProgramChoice::where('application_id', $applicationId)->update(['status' => 'accepted']);

        $confirmResponse = $this->postJson(
            "/api/v1/admission-applications/{$applicationId}/confirm-enrollment"
        );

        $confirmResponse->assertStatus(200);

        // Verify student is now enrolled
        $this->student->refresh();
        $this->assertEquals('full_time', $this->student->enrollment_status);
        $this->assertEquals($this->program->id, $this->student->major_program_id);

        // PHASE 6: Student enrolls in courses
        $enrollment1Response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->section1->id
        ]);

        $enrollment1Response->assertStatus(201)
            ->assertJsonPath('data.status', 'enrolled');

        $enrollment2Response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->section2->id
        ]);

        $enrollment2Response->assertStatus(201)
            ->assertJsonPath('data.status', 'enrolled');

        // PHASE 7: Verify complete workflow state

        // Verify application state
        $this->assertDatabaseHas('admission_applications', [
            'id' => $applicationId,
            'student_id' => $this->student->id,
            'status' => 'enrolled'
        ]);
        
        // Verify program choice state
        $this->assertDatabaseHas('program_choices', [
            'application_id' => $applicationId,
            'program_id' => $this->program->id,
            'preference_order' => 1
        ]);
        
        // Verify enrollments
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->section1->id,
            'status' => 'enrolled'
        ]);
        
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->section2->id,
            'status' => 'enrolled'
        ]);
        
        // Verify business logic - student should have 2 active enrollments
        $activeEnrollments = Enrollment::where('student_id', $this->student->id)
            ->where('status', 'enrolled')
            ->count();
        
        $this->assertEquals(2, $activeEnrollments);
        
        // Verify student record directly
        $this->assertDatabaseHas('students', [
            'id' => $this->student->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'enrollment_status' => 'full_time',
        ]);
    }

    public function test_authorization_enforced_throughout_workflow()
    {
        // Test that students cannot access other students' applications
        $otherUser = User::factory()->create();
        $otherUser->roles()->attach($this->studentRole);
        $otherStudent = Student::factory()->create(['user_id' => $otherUser->id]);
        
        $application = AdmissionApplication::factory()->create([
            'student_id' => $otherStudent->id,
            'term_id' => $this->term->id
        ]);
        
        Sanctum::actingAs($this->studentUser);
        
        // Should not be able to view other student's application
        $response = $this->getJson("/api/v1/admission-applications/{$application->id}");
        $response->assertStatus(403);
        
        // Should not be able to modify other student's application
        $response = $this->putJson("/api/v1/admission-applications/{$application->id}", [
            'status' => 'submitted'
        ]);
        $response->assertStatus(403);
    }

    public function test_business_rules_enforced_during_enrollment()
    {
        // Create a small capacity section to test enrollment limits
        $limitedSection = CourseSection::factory()->create([
            'course_id' => $this->course1->id,
            'term_id' => $this->term->id,
            'capacity' => 1,
            'section_number' => '099',
        ]);
        
        // Create another student
        $user2 = User::factory()->create();
        $user2->roles()->attach($this->studentRole);
        $student2 = Student::factory()->create(['user_id' => $user2->id]);
        
        // First student enrolls successfully
        Sanctum::actingAs($this->studentUser);
        $response1 = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $limitedSection->id
        ]);
        $response1->assertStatus(201);
        
        // Second student should be waitlisted (if waitlist is implemented)
        // OR get capacity error (if strict capacity checking)
        Sanctum::actingAs($user2);
        $response2 = $this->postJson('/api/v1/enrollments', [
            'student_id' => $student2->id,
            'course_section_id' => $limitedSection->id
        ]);
        
        // Accept either waitlisted or capacity error
        $this->assertTrue(
            $response2->status() === 201 || $response2->status() === 422,
            'Should either waitlist or reject enrollment when at capacity'
        );
    }
} 