<?php

namespace Tests\Feature;

use App\Models\AdmissionApplication;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use OwenIt\Auditing\Models\Audit;
use Tests\TestCase;
use Tests\Traits\CreatesUsersWithRoles;

class AuditingTest extends TestCase
{
    use CreatesUsersWithRoles, RefreshDatabase;

    /** @test */
    public function test_student_model_auditing_on_creation()
    {
        // Create a student
        $user = User::factory()->create();
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        // Check that audit record was created
        $audit = Audit::where('auditable_type', 'App\\Models\\Student')
            ->where('auditable_id', $student->id)
            ->where('event', 'created')
            ->first();

        $this->assertNotNull($audit);
        $this->assertEquals('created', $audit->event);
        $this->assertArrayHasKey('first_name', $audit->new_values);
        $this->assertEquals('John', $audit->new_values['first_name']);
        $this->assertEmpty($audit->old_values);
    }

    /** @test */
    public function test_student_model_auditing_on_update()
    {
        // Create a student
        $user = User::factory()->create();
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'John',
        ]);

        // Update the student
        $student->update(['first_name' => 'Jane']);

        // Check that audit record was created for the update
        $audit = Audit::where('auditable_type', 'App\\Models\\Student')
            ->where('auditable_id', $student->id)
            ->where('event', 'updated')
            ->first();

        $this->assertNotNull($audit);
        $this->assertEquals('updated', $audit->event);
        $this->assertEquals('John', $audit->old_values['first_name']);
        $this->assertEquals('Jane', $audit->new_values['first_name']);
    }

    /** @test */
    public function test_user_model_auditing()
    {
        // Create a user
        $user = User::factory()->create(['name' => 'Test User']);

        // Update the user
        $user->update(['email' => 'newemail@example.com']);

        // Check audit records
        $audits = Audit::where('auditable_type', 'App\\Models\\User')
            ->where('auditable_id', $user->id)
            ->get();

        $this->assertGreaterThanOrEqual(1, $audits->count());

        $updateAudit = $audits->where('event', 'updated')->first();
        $this->assertNotNull($updateAudit);
        $this->assertArrayHasKey('email', $updateAudit->new_values);
        $this->assertEquals('newemail@example.com', $updateAudit->new_values['email']);
    }

    /** @test */
    public function test_enrollment_model_auditing()
    {
        // Create necessary related models
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $courseSection = CourseSection::factory()->create();

        // Create enrollment
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Update enrollment status
        $enrollment->update(['status' => 'completed']);

        // Check audit records
        $audits = Audit::where('auditable_type', 'App\\Models\\Enrollment')
            ->where('auditable_id', $enrollment->id)
            ->get();

        $this->assertGreaterThanOrEqual(1, $audits->count());

        $updateAudit = $audits->where('event', 'updated')->first();
        $this->assertNotNull($updateAudit);
        $this->assertEquals('enrolled', $updateAudit->old_values['status']);
        $this->assertEquals('completed', $updateAudit->new_values['status']);
    }

    /** @test */
    public function test_admission_application_auditing()
    {
        // Create admission application
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $application = AdmissionApplication::factory()->create([
            'student_id' => $student->id,
            'status' => 'pending',
        ]);

        // Update application status
        $application->update(['status' => 'approved']);

        // Check audit records
        $audits = Audit::where('auditable_type', 'App\\Models\\AdmissionApplication')
            ->where('auditable_id', $application->id)
            ->get();

        $this->assertGreaterThanOrEqual(1, $audits->count());

        $updateAudit = $audits->where('event', 'updated')->first();
        $this->assertNotNull($updateAudit);
        $this->assertEquals('pending', $updateAudit->old_values['status']);
        $this->assertEquals('approved', $updateAudit->new_values['status']);
    }

    /** @test */
    public function test_course_section_auditing()
    {
        // Create course section
        $courseSection = CourseSection::factory()->create(['capacity' => 30]);

        // Update capacity
        $courseSection->update(['capacity' => 25]);

        // Check audit records
        $audits = Audit::where('auditable_type', 'App\\Models\\CourseSection')
            ->where('auditable_id', $courseSection->id)
            ->get();

        $this->assertGreaterThanOrEqual(1, $audits->count());

        $updateAudit = $audits->where('event', 'updated')->first();
        $this->assertNotNull($updateAudit);
        $this->assertEquals(30, $updateAudit->old_values['capacity']);
        $this->assertEquals(25, $updateAudit->new_values['capacity']);
    }

    /** @test */
    public function test_audit_includes_metadata()
    {
        // Create a student to trigger an audit
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);

        // Get the audit record
        $audit = Audit::where('auditable_type', 'App\\Models\\Student')
            ->where('auditable_id', $student->id)
            ->first();

        // Verify audit metadata
        $this->assertNotNull($audit->created_at);
        $this->assertIsString($audit->url);
        $this->assertIsString($audit->ip_address);
        $this->assertIsString($audit->user_agent);
    }

    /** @test */
    public function test_audits_are_stored_in_database()
    {
        // Create multiple auditable actions
        $user = User::factory()->create(['name' => 'Test User']);
        $student = Student::factory()->create(['user_id' => $user->id]);
        $student->update(['first_name' => 'Updated Name']);
        $user->update(['email' => 'updated@example.com']);

        // Verify audit records exist in database
        $totalAudits = Audit::count();
        $this->assertGreaterThan(0, $totalAudits);

        // Verify we can query audits by model type
        $studentAudits = Audit::where('auditable_type', 'App\\Models\\Student')->count();
        $userAudits = Audit::where('auditable_type', 'App\\Models\\User')->count();

        $this->assertGreaterThan(0, $studentAudits);
        $this->assertGreaterThan(0, $userAudits);
    }

    /** @test */
    public function test_grade_change_audit_trail_with_reason()
    {
        // Create authenticated admin user
        $user = $this->createAdminUser();
        Sanctum::actingAs($user);

        // Create necessary related models
        $studentUser = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $studentUser->id]);
        $courseSection = CourseSection::factory()->create();

        // Create enrollment with initial grade
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'completed',
            'grade' => 'B',
        ]);

        // Update the grade via API with reason for change
        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", [
            'grade' => 'A',
            'reason_for_change' => 'Correcting calculation error in final exam',
        ]);

        $response->assertOk();

        // Verify the grade was updated
        $enrollment->refresh();
        $this->assertEquals('A', $enrollment->grade);

        // Check that audit record was created
        $audit = Audit::where('auditable_type', 'App\\Models\\Enrollment')
            ->where('auditable_id', $enrollment->id)
            ->where('event', 'updated')
            ->latest()
            ->first();

        $this->assertNotNull($audit);
        $this->assertEquals('updated', $audit->event);

        // Verify old and new grade values
        $this->assertArrayHasKey('grade', $audit->old_values);
        $this->assertArrayHasKey('grade', $audit->new_values);
        $this->assertEquals('B', $audit->old_values['grade']);
        $this->assertEquals('A', $audit->new_values['grade']);

        // Verify reason for change is stored in tags
        $this->assertNotEmpty($audit->tags);
        $this->assertStringContainsString('reason:Correcting calculation error in final exam', $audit->tags);
    }

    /** @test */
    public function test_status_change_audit_trail()
    {
        // Create authenticated admin user
        $user = $this->createAdminUser();
        Sanctum::actingAs($user);

        // Create necessary related models
        $studentUser = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $studentUser->id]);
        $courseSection = CourseSection::factory()->create();

        // Create enrollment
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Update the status via API
        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", [
            'status' => 'completed',
            'grade' => 'B+',
            'reason_for_change' => 'Course completion',
        ]);

        $response->assertOk();

        // Check that audit record was created
        $audit = Audit::where('auditable_type', 'App\\Models\\Enrollment')
            ->where('auditable_id', $enrollment->id)
            ->where('event', 'updated')
            ->latest()
            ->first();

        $this->assertNotNull($audit);

        // Verify both status and grade changes are audited
        $this->assertArrayHasKey('status', $audit->old_values);
        $this->assertArrayHasKey('status', $audit->new_values);
        $this->assertEquals('enrolled', $audit->old_values['status']);
        $this->assertEquals('completed', $audit->new_values['status']);

        $this->assertArrayHasKey('grade', $audit->new_values);
        $this->assertEquals('B+', $audit->new_values['grade']);
    }

    /** @test */
    public function test_reason_for_change_required_when_updating_grade()
    {
        // Create authenticated admin user
        $user = $this->createAdminUser();
        Sanctum::actingAs($user);

        // Create necessary related models
        $studentUser = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $studentUser->id]);
        $courseSection = CourseSection::factory()->create();

        // Create enrollment with initial grade
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'completed',
            'grade' => 'B',
        ]);

        // Try to update grade without reason_for_change
        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", [
            'grade' => 'A',
            // Missing reason_for_change
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['reason_for_change']);
    }

    /** @test */
    public function test_reason_for_change_not_required_when_not_updating_grade()
    {
        // Create authenticated admin user
        $user = $this->createAdminUser();
        Sanctum::actingAs($user);

        // Create necessary related models
        $studentUser = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $studentUser->id]);
        $courseSection = CourseSection::factory()->create();

        // Create enrollment
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $courseSection->id,
            'status' => 'enrolled',
        ]);

        // Update status without grade change (no reason_for_change needed)
        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", [
            'status' => 'withdrawn',
            // No reason_for_change needed when not updating grade
        ]);

        $response->assertOk();
    }
}
