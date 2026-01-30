<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Document;
use App\Models\AdmissionApplication;
use App\Models\Term;
use Laravel\Sanctum\Sanctum;
use App\Models\Role;
use Tests\Traits\CreatesUsersWithRoles;

class SoftDeletesTest extends TestCase
{
    use RefreshDatabase, WithFaker, CreatesUsersWithRoles;

    protected $adminUser;
    protected $studentUser;
    protected $student;
    protected $term;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = $this->createAdminUser();
        $this->studentUser = $this->createStudentUser();
        $this->student = $this->studentUser->student;

        $this->term = Term::factory()->create();
    }

    /** @test */
    public function admin_can_soft_delete_and_restore_student()
    {
        Sanctum::actingAs($this->adminUser);

        // Soft delete student
        $response = $this->deleteJson("/api/v1/students/{$this->student->id}");
        $response->assertStatus(204);

        // Verify student is soft deleted
        $this->assertSoftDeleted('students', ['id' => $this->student->id]);

        // Restore student
        $response = $this->postJson("/api/v1/students/{$this->student->id}/restore");
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Student restored successfully']);

        // Verify student is restored
        $this->assertDatabaseHas('students', ['id' => $this->student->id, 'deleted_at' => null]);
    }

    /** @test */
    public function admin_can_force_delete_student()
    {
        Sanctum::actingAs($this->adminUser);

        // Soft delete first
        $this->student->delete();

        // Force delete
        $response = $this->deleteJson("/api/v1/students/{$this->student->id}/force");
        $response->assertStatus(204);

        // Verify student is permanently deleted
        $this->assertDatabaseMissing('students', ['id' => $this->student->id]);
    }

    /** @test */
    public function admin_can_soft_delete_and_restore_course()
    {
        Sanctum::actingAs($this->adminUser);

        $course = Course::factory()->create();

        // Soft delete course
        $response = $this->deleteJson("/api/v1/courses/{$course->id}");
        $response->assertStatus(204);

        // Verify course is soft deleted
        $this->assertSoftDeleted('courses', ['id' => $course->id]);

        // Restore course
        $response = $this->postJson("/api/v1/courses/{$course->id}/restore");
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Course restored successfully']);

        // Verify course is restored
        $this->assertDatabaseHas('courses', ['id' => $course->id, 'deleted_at' => null]);
    }

    /** @test */
    public function admin_can_soft_delete_and_restore_enrollment()
    {
        Sanctum::actingAs($this->adminUser);

        // Create a term with proper deadline to avoid deadline validation
        $term = Term::factory()->create([
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'add_drop_deadline' => now()->addWeeks(4), // Future deadline to allow withdrawal
        ]);
        
        $courseSection = CourseSection::factory()->create(['term_id' => $term->id]);
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $courseSection->id
        ]);

        // "Soft delete" enrollment (sets status to withdrawn)
        $response = $this->deleteJson("/api/v1/enrollments/{$enrollment->id}");
        $response->assertStatus(200); // Returns 200 with message for enrollments

        // Verify enrollment status is withdrawn (not soft deleted)
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id, 
            'status' => 'withdrawn',
            'deleted_at' => null
        ]);

        // For enrollment, restore means changing status back to enrolled
        // This test is conceptual since enrollment restore via status change would need special logic
        // Let's test the actual soft delete restore functionality instead
        $enrollment->delete(); // Actually soft delete
        $this->assertSoftDeleted('enrollments', ['id' => $enrollment->id]);

        // Restore enrollment
        $response = $this->postJson("/api/v1/enrollments/{$enrollment->id}/restore");
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Enrollment restored successfully']);

        // Verify enrollment is restored
        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id, 'deleted_at' => null]);
    }

    /** @test */
    public function admin_can_soft_delete_and_restore_document()
    {
        Sanctum::actingAs($this->adminUser);

        $document = Document::factory()->create(['student_id' => $this->student->id]);

        // Soft delete document
        $response = $this->deleteJson("/api/v1/documents/{$document->id}");
        $response->assertStatus(200);

        // Verify document is soft deleted
        $this->assertSoftDeleted('documents', ['id' => $document->id]);

        // Restore document
        $response = $this->postJson("/api/v1/documents/{$document->id}/restore");
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Document restored successfully']);

        // Verify document is restored
        $this->assertDatabaseHas('documents', ['id' => $document->id, 'deleted_at' => null]);
    }

    /** @test */
    public function admin_can_soft_delete_and_restore_admission_application()
    {
        Sanctum::actingAs($this->adminUser);

        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $this->term->id
        ]);

        // Soft delete application
        $response = $this->deleteJson("/api/v1/admission-applications/{$application->id}");
        $response->assertStatus(200);

        // Verify application is soft deleted
        $this->assertSoftDeleted('admission_applications', ['id' => $application->id]);

        // Restore application
        $response = $this->postJson("/api/v1/admission-applications/{$application->id}/restore");
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Admission application restored successfully']);

        // Verify application is restored
        $this->assertDatabaseHas('admission_applications', ['id' => $application->id, 'deleted_at' => null]);
    }

    /** @test */
    public function non_admin_cannot_restore_resources()
    {
        Sanctum::actingAs($this->studentUser);

        $course = Course::factory()->create();
        $course->delete();

        // Try to restore course as student
        $response = $this->postJson("/api/v1/courses/{$course->id}/restore");
        $response->assertStatus(403);
    }

    /** @test */
    public function non_admin_cannot_force_delete_resources()
    {
        Sanctum::actingAs($this->studentUser);

        $course = Course::factory()->create();
        $course->delete();

        // Try to force delete course as student
        $response = $this->deleteJson("/api/v1/courses/{$course->id}/force");
        $response->assertStatus(403);
    }

    /** @test */
    public function restore_endpoints_return_404_for_non_existent_resources()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson("/api/v1/students/999/restore");
        $response->assertStatus(404);

        $response = $this->postJson("/api/v1/courses/999/restore");
        $response->assertStatus(404);

        $response = $this->postJson("/api/v1/enrollments/999/restore");
        $response->assertStatus(404);

        $response = $this->postJson("/api/v1/documents/999/restore");
        $response->assertStatus(404);

        $response = $this->postJson("/api/v1/admission-applications/999/restore");
        $response->assertStatus(404);
    }

    /** @test */
    public function force_delete_endpoints_return_404_for_non_existent_resources()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson("/api/v1/students/999/force");
        $response->assertStatus(404);

        $response = $this->deleteJson("/api/v1/courses/999/force");
        $response->assertStatus(404);

        $response = $this->deleteJson("/api/v1/enrollments/999/force");
        $response->assertStatus(404);

        $response = $this->deleteJson("/api/v1/documents/999/force");
        $response->assertStatus(404);

        $response = $this->deleteJson("/api/v1/admission-applications/999/force");
        $response->assertStatus(404);
    }

    /** @test */
    public function soft_deleted_resources_are_not_visible_in_normal_queries()
    {
        Sanctum::actingAs($this->adminUser);

        $course = Course::factory()->create();
        $document = Document::factory()->create(['student_id' => $this->student->id]);
        $application = AdmissionApplication::factory()->create([
            'student_id' => $this->student->id,
            'term_id' => $this->term->id
        ]);

        // Soft delete all resources (except enrollment which uses business logic)
        $this->student->delete();
        $course->delete();
        $document->delete();
        $application->delete();
        // Note: Enrollment uses status='withdrawn' not soft deletes for business reasons

        // Verify they don't appear in index endpoints
        $response = $this->getJson('/api/v1/students');
        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));

        $response = $this->getJson('/api/v1/courses');
        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));

        $response = $this->getJson('/api/v1/admission-applications');
        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));
    }

    /** @test */
    public function models_have_soft_deletes_trait()
    {
        $this->assertTrue(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses(Student::class)));
        $this->assertTrue(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses(Course::class)));
        $this->assertTrue(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses(Enrollment::class)));
        $this->assertTrue(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses(Document::class)));
        $this->assertTrue(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses(AdmissionApplication::class)));
    }
} 