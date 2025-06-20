<?php

namespace Tests\Feature\Api\V1;

use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentSwapApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Student $student;
    private Term $term;
    private CourseSection $fromCourseSection;
    private CourseSection $toCourseSection;
    private Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->createTestData();
        
        // Authenticate as a student user for API tests
        $studentRole = Role::factory()->create(['name' => 'student']);
        $this->user->roles()->attach($studentRole);
        Sanctum::actingAs($this->user);
    }

    private function createTestData()
    {
        // Create user and student
        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->student = Student::factory()->create(['user_id' => $this->user->id]);

        // Create term with future add/drop deadline
        $this->term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(2), // Future deadline
        ]);

        // Create course sections
        $this->fromCourseSection = CourseSection::factory()->create([
            'term_id' => $this->term->id,
            'capacity' => 30,
        ]);

        $this->toCourseSection = CourseSection::factory()->create([
            'term_id' => $this->term->id,
            'capacity' => 25,
        ]);

        // Create enrollment for the student
        $this->enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->fromCourseSection->id,
            'status' => 'enrolled',
        ]);
    }

    /** @test */
    public function it_can_swap_enrollments_successfully()
    {
        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Enrollment swap successful. You have been enrolled in the new course section.',
                'data' => [
                    'from_enrollment' => [
                        'id' => $this->enrollment->id,
                        'status' => 'withdrawn',
                    ],
                    'to_enrollment' => [
                        'status' => 'enrolled',
                        'course_section' => [
                            'id' => $this->toCourseSection->id,
                        ],
                    ],
                ],
            ]);

        // Verify database state
        $this->assertDatabaseHas('enrollments', [
            'id' => $this->enrollment->id,
            'status' => 'withdrawn',
        ]);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->toCourseSection->id,
            'status' => 'enrolled',
        ]);
    }

    /** @test */
    public function it_waitlists_student_when_target_section_is_full()
    {
        // Fill target section to capacity
        $this->toCourseSection->update(['capacity' => 1]);
        
        // Create another student to fill the capacity
        $otherStudent = Student::factory()->create();
        Enrollment::factory()->create([
            'student_id' => $otherStudent->id,
            'course_section_id' => $this->toCourseSection->id,
            'status' => 'enrolled',
        ]);

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Enrollment swap successful. You have been added to the waitlist for the new course section.',
                'data' => [
                    'to_enrollment' => [
                        'status' => 'waitlisted',
                    ],
                ],
            ]);

        // Verify the new enrollment is waitlisted
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->toCourseSection->id,
            'status' => 'waitlisted',
        ]);
    }

    /** @test */
    public function it_fails_when_add_drop_deadline_has_passed()
    {
        // Set deadline to past
        $this->term->update(['add_drop_deadline' => now()->subDays(1)]);

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertForbidden()
            ->assertJson([
                'message' => 'Swap not allowed.',
                'error' => 'The add/drop deadline has passed for the current enrollment term.',
            ]);

        // Verify no changes to database
        $this->assertDatabaseHas('enrollments', [
            'id' => $this->enrollment->id,
            'status' => 'enrolled', // Still enrolled
        ]);
    }

    /** @test */
    public function it_fails_when_target_term_deadline_has_passed()
    {
        // Create a term with past deadline for target section
        $pastTerm = Term::factory()->create([
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->subDays(1), // Past deadline
        ]);

        $this->toCourseSection->update(['term_id' => $pastTerm->id]);

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertForbidden()
            ->assertJson([
                'message' => 'Swap not allowed.',
                'error' => 'The add/drop deadline has passed for the target course section term.',
            ]);
    }

    /** @test */
    public function it_fails_when_user_does_not_own_enrollment()
    {
        // Create another user and student
        $otherUser = User::factory()->create(['email_verified_at' => now()]);
        $otherStudent = Student::factory()->create(['user_id' => $otherUser->id]);
        
        // Create enrollment for other student
        $otherEnrollment = Enrollment::factory()->create([
            'student_id' => $otherStudent->id,
            'course_section_id' => $this->fromCourseSection->id,
            'status' => 'enrolled',
        ]);

        $swapData = [
            'from_enrollment_id' => $otherEnrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        // The policy will throw an unauthorized exception before our custom logic
        $response->assertForbidden()
            ->assertJson([
                'message' => 'This action is unauthorized.',
            ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/enrollments/swap', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['from_enrollment_id', 'to_course_section_id']);
    }

    /** @test */
    public function it_validates_enrollment_exists()
    {
        $swapData = [
            'from_enrollment_id' => 99999, // Non-existent
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['from_enrollment_id']);
    }

    /** @test */
    public function it_validates_course_section_exists()
    {
        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => 99999, // Non-existent
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['to_course_section_id']);
    }

    /** @test */
    public function it_prevents_swapping_to_same_course_section()
    {
        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->fromCourseSection->id, // Same section
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['to_course_section_id']);
    }

    /** @test */
    public function it_prevents_swapping_completed_enrollments()
    {
        // Set enrollment to completed
        $this->enrollment->update(['status' => 'completed', 'grade' => 'A']);

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['from_enrollment_id']);
    }

    /** @test */
    public function it_prevents_swapping_withdrawn_enrollments()
    {
        // Set enrollment to withdrawn
        $this->enrollment->update(['status' => 'withdrawn']);

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['from_enrollment_id']);
    }

    /** @test */
    public function it_rolls_back_transaction_when_new_enrollment_fails()
    {
        // Create a duplicate enrollment to trigger a constraint violation
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->toCourseSection->id,
            'status' => 'enrolled',
        ]);

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnprocessable()
            ->assertJson([
                'message' => 'Enrollment swap failed.',
            ]);

        // Verify original enrollment is still enrolled (transaction rolled back)
        $this->assertDatabaseHas('enrollments', [
            'id' => $this->enrollment->id,
            'status' => 'enrolled',
        ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        // Test without authentication by not calling Sanctum::actingAs
        $this->app['auth']->forgetGuards();

        $swapData = [
            'from_enrollment_id' => $this->enrollment->id,
            'to_course_section_id' => $this->toCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments/swap', $swapData);

        $response->assertUnauthorized();
    }
}
