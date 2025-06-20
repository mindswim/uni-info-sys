<?php

namespace Tests\Feature\Api\V1;

use App\Models\AdmissionApplication;
use App\Models\Role;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdmissionApplicationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $staffUser;
    protected User $studentUser;
    protected User $otherStudentUser;
    protected Student $student;
    protected Student $otherStudent;
    protected Term $term;
    protected Role $adminRole;
    protected Role $staffRole;
    protected Role $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->adminRole = Role::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $this->staffRole = Role::create(['name' => 'staff', 'display_name' => 'Staff']);
        $this->studentRole = Role::create(['name' => 'student', 'display_name' => 'Student']);

        // Create users
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($this->adminRole);

        $this->staffUser = User::factory()->create();
        $this->staffUser->roles()->attach($this->staffRole);

        $this->studentUser = User::factory()->create();
        $this->studentUser->roles()->attach($this->studentRole);

        $this->otherStudentUser = User::factory()->create();
        $this->otherStudentUser->roles()->attach($this->studentRole);

        // Create students
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
        $this->otherStudent = Student::factory()->create(['user_id' => $this->otherStudentUser->id]);

        // Create term
        $this->term = Term::factory()->create();
    }

    /** @test */
    public function unauthenticated_user_cannot_access_admission_applications()
    {
        $response = $this->getJson('/api/v1/admission-applications');

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function admin_can_list_all_admission_applications()
    {
        Sanctum::actingAs($this->adminUser);

        $applications = AdmissionApplication::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/admission-applications');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'student_id',
                             'term_id',
                             'status',
                             'application_date',
                             'comments'
                         ]
                     ],
                     'meta' => [
                         'current_page',
                         'last_page',
                         'per_page',
                         'total'
                     ]
                 ])
                 ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function student_can_only_see_their_own_applications()
    {
        Sanctum::actingAs($this->studentUser);

        // Create applications for different students
        $ownApplication = AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        $otherApplication = AdmissionApplication::factory()->create(['student_id' => $this->otherStudent->id]);

        $response = $this->getJson('/api/v1/admission-applications');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment(['id' => $ownApplication->id])
                 ->assertJsonMissing(['id' => $otherApplication->id]);
    }

    /** @test */
    public function can_filter_applications_by_status()
    {
        Sanctum::actingAs($this->adminUser);

        $draftApplication = AdmissionApplication::factory()->create(['status' => 'draft']);
        $submittedApplication = AdmissionApplication::factory()->create(['status' => 'submitted']);

        $response = $this->getJson('/api/v1/admission-applications?status=draft');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment(['id' => $draftApplication->id])
                 ->assertJsonMissing(['id' => $submittedApplication->id]);
    }

    /** @test */
    public function can_filter_applications_by_term()
    {
        Sanctum::actingAs($this->adminUser);

        $otherTerm = Term::factory()->create();

        $application1 = AdmissionApplication::factory()->create(['term_id' => $this->term->id]);
        $application2 = AdmissionApplication::factory()->create(['term_id' => $otherTerm->id]);

        $response = $this->getJson("/api/v1/admission-applications?term_id={$this->term->id}");

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment(['id' => $application1->id])
                 ->assertJsonMissing(['id' => $application2->id]);
    }

    /** @test */
    public function student_can_create_admission_application_for_themselves()
    {
        Sanctum::actingAs($this->studentUser);

        $applicationData = [
            'student_id' => $this->student->id,
            'term_id' => $this->term->id,
            'status' => 'draft',
            'comments' => 'Looking forward to this program'
        ];

        $response = $this->postJson('/api/v1/admission-applications', $applicationData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'id',
                         'student_id',
                         'term_id',
                         'status',
                         'application_date',
                         'comments'
                     ]
                 ])
                 ->assertJsonFragment([
                     'student_id' => $this->student->id,
                     'term_id' => $this->term->id,
                     'status' => 'draft',
                     'comments' => 'Looking forward to this program'
                 ]);

        $this->assertDatabaseHas('admission_applications', [
            'student_id' => $this->student->id,
            'term_id' => $this->term->id,
            'status' => 'draft'
        ]);
    }

    /** @test */
    public function student_cannot_create_admission_application_for_another_student()
    {
        Sanctum::actingAs($this->studentUser);

        $applicationData = [
            'student_id' => $this->otherStudent->id,
            'term_id' => $this->term->id,
            'status' => 'draft'
        ];

        $response = $this->postJson('/api/v1/admission-applications', $applicationData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['student_id']);
    }

    /** @test */
    public function admin_can_create_admission_application_for_any_student()
    {
        Sanctum::actingAs($this->adminUser);

        $applicationData = [
            'student_id' => $this->student->id,
            'term_id' => $this->term->id,
            'status' => 'draft'
        ];

        $response = $this->postJson('/api/v1/admission-applications', $applicationData);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'student_id' => $this->student->id,
                     'term_id' => $this->term->id
                 ]);
    }

    /** @test */
    public function validation_fails_for_missing_required_fields()
    {
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson('/api/v1/admission-applications', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['student_id', 'term_id']);
    }

    /** @test */
    public function validation_fails_for_non_existent_student_or_term()
    {
        Sanctum::actingAs($this->adminUser);

        $applicationData = [
            'student_id' => 999,
            'term_id' => 999
        ];

        $response = $this->postJson('/api/v1/admission-applications', $applicationData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['student_id', 'term_id']);
    }

    /** @test */
    public function can_view_specific_admission_application()
    {
        Sanctum::actingAs($this->adminUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $this->term->id
        ]);

        $response = $this->getJson("/api/v1/admission-applications/{$application->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'id' => $application->id,
                     'student_id' => $this->student->id,
                     'term_id' => $this->term->id
                 ]);
    }

    /** @test */
    public function student_can_only_view_their_own_application()
    {
        Sanctum::actingAs($this->studentUser);

        $ownApplication = AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        $otherApplication = AdmissionApplication::factory()->create(['student_id' => $this->otherStudent->id]);

        // Can view own application
        $response = $this->getJson("/api/v1/admission-applications/{$ownApplication->id}");
        $response->assertStatus(200);

        // Cannot view other's application
        $response = $this->getJson("/api/v1/admission-applications/{$otherApplication->id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function student_can_update_their_own_draft_application()
    {
        Sanctum::actingAs($this->studentUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'draft'
        ]);

        $updateData = [
            'status' => 'submitted',
            'comments' => 'Updated comments'
        ];

        $response = $this->putJson("/api/v1/admission-applications/{$application->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'status' => 'submitted',
                     'comments' => 'Updated comments'
                 ]);

        $this->assertDatabaseHas('admission_applications', [
            'id' => $application->id,
            'status' => 'submitted',
            'comments' => 'Updated comments'
        ]);
    }

    /** @test */
    public function student_cannot_update_submitted_application()
    {
        Sanctum::actingAs($this->studentUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'submitted'
        ]);

        $updateData = ['status' => 'draft'];

        $response = $this->putJson("/api/v1/admission-applications/{$application->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_update_any_application_status()
    {
        Sanctum::actingAs($this->adminUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'submitted'
        ]);

        $updateData = [
            'status' => 'accepted',
            'decision_status' => 'Accepted with conditions'
        ];

        $response = $this->putJson("/api/v1/admission-applications/{$application->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'status' => 'accepted',
                     'decision_status' => 'Accepted with conditions'
                 ]);

        $this->assertDatabaseHas('admission_applications', [
            'id' => $application->id,
            'status' => 'accepted',
            'decision_status' => 'Accepted with conditions'
        ]);
    }

    /** @test */
    public function student_can_delete_their_own_draft_application()
    {
        Sanctum::actingAs($this->studentUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'draft'
        ]);

        $response = $this->deleteJson("/api/v1/admission-applications/{$application->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Admission application deleted successfully.']);

        $this->assertDatabaseMissing('admission_applications', ['id' => $application->id]);
    }

    /** @test */
    public function student_cannot_delete_submitted_application()
    {
        Sanctum::actingAs($this->studentUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'submitted'
        ]);

        $response = $this->deleteJson("/api/v1/admission-applications/{$application->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_any_application()
    {
        Sanctum::actingAs($this->adminUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'submitted'
        ]);

        $response = $this->deleteJson("/api/v1/admission-applications/{$application->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('admission_applications', ['id' => $application->id]);
    }

    /** @test */
    public function returns_404_for_non_existent_application()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/admission-applications/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function staff_can_list_all_applications()
    {
        Sanctum::actingAs($this->staffUser);

        AdmissionApplication::factory()->count(2)->create();

        $response = $this->getJson('/api/v1/admission-applications');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function staff_can_filter_applications_by_student()
    {
        Sanctum::actingAs($this->staffUser);

        $application1 = AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        $application2 = AdmissionApplication::factory()->create(['student_id' => $this->otherStudent->id]);

        $response = $this->getJson("/api/v1/admission-applications?student_id={$this->student->id}");

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment(['id' => $application1->id])
                 ->assertJsonMissing(['id' => $application2->id]);
    }

    /** @test */
    public function student_cannot_filter_by_student_id()
    {
        Sanctum::actingAs($this->studentUser);

        AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        AdmissionApplication::factory()->create(['student_id' => $this->otherStudent->id]);

        $response = $this->getJson("/api/v1/admission-applications?student_id={$this->otherStudent->id}");

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data'); // Should only see their own application
    }
}
