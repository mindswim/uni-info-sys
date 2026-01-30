<?php

namespace Tests\Feature\Api\V1;

use App\Models\AdmissionApplication;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Program;
use App\Models\ProgramChoice;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentConfirmationTest extends TestCase
{
    use RefreshDatabase;

    private User $studentUser;

    private Student $student;

    private AdmissionApplication $application;

    private Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        $faculty = Faculty::factory()->create();
        $department = Department::factory()->create(['faculty_id' => $faculty->id]);
        $this->program = Program::factory()->create(['department_id' => $department->id]);

        $this->studentUser = User::factory()->create(['email_verified_at' => now()]);
        $studentRole = Role::factory()->create(['name' => 'student']);
        $this->studentUser->roles()->attach($studentRole);

        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
            'enrollment_status' => 'prospective',
        ]);

        $term = Term::factory()->create([
            'start_date' => now()->addDays(30),
            'end_date' => now()->addDays(120),
        ]);

        $this->application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term->id,
            'status' => 'accepted',
        ]);

        ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $this->program->id,
            'preference_order' => 1,
            'status' => 'accepted',
        ]);
    }

    public function test_student_can_confirm_own_enrollment(): void
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson(
            "/api/v1/admission-applications/{$this->application->id}/confirm-enrollment"
        );

        $response->assertStatus(200);
        $response->assertJsonPath('message', 'Enrollment confirmed successfully.');

        $this->student->refresh();
        $this->assertEquals('full_time', $this->student->enrollment_status);
        $this->assertEquals($this->program->id, $this->student->major_program_id);

        $this->application->refresh();
        $this->assertEquals('enrolled', $this->application->status);
    }

    public function test_student_cannot_confirm_other_students_enrollment(): void
    {
        $otherUser = User::factory()->create();
        $otherRole = Role::factory()->create(['name' => 'other_student']);
        $otherUser->roles()->attach($otherRole);

        Sanctum::actingAs($otherUser);

        $response = $this->postJson(
            "/api/v1/admission-applications/{$this->application->id}/confirm-enrollment"
        );

        $response->assertStatus(403);
    }

    public function test_cannot_confirm_non_accepted_application(): void
    {
        $this->application->update(['status' => 'submitted']);

        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson(
            "/api/v1/admission-applications/{$this->application->id}/confirm-enrollment"
        );

        $response->assertStatus(422);
    }

    public function test_cannot_confirm_already_enrolled(): void
    {
        $this->student->update(['enrollment_status' => 'full_time']);

        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson(
            "/api/v1/admission-applications/{$this->application->id}/confirm-enrollment"
        );

        $response->assertStatus(422);
    }
}
