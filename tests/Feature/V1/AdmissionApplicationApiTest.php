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
                 ->assertJson(['detail' => 'Unauthenticated.']);
    }

    /** @test */
    public function admin_can_list_all_applications()
    {
        // Create or get existing term
        $term = Term::firstOrCreate(
            ['academic_year' => 2031, 'semester' => 'Summer'],
            [
                'name' => 'Summer 2031',
                'start_date' => '2031-06-01',
                'end_date' => '2031-08-15',
                'add_drop_deadline' => '2031-06-15'
            ]
        );

        AdmissionApplication::factory()->count(3)->create([
            'term_id' => $term->id
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admission-applications');

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
                'links',
                'meta'
            ]);
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
                 ->assertJsonCount(1, 'data');
        
        // Get the actual data array
        $data = $response->json('data');
        
        // Assert we only see our own application
        $this->assertEquals(1, count($data));
        $this->assertEquals($ownApplication->id, $data[0]['id']);
        $this->assertEquals($this->student->id, $data[0]['student_id']);
    }

    /** @test */
    public function can_filter_applications_by_status()
    {
        // Create or get existing terms
        $term1 = Term::firstOrCreate(
            ['academic_year' => 2034, 'semester' => 'Summer'],
            [
                'name' => 'Summer 2034',
                'start_date' => '2034-06-01',
                'end_date' => '2034-08-15',
                'add_drop_deadline' => '2034-06-15'
            ]
        );
        
        $term2 = Term::firstOrCreate(
            ['academic_year' => 2035, 'semester' => 'Fall'],
            [
                'name' => 'Fall 2035',
                'start_date' => '2035-09-01',
                'end_date' => '2035-12-20',
                'add_drop_deadline' => '2035-09-15'
            ]
        );

        AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term1->id,
            'status' => 'draft'
        ]);

        AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term2->id,
            'status' => 'submitted'
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admission-applications?status=submitted');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJson([
                'data' => [
                    ['status' => 'submitted']
                ]
            ]);
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

        // Create or get existing term to avoid unique constraint violations
        $term = Term::firstOrCreate(
            ['academic_year' => 2033, 'semester' => 'Fall'],
            [
                'name' => 'Fall 2033',
                'start_date' => '2033-09-01',
                'end_date' => '2033-12-20',
                'add_drop_deadline' => '2033-09-15'
            ]
        );

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term->id,
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

        $this->assertSoftDeleted('admission_applications', ['id' => $application->id]);
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
        // Create or get existing term
        $term = Term::firstOrCreate(
            ['academic_year' => 2029, 'semester' => 'Spring'],
            [
                'name' => 'Spring 2029',
                'start_date' => '2029-01-15',
                'end_date' => '2029-05-10',
                'add_drop_deadline' => '2029-01-29'
            ]
        );

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term->id
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admission-applications/{$application->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Admission application deleted successfully.'
            ]);
        $this->assertSoftDeleted('admission_applications', ['id' => $application->id]);
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

        // Use firstOrCreate to avoid duplicate constraint violations
        $term = Term::firstOrCreate(
            ['academic_year' => 2035, 'semester' => 'Summer'],
            [
                'name' => 'Summer 2035',
                'start_date' => '2035-06-01',
                'end_date' => '2035-08-15',
                'add_drop_deadline' => '2035-06-15'
            ]
        );

        $application1 = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term->id
        ]);
        
        $application2 = AdmissionApplication::factory()->create([
            'student_id' => $this->otherStudent->id,
            'term_id' => $term->id
        ]);

        $response = $this->getJson("/api/v1/admission-applications?student_id={$this->student->id}");

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment(['id' => $application1->id])
                 ->assertJsonMissing(['id' => $application2->id]);
    }

    /** @test */
    public function student_cannot_filter_by_student_id()
    {
        // Use firstOrCreate to avoid duplicate constraint violations
        $term = Term::firstOrCreate(
            ['academic_year' => 2031, 'semester' => 'Fall'],
            [
                'name' => 'Fall 2031',
                'start_date' => '2031-09-01',
                'end_date' => '2031-12-20',
                'add_drop_deadline' => '2031-09-15'
            ]
        );

        $otherStudent = Student::factory()->create();
        
        AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $term->id
        ]);

        AdmissionApplication::factory()->create([
            'student_id' => $otherStudent->id,
            'term_id' => $term->id
        ]);

        // Student tries to filter by another student's ID
        $response = $this->actingAs($this->student->user, 'sanctum')
            ->getJson("/api/v1/admission-applications?student_id={$otherStudent->id}");

        // Should only see their own applications, not filtered by the requested student_id
        $response->assertStatus(200);
        
        $applications = $response->json('data');
        $this->assertCount(1, $applications);
        $this->assertEquals($this->student->id, $applications[0]['student_id']);
    }
}
