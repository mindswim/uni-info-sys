<?php

namespace Tests\Feature\Api\V1;

use App\Jobs\ProcessGradeImport;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GradeImportApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Queue::fake();
    }

    /** @test */
    public function unauthenticated_users_cannot_upload_grades()
    {
        $courseSection = CourseSection::factory()->create();
        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $response = $this->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
            'file' => $file,
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function only_assigned_instructor_can_upload_grades()
    {
        // Create instructor user with staff record
        $instructorUser = User::factory()->create();
        $instructorStaff = Staff::factory()->create(['user_id' => $instructorUser->id]);

        // Create other faculty user
        $otherFacultyUser = User::factory()->create();
        $otherFacultyStaff = Staff::factory()->create(['user_id' => $otherFacultyUser->id]);

        // Give both users the grades.upload permission
        $this->giveUserPermission($instructorUser, 'grades.upload');
        $this->giveUserPermission($otherFacultyUser, 'grades.upload');

        // Create course section assigned to instructor
        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $instructorStaff->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        // Test that assigned instructor can upload
        $response = $this->actingAs($instructorUser, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        $response->assertStatus(202);

        // Test that other faculty cannot upload
        $response = $this->actingAs($otherFacultyUser, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'You do not have permission to upload grades for this course section.',
            ]);
    }

    /** @test */
    public function admin_can_upload_grades_for_any_section()
    {
        // Create admin user
        $adminUser = User::factory()->create();
        $this->giveUserPermission($adminUser, 'enrollments.manage');
        $this->giveUserPermission($adminUser, 'grades.upload'); // Admin also needs this permission

        // Create instructor and course section
        $instructorStaff = Staff::factory()->create();
        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $instructorStaff->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $response = $this->actingAs($adminUser, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        $response->assertStatus(202);
    }

    /** @test */
    public function users_without_grades_upload_permission_cannot_upload()
    {
        // Create user without permission
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);

        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $staff->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function it_validates_file_upload_requirements()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $this->giveUserPermission($user, 'grades.upload');

        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $staff->id,
        ]);

        // Test missing file
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);

        // Test invalid file type
        $invalidFile = UploadedFile::fake()->create('grades.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $invalidFile,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);

        // Test file too large (> 5MB)
        $largeFile = UploadedFile::fake()->create('grades.csv', 6000, 'text/csv'); // 6MB

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $largeFile,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /** @test */
    public function it_accepts_valid_csv_file()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $this->giveUserPermission($user, 'grades.upload');

        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $staff->id,
            'course_id' => $course->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        $response->assertStatus(202)
            ->assertJsonStructure([
                'message',
                'import_id',
                'file_name',
                'course_section' => [
                    'id',
                    'course_code',
                    'section',
                ],
                'estimated_processing_time',
            ]);
    }

    /** @test */
    public function it_dispatches_grade_import_job()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $this->giveUserPermission($user, 'grades.upload');

        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $staff->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        Queue::assertPushed(ProcessGradeImport::class, function ($job) use ($user, $courseSection) {
            // Use reflection to access protected properties
            $reflection = new \ReflectionClass($job);
            $userIdProperty = $reflection->getProperty('userId');
            $userIdProperty->setAccessible(true);
            $courseSectionIdProperty = $reflection->getProperty('courseSectionId');
            $courseSectionIdProperty->setAccessible(true);

            return $userIdProperty->getValue($job) === $user->id &&
                   $courseSectionIdProperty->getValue($job) === $courseSection->id;
        });
    }

    /** @test */
    public function it_stores_file_in_correct_location()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $this->giveUserPermission($user, 'grades.upload');

        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $staff->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        // Check that file was stored in the imports/grades directory
        $files = Storage::disk('local')->files('imports/grades');
        $this->assertCount(1, $files);
        $this->assertStringStartsWith('imports/grades/import_grades_', $files[0]);
        $this->assertStringEndsWith('.csv', $files[0]);
    }

    /** @test */
    public function it_returns_404_for_nonexistent_course_section()
    {
        $user = User::factory()->create();
        $this->giveUserPermission($user, 'grades.upload');

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/course-sections/999/import-grades', [
                'file' => $file,
            ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function it_includes_course_information_in_response()
    {
        $user = User::factory()->create();
        $staff = Staff::factory()->create(['user_id' => $user->id]);
        $this->giveUserPermission($user, 'grades.upload');

        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create([
            'instructor_id' => $staff->id,
            'course_id' => $course->id,
        ]);

        $file = UploadedFile::fake()->create('grades.csv', 100, 'text/csv');

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/import-grades", [
                'file' => $file,
            ]);

        $response->assertStatus(202)
            ->assertJson([
                'course_section' => [
                    'id' => $courseSection->id,
                    'course_code' => 'CS101',
                    'section' => "Section {$courseSection->id}",
                ],
            ]);
    }

    /**
     * Helper method to give a user a specific permission
     */
    private function giveUserPermission(User $user, string $permissionName): void
    {
        $permission = Permission::firstOrCreate(['name' => $permissionName]);
        $role = Role::firstOrCreate(['name' => 'test_role_'.$user->id]); // Make role unique per user

        // Get existing permissions and add the new one
        $existingPermissionIds = $role->permissions()->pluck('permissions.id')->toArray();
        if (! in_array($permission->id, $existingPermissionIds)) {
            $existingPermissionIds[] = $permission->id;
        }

        $role->permissions()->sync($existingPermissionIds);
        $user->roles()->sync([$role->id]);
    }
}
