<?php

namespace Tests\Feature\Api\V1;

use App\Models\AdmissionApplication;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Permission;
use App\Models\Program;
use App\Models\ProgramChoice;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdmissionEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Student $student;
    private AdmissionApplication $application;
    private Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        $faculty = Faculty::factory()->create();
        $department = Department::factory()->create(['faculty_id' => $faculty->id]);
        $this->program = Program::factory()->create(['department_id' => $department->id]);

        $studentUser = User::factory()->create(['email_verified_at' => now()]);
        $this->student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'enrollment_status' => 'prospective',
            'major_program_id' => null,
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

        // Auth as admin with update_applications permission
        $this->adminUser = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $perm = Permission::create(['name' => 'update_applications', 'description' => 'Update applications']);
        $adminRole->permissions()->attach($perm);
        $this->adminUser->roles()->attach($adminRole);
        Sanctum::actingAs($this->adminUser);
    }

    public function test_enroll_sets_student_enrollment_status(): void
    {
        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $this->student->refresh();
        $this->assertEquals('full_time', $this->student->enrollment_status);
    }

    public function test_enroll_sets_major_program_id(): void
    {
        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $this->student->refresh();
        $this->assertEquals($this->program->id, $this->student->major_program_id);
    }

    public function test_enroll_sets_admission_date(): void
    {
        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $this->student->refresh();
        $this->assertEquals(now()->toDateString(), $this->student->admission_date->toDateString());
    }

    public function test_enroll_sets_class_standing_and_academic_status(): void
    {
        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $this->student->refresh();
        $this->assertEquals('freshman', $this->student->class_standing);
        $this->assertEquals('good_standing', $this->student->academic_status);
    }

    public function test_enroll_rejects_other_program_choices(): void
    {
        $otherProgram = Program::factory()->create(['department_id' => $this->program->department_id]);
        $secondChoice = ProgramChoice::factory()->create([
            'application_id' => $this->application->id,
            'program_id' => $otherProgram->id,
            'preference_order' => 2,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $secondChoice->refresh();
        $this->assertEquals('rejected', $secondChoice->status);
    }

    public function test_enroll_transitions_application_to_enrolled(): void
    {
        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $this->application->refresh();
        $this->assertEquals('enrolled', $this->application->status);
    }

    public function test_cannot_enroll_non_accepted_application(): void
    {
        $this->application->update(['status' => 'submitted']);

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(422);
        $response->assertJsonPath('error_code', 'INVALID_APPLICATION_STATUS');
    }

    public function test_cannot_enroll_already_enrolled_student(): void
    {
        $this->student->update(['enrollment_status' => 'full_time']);

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(422);
        $response->assertJsonPath('error_code', 'BUSINESS_RULE_VIOLATION');
    }

    public function test_enroll_dispatches_notification_job(): void
    {
        Queue::fake();

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        Queue::assertPushed(\App\Jobs\SendApplicationStatusNotification::class);
    }

    public function test_enroll_uses_first_preference_when_no_accepted_choice(): void
    {
        // Reset choices to all pending
        $this->application->programChoices()->update(['status' => 'pending']);

        $response = $this->postJson("/api/v1/admission-applications/{$this->application->id}/enroll");

        $response->assertStatus(200);
        $this->student->refresh();
        $this->assertEquals($this->program->id, $this->student->major_program_id);
    }
}
