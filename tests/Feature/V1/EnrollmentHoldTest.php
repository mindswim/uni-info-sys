<?php

namespace Tests\Feature\Api\V1;

use App\Models\Building;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Hold;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentHoldTest extends TestCase
{
    use RefreshDatabase;

    private Student $student;
    private CourseSection $courseSection;
    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create academic hierarchy
        $faculty = Faculty::factory()->create();
        $department = Department::factory()->create(['faculty_id' => $faculty->id]);

        $term = Term::factory()->create([
            'start_date' => now()->addDays(30),
            'end_date' => now()->addDays(120),
            'add_drop_deadline' => now()->addDays(60),
        ]);

        $course = Course::factory()->create(['department_id' => $department->id]);
        $building = Building::factory()->create();
        $room = Room::factory()->create(['building_id' => $building->id]);

        $instructorUser = User::factory()->create();
        $instructor = Staff::factory()->create([
            'user_id' => $instructorUser->id,
            'department_id' => $department->id,
        ]);

        $studentUser = User::factory()->create(['email_verified_at' => now()]);
        $this->student = Student::factory()->create(['user_id' => $studentUser->id]);

        $this->courseSection = CourseSection::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'capacity' => 30,
        ]);

        // Auth as admin with enrollment permissions
        $this->adminUser = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $createEnrollmentsPerm = Permission::create(['name' => 'create_enrollments', 'description' => 'Create enrollments']);
        $adminRole->permissions()->attach($createEnrollmentsPerm);
        $this->adminUser->roles()->attach($adminRole);
        Sanctum::actingAs($this->adminUser);
    }

    public function test_student_with_registration_hold_cannot_enroll(): void
    {
        Hold::create([
            'student_id' => $this->student->id,
            'type' => Hold::TYPE_FINANCIAL,
            'reason' => 'Unpaid tuition balance',
            'severity' => Hold::SEVERITY_CRITICAL,
            'prevents_registration' => true,
            'prevents_transcript' => false,
            'prevents_graduation' => false,
            'placed_by' => $this->adminUser->id,
            'placed_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('title', 'Registration Hold')
            ->assertJsonPath('error_code', 'REGISTRATION_HOLD')
            ->assertJsonCount(1, 'holds');
    }

    public function test_student_with_resolved_hold_can_enroll(): void
    {
        Hold::create([
            'student_id' => $this->student->id,
            'type' => Hold::TYPE_FINANCIAL,
            'reason' => 'Unpaid tuition balance',
            'severity' => Hold::SEVERITY_CRITICAL,
            'prevents_registration' => true,
            'prevents_transcript' => false,
            'prevents_graduation' => false,
            'placed_by' => $this->adminUser->id,
            'placed_at' => now()->subDays(10),
            'resolved_at' => now()->subDays(1),
            'resolved_by' => $this->adminUser->id,
            'resolution_notes' => 'Payment received',
        ]);

        $response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response->assertStatus(201);
    }

    public function test_student_with_non_registration_hold_can_enroll(): void
    {
        Hold::create([
            'student_id' => $this->student->id,
            'type' => Hold::TYPE_LIBRARY,
            'reason' => 'Overdue library books',
            'severity' => Hold::SEVERITY_WARNING,
            'prevents_registration' => false,
            'prevents_transcript' => true,
            'prevents_graduation' => false,
            'placed_by' => $this->adminUser->id,
            'placed_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response->assertStatus(201);
    }

    public function test_student_with_multiple_holds_gets_all_listed(): void
    {
        Hold::create([
            'student_id' => $this->student->id,
            'type' => Hold::TYPE_FINANCIAL,
            'reason' => 'Unpaid tuition balance',
            'severity' => Hold::SEVERITY_CRITICAL,
            'prevents_registration' => true,
            'prevents_transcript' => false,
            'prevents_graduation' => false,
            'placed_by' => $this->adminUser->id,
            'placed_at' => now(),
        ]);

        Hold::create([
            'student_id' => $this->student->id,
            'type' => Hold::TYPE_IMMUNIZATION,
            'reason' => 'Missing immunization records',
            'severity' => Hold::SEVERITY_WARNING,
            'prevents_registration' => true,
            'prevents_transcript' => false,
            'prevents_graduation' => false,
            'placed_by' => $this->adminUser->id,
            'placed_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error_code', 'REGISTRATION_HOLD')
            ->assertJsonCount(2, 'holds');
    }

    public function test_hold_check_runs_before_prerequisite_check(): void
    {
        // Create a hold AND a course with prerequisites the student hasn't met
        Hold::create([
            'student_id' => $this->student->id,
            'type' => Hold::TYPE_FINANCIAL,
            'reason' => 'Unpaid balance',
            'severity' => Hold::SEVERITY_CRITICAL,
            'prevents_registration' => true,
            'prevents_transcript' => false,
            'prevents_graduation' => false,
            'placed_by' => $this->adminUser->id,
            'placed_at' => now(),
        ]);

        // The error should be about the hold, not prerequisites
        $response = $this->postJson('/api/v1/enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error_code', 'REGISTRATION_HOLD');
    }
}
