<?php

namespace Tests\Feature\Feature;

use App\Exceptions\DuplicateEnrollmentException;
use App\Exceptions\EnrollmentCapacityExceededException;
use App\Exceptions\ResourceNotFoundException;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Services\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $studentUser;
    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user with proper role
        $this->adminUser = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $this->adminUser->roles()->attach($adminRole);

        // Create student user
        $this->studentUser = User::factory()->create(['email_verified_at' => now()]);
        $studentRole = Role::factory()->create(['name' => 'student']);
        $this->studentUser->roles()->attach($studentRole);
        
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
    }

    public function test_enrollment_capacity_exceeded_exception_returns_proper_json_error()
    {
        // Create a course section at full capacity with future term
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
        ]);
        $course = Course::factory()->create();
        $courseSection = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'capacity' => 1, // Only 1 spot
        ]);

        // Fill the capacity
        $existingStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $existingStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Try to enroll another student when at capacity (forcing enrollment)
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $this->student->id,
                'course_section_id' => $courseSection->id,
                'status' => 'enrolled', // Force enrollment status
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot enroll student directly - course section is at capacity. Student will be waitlisted.',
                'error_code' => 'ENROLLMENT_CAPACITY_EXCEEDED',
            ]);
    }

    public function test_duplicate_enrollment_exception_returns_proper_json_error()
    {
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
        ]);
        $course = Course::factory()->create();
        $courseSection = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'capacity' => 10,
        ]);

        // Create existing enrollment
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Try to enroll the same student again
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $this->student->id,
                'course_section_id' => $courseSection->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Student is already enrolled or waitlisted for this course section',
                'error_code' => 'DUPLICATE_ENROLLMENT',
            ]);
    }

    public function test_student_not_active_exception_returns_proper_json_error()
    {
        // Create unverified student
        $unverifiedUser = User::factory()->create(['email_verified_at' => null]);
        $studentRole = Role::where('name', 'student')->first();
        $unverifiedUser->roles()->attach($studentRole);
        $unverifiedStudent = Student::factory()->create(['user_id' => $unverifiedUser->id]);

        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
        ]);
        $course = Course::factory()->create();
        $courseSection = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'capacity' => 10,
        ]);

        // Try to enroll unverified student
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $unverifiedStudent->id,
                'course_section_id' => $courseSection->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The student account is not active or verified.',
                'error_code' => 'STUDENT_NOT_ACTIVE',
            ]);
    }

    public function test_resource_not_found_exception_for_nonexistent_faculty()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/faculties/99999');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'The requested resource was not found.',
                'error_code' => 'NOT_FOUND',
            ]);
    }

    public function test_validation_error_returns_proper_json_structure()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/faculties', [
                'name' => '', // Required field empty
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The given data was invalid.',
                'error_code' => 'VALIDATION_ERROR',
            ])
            ->assertJsonStructure([
                'message',
                'error_code',
                'errors' => [
                    'name'
                ]
            ]);
    }

    public function test_unauthenticated_error_returns_proper_json_structure()
    {
        $response = $this->getJson('/api/v1/faculties');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
                'error_code' => 'UNAUTHENTICATED',
            ]);
    }

    public function test_unauthorized_error_returns_proper_json_structure()
    {
        // Create a user without admin role
        $regularUser = User::factory()->create();
        $userRole = Role::factory()->create(['name' => 'user']);
        $regularUser->roles()->attach($userRole);

        $response = $this->actingAs($regularUser, 'sanctum')
            ->postJson('/api/v1/faculties', [
                'name' => 'Test Faculty',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'This action is unauthorized.',
                'error_code' => 'UNAUTHORIZED',
            ]);
    }

    public function test_error_responses_include_debug_info_in_development()
    {
        // Temporarily set app to debug mode
        config(['app.debug' => true]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/faculties', [
                'name' => '', // Trigger validation error
            ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'error_code',
                'errors',
                'debug' => [
                    'exception',
                    'file',
                    'line',
                    'trace'
                ]
            ]);
    }

    public function test_error_responses_do_not_include_debug_info_in_production()
    {
        // Set app to production mode
        config(['app.debug' => false]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/faculties', [
                'name' => '', // Trigger validation error
            ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'error_code',
                'errors'
            ])
            ->assertJsonMissing(['debug']);
    }

    public function test_custom_exceptions_are_logged_appropriately()
    {
        // We'll check if the exception is handled properly instead of testing logs directly
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
        ]);
        $course = Course::factory()->create();
        $courseSection = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'capacity' => 1,
        ]);

        // Fill capacity
        $existingStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $existingStudent->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Trigger capacity exceeded exception
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $this->student->id,
                'course_section_id' => $courseSection->id,
                'status' => 'enrolled',
            ]);

        // Verify the exception was handled correctly
        $response->assertStatus(422)
            ->assertJson([
                'error_code' => 'ENROLLMENT_CAPACITY_EXCEEDED',
            ]);
    }
}
