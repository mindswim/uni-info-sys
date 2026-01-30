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
use Tests\Traits\CreatesUsersWithRoles;

class ErrorHandlingTest extends TestCase
{
    use RefreshDatabase, CreatesUsersWithRoles;

    private User $adminUser;
    private User $studentUser;
    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = $this->createAdminUser();
        $this->studentUser = $this->createStudentUser();
        $this->student = $this->studentUser->student;
    }

    /** @test */
    public function it_returns_rfc7807_format_for_enrollment_capacity_exceeded()
    {
        // Create a course section at full capacity with future term
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline to avoid deadline validation
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
                'type' => 'https://university-admissions.com/problems/enrollment-capacity-exceeded',
                'title' => 'Enrollment Capacity Exceeded',
                'status' => 422,
                'detail' => 'Cannot enroll student directly - course section is at capacity. Student will be waitlisted.',
                'error_code' => 'ENROLLMENT_CAPACITY_EXCEEDED',
            ])
            ->assertJsonStructure([
                'type',
                'title', 
                'status',
                'detail',
                'error_code'
            ]);
    }

    /** @test */
    public function it_returns_rfc7807_format_for_duplicate_enrollment()
    {
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline to avoid deadline validation
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
                'type' => 'https://university-admissions.com/problems/duplicate-enrollment',
                'title' => 'Duplicate Enrollment',
                'status' => 422,
                'detail' => 'Student is already enrolled or waitlisted for this course section',
                'error_code' => 'DUPLICATE_ENROLLMENT',
            ])
            ->assertJsonStructure([
                'type',
                'title',
                'status', 
                'detail',
                'error_code'
            ]);
    }

    /** @test */
    public function it_returns_rfc7807_format_for_student_not_active()
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
                'type' => 'https://university-admissions.com/problems/student-not-active',
                'title' => 'Student Not Active',
                'status' => 422,
                'detail' => 'The student account is not active or verified.',
                'error_code' => 'STUDENT_NOT_ACTIVE',
            ])
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail', 
                'error_code'
            ]);
    }

    /** @test */
    public function it_returns_rfc7807_format_for_not_found_errors()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/faculties/99999');

        $response->assertStatus(404)
            ->assertJson([
                'type' => 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                'title' => 'Resource Not Found',
                'status' => 404,
            ])
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail'
            ]);
        
        // The detail should contain the Laravel ModelNotFoundException message
        $this->assertStringContainsString('No query results for model', $response->json('detail'));
    }

    /** @test */
    public function it_returns_rfc7807_format_for_validation_errors()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/faculties', [
                'name' => '', // Required field empty
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'type' => 'https://tools.ietf.org/html/rfc4918#section-11.2',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
            ])
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail',
                'errors' => [
                    'name'
                ]
            ]);
    }

    /** @test */
    public function it_returns_rfc7807_format_for_unauthenticated_errors()
    {
        $response = $this->getJson('/api/v1/faculties');

        $response->assertStatus(401)
            ->assertJson([
                'type' => 'https://tools.ietf.org/html/rfc7235#section-3.1',
                'title' => 'Unauthenticated',
                'status' => 401,
                'detail' => 'Authentication is required to access this resource.',
            ])
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail'
            ]);
    }

    /** @test */
    public function it_returns_rfc7807_format_for_unauthorized_errors()
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
                'type' => 'https://tools.ietf.org/html/rfc7231',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'This action is unauthorized.',
            ])
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail'
            ]);
    }

    /** @test */
    public function it_includes_debug_info_in_development_for_server_errors()
    {
        // Temporarily set app to debug mode
        config(['app.debug' => true]);

        // Force a server error by trying to access a non-existent method
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/non-existent-endpoint');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail'
            ]);
    }

    /** @test */
    public function it_does_not_include_debug_info_in_production()
    {
        // Set app to production mode
        config(['app.debug' => false]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/non-existent-endpoint');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'type',
                'title',
                'status',
                'detail'
            ])
            ->assertJsonMissing(['debug']);
    }

    /** @test */
    public function it_logs_custom_exceptions_appropriately()
    {
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(90)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(4), // Future deadline to avoid deadline validation
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

        // Try to enroll when at capacity - this should trigger the custom exception
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/enrollments', [
                'student_id' => $this->student->id,
                'course_section_id' => $courseSection->id,
                'status' => 'enrolled',
            ]);

        // Verify the RFC 7807 response format for our custom exception
        $response->assertStatus(422)
            ->assertJson([
                'type' => 'https://university-admissions.com/problems/enrollment-capacity-exceeded',
                'title' => 'Enrollment Capacity Exceeded',
                'status' => 422,
                'error_code' => 'ENROLLMENT_CAPACITY_EXCEEDED',
            ]);
    }
}
