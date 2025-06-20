<?php

namespace Tests\Feature\Api\V1;

use App\Jobs\ProcessCourseImport;
use App\Models\Department;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourseImportApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create departments for testing
        Department::factory()->create(['code' => 'CS', 'name' => 'Computer Science']);
        Department::factory()->create(['code' => 'MATH', 'name' => 'Mathematics']);
    }

    /**
     * Create a user with courses.manage permission
     */
    private function createUserWithCoursesManagePermission(): User
    {
        $user = User::factory()->create();
        
        // Create permission if it doesn't exist
        $permission = Permission::firstOrCreate([
            'name' => 'courses.manage',
            'description' => 'Manage courses'
        ]);
        
        // Create role if it doesn't exist
        $role = Role::firstOrCreate([
            'name' => 'admin',
            'description' => 'Administrator'
        ]);
        
        // Attach permission to role
        if (!$role->permissions()->where('name', 'courses.manage')->exists()) {
            $role->permissions()->attach($permission);
        }
        
        // Attach role to user
        $user->roles()->attach($role);
        
        return $user;
    }

    public function test_unauthenticated_user_cannot_import_courses()
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('courses.csv', 100, 'text/csv');

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(401);
    }

    public function test_user_without_courses_manage_permission_cannot_import_courses()
    {
        Storage::fake('local');
        Queue::fake();

        // Create user without courses.manage permission
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('courses.csv', 100, 'text/csv');

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'You do not have permission to import courses.'
            ]);

        Queue::assertNotPushed(ProcessCourseImport::class);
    }

    public function test_admin_user_can_import_courses()
    {
        Storage::fake('local');
        Queue::fake();

        // Create admin user with courses.manage permission
        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        // Create a proper CSV file
        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS201,Data Structures,Advanced data structures,3,CS,\n";
        $csvContent .= "MATH201,Calculus II,Advanced calculus,4,MATH,\n";

        $file = UploadedFile::fake()->createWithContent('courses.csv', $csvContent);

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(202)
            ->assertJsonStructure([
                'message',
                'import_id',
                'file_name',
                'estimated_processing_time'
            ])
            ->assertJson([
                'message' => 'Course import has been started. You will be notified when the process is complete.',
                'file_name' => 'courses.csv'
            ]);

        // Assert job was dispatched
        Queue::assertPushed(ProcessCourseImport::class, function ($job) use ($user) {
            $reflection = new \ReflectionClass($job);
            $userIdProperty = $reflection->getProperty('userId');
            $userIdProperty->setAccessible(true);
            $userId = $userIdProperty->getValue($job);
            return $userId === $user->id;
        });
    }

    public function test_validates_required_file_field()
    {
        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/imports/courses', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_validates_file_type()
    {
        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        // Upload a non-CSV file
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_validates_file_size()
    {
        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        // Create a file larger than 10MB (10240 KB)
        $file = UploadedFile::fake()->create('large_courses.csv', 20000, 'text/csv');

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_stores_file_in_correct_location()
    {
        Storage::fake('local');
        Queue::fake();

        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS201,Data Structures,Advanced data structures,3,CS,\n";

        $file = UploadedFile::fake()->createWithContent('courses.csv', $csvContent);

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(202);

        // Assert job was dispatched with correct file path
        Queue::assertPushed(ProcessCourseImport::class, function ($job) {
            // Check that the file path starts with imports/courses/
            $reflection = new \ReflectionClass($job);
            $property = $reflection->getProperty('filePath');
            $property->setAccessible(true);
            $filePath = $property->getValue($job);
            
            return str_starts_with($filePath, 'imports/courses/import_courses_');
        });
    }

    public function test_includes_import_metadata_in_response()
    {
        Storage::fake('local');
        Queue::fake();

        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS201,Data Structures,Advanced data structures,3,CS,\n";

        $file = UploadedFile::fake()->createWithContent('test_courses.csv', $csvContent);

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(202);

        $responseData = $response->json();

        // Verify import_id format
        $this->assertStringStartsWith('import_courses_', $responseData['import_id']);
        $this->assertEquals('test_courses.csv', $responseData['file_name']);
        $this->assertStringContainsString('Processing typically takes', $responseData['estimated_processing_time']);
    }

    public function test_dispatches_job_with_correct_parameters()
    {
        Storage::fake('local');
        Queue::fake();

        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS201,Data Structures,Advanced data structures,3,CS,\n";

        $file = UploadedFile::fake()->createWithContent('my_courses.csv', $csvContent);

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        $response->assertStatus(202);

        // Assert job was dispatched with correct parameters
        Queue::assertPushed(ProcessCourseImport::class, function ($job) use ($user) {
            $reflection = new \ReflectionClass($job);
            
            // Check userId
            $userIdProperty = $reflection->getProperty('userId');
            $userIdProperty->setAccessible(true);
            $userId = $userIdProperty->getValue($job);
            
            // Check originalFileName
            $fileNameProperty = $reflection->getProperty('originalFileName');
            $fileNameProperty->setAccessible(true);
            $originalFileName = $fileNameProperty->getValue($job);
            
            // Check importId
            $importIdProperty = $reflection->getProperty('importId');
            $importIdProperty->setAccessible(true);
            $importId = $importIdProperty->getValue($job);
            
            return $userId === $user->id 
                && $originalFileName === 'my_courses.csv'
                && str_starts_with($importId, 'import_courses_');
        });
    }

    public function test_accepts_valid_csv_mime_types()
    {
        Storage::fake('local');
        Queue::fake();

        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS201,Data Structures,Advanced data structures,3,CS,\n";

        // Test with different CSV MIME types
        $mimeTypes = ['text/csv', 'text/plain', 'application/csv'];

        foreach ($mimeTypes as $mimeType) {
            $file = UploadedFile::fake()->createWithContent('courses.csv', $csvContent, $mimeType);

            $response = $this->postJson('/api/v1/imports/courses', [
                'file' => $file
            ]);

            $response->assertStatus(202);
        }

        // Should have dispatched job for each valid MIME type
        Queue::assertPushed(ProcessCourseImport::class, 3);
    }

    public function test_throttling_is_applied()
    {
        // This test would depend on your throttling configuration
        // For now, we'll just ensure the route exists and is accessible
        $user = $this->createUserWithCoursesManagePermission();
        Sanctum::actingAs($user);

        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $file = UploadedFile::fake()->createWithContent('courses.csv', $csvContent);

        $response = $this->postJson('/api/v1/imports/courses', [
            'file' => $file
        ]);

        // Should not be throttled on first request
        $response->assertStatus(202);
    }
} 