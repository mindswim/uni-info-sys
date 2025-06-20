<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Document;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test storage disk
        Storage::fake('public');
        
        // Run the role permission seeder
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    /** @test */
    public function admin_can_upload_document_for_student()
    {
        // Create admin user
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        
        // Create student
        $student = Student::factory()->create();
        
        // Create a fake PDF file
        $file = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file,
            ]);
        
        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'student_id',
                    'document_type',
                    'file_path',
                    'original_filename',
                    'mime_type',
                    'file_size',
                    'status',
                    'version',
                    'is_active',
                    'uploaded_at',
                    'created_at',
                    'updated_at'
                ]
            ]);
        
        // Verify document was created in database
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'transcript',
            'original_filename' => 'transcript.pdf',
            'mime_type' => 'application/pdf',
            'status' => 'pending',
            'version' => 1,
            'is_active' => true,
        ]);
        
        // Verify file was stored
        $document = Document::first();
        Storage::disk('public')->assertExists($document->file_path);
    }

    /** @test */
    public function student_can_upload_own_document()
    {
        // Create student user
        $user = User::factory()->create();
        $studentRole = Role::where('name', 'Student')->first();
        $user->roles()->attach($studentRole);
        $student = Student::factory()->create(['user_id' => $user->id]);
        
        // Create a fake DOC file
        $file = UploadedFile::fake()->create('essay.doc', 500, 'application/msword');
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'essay',
                'file' => $file,
            ]);
        
        $response->assertStatus(201);
        
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'essay',
            'original_filename' => 'essay.doc',
            'version' => 1,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function student_cannot_upload_document_for_another_student()
    {
        // Create two students
        $user1 = User::factory()->create();
        $studentRole = Role::where('name', 'Student')->first();
        $user1->roles()->attach($studentRole);
        $student1 = Student::factory()->create(['user_id' => $user1->id]);
        
        $user2 = User::factory()->create();
        $user2->roles()->attach($studentRole);
        $student2 = Student::factory()->create(['user_id' => $user2->id]);
        
        $file = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        
        // Student 1 tries to upload document for Student 2
        $response = $this->actingAs($user1, 'sanctum')
            ->postJson("/api/v1/students/{$student2->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file,
            ]);
        
        $response->assertStatus(403);
    }

    /** @test */
    public function file_upload_validation_works()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Test missing file
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
        
        // Test invalid file type
        $invalidFile = UploadedFile::fake()->create('image.jpg', 1000, 'image/jpeg');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $invalidFile,
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
        
        // Test file too large (over 5MB)
        $largeFile = UploadedFile::fake()->create('large.pdf', 6000, 'application/pdf');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $largeFile,
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
        
        // Test invalid document type
        $validFile = UploadedFile::fake()->create('doc.pdf', 1000, 'application/pdf');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'invalid_type',
                'file' => $validFile,
            ]);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['document_type']);
    }

    /** @test */
    public function admin_can_view_student_documents()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Create some documents for the student
        Document::factory()->count(3)->create(['student_id' => $student->id]);
        
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/documents");
        
        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function student_can_view_own_documents()
    {
        $user = User::factory()->create();
        $studentRole = Role::where('name', 'Student')->first();
        $user->roles()->attach($studentRole);
        $student = Student::factory()->create(['user_id' => $user->id]);
        
        // Create some documents for the student
        Document::factory()->count(2)->create(['student_id' => $student->id]);
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/documents");
        
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function admin_can_update_document_type()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        
        $document = Document::factory()->create();
        
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/documents/{$document->id}", [
                'document_type' => 'certificate',
            ]);
        
        $response->assertStatus(200);
        
        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'document_type' => 'certificate',
        ]);
    }

    /** @test */
    public function admin_can_delete_document()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        
        $document = Document::factory()->create([
            'file_path' => 'documents/test.pdf'
        ]);
        
        // Create the fake file
        Storage::disk('public')->put($document->file_path, 'fake content');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/documents/{$document->id}");
        
        $response->assertStatus(200);
        
        $this->assertDatabaseMissing('documents', [
            'id' => $document->id,
        ]);
        
        // Verify file was deleted
        Storage::disk('public')->assertMissing($document->file_path);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_documents()
    {
        $student = Student::factory()->create();
        
        $response = $this->getJson("/api/v1/students/{$student->id}/documents");
        
        $response->assertStatus(401);
    }

    /** @test */
    public function first_document_upload_creates_version_1()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        $file = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file,
            ]);
        
        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Document uploaded successfully',
                'data' => [
                    'version' => 1,
                    'is_active' => true,
                ]
            ]);
        
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'transcript',
            'version' => 1,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function second_document_upload_creates_version_2_and_deactivates_version_1()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Upload first document
        $file1 = UploadedFile::fake()->create('transcript_v1.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file1,
            ]);
        
        // Upload second document of same type
        $file2 = UploadedFile::fake()->create('transcript_v2.pdf', 1000, 'application/pdf');
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file2,
            ]);
        
        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Document uploaded successfully (version 2)',
                'data' => [
                    'version' => 2,
                    'is_active' => true,
                ]
            ]);
        
        // Assert version 1 is now inactive
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'transcript',
            'version' => 1,
            'is_active' => false,
        ]);
        
        // Assert version 2 is active
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'transcript',
            'version' => 2,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function different_document_types_have_independent_versioning()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Upload transcript
        $transcript = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $transcript,
            ]);
        
        // Upload essay
        $essay = UploadedFile::fake()->create('essay.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'essay',
                'file' => $essay,
            ]);
        
        // Upload second transcript
        $transcript2 = UploadedFile::fake()->create('transcript_v2.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $transcript2,
            ]);
        
        // Verify transcript is at version 2
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'transcript',
            'version' => 2,
            'is_active' => true,
        ]);
        
        // Verify essay is still at version 1
        $this->assertDatabaseHas('documents', [
            'student_id' => $student->id,
            'document_type' => 'essay',
            'version' => 1,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function student_documents_endpoint_only_returns_active_versions()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Upload two versions of transcript
        $file1 = UploadedFile::fake()->create('transcript_v1.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file1,
            ]);
        
        $file2 = UploadedFile::fake()->create('transcript_v2.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file2,
            ]);
        
        // Get documents
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/documents");
        
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data') // Only active version
            ->assertJson([
                'data' => [
                    [
                        'version' => 2,
                        'is_active' => true,
                    ]
                ]
            ]);
    }

    /** @test */
    public function admin_can_view_all_document_versions()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Upload two versions of transcript
        $file1 = UploadedFile::fake()->create('transcript_v1.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file1,
            ]);
        
        $file2 = UploadedFile::fake()->create('transcript_v2.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file2,
            ]);
        
        // Get all versions
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/documents/all-versions");
        
        $response->assertStatus(200)
            ->assertJsonCount(2, 'data') // Both versions
            ->assertJson([
                'data' => [
                    [
                        'version' => 2,
                        'is_active' => true,
                    ],
                    [
                        'version' => 1,
                        'is_active' => false,
                    ]
                ]
            ]);
    }

    /** @test */
    public function non_admin_cannot_view_all_document_versions()
    {
        $user = User::factory()->create();
        $studentRole = Role::where('name', 'Student')->first();
        $user->roles()->attach($studentRole);
        $student = Student::factory()->create(['user_id' => $user->id]);
        
        // Upload a document
        $file = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file,
            ]);
        
        // Try to get all versions as student
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/students/{$student->id}/documents/all-versions");
        
        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Admin access required to view all document versions.'
            ]);
    }

    /** @test */
    public function document_filename_includes_version_number()
    {
        $admin = User::factory()->create();
        $adminRole = Role::where('name', 'Admin')->first();
        $admin->roles()->attach($adminRole);
        $student = Student::factory()->create();
        
        // Upload two versions
        $file1 = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file1,
            ]);
        
        $file2 = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/students/{$student->id}/documents", [
                'document_type' => 'transcript',
                'file' => $file2,
            ]);
        
        // Check that stored filenames include version numbers
        $documents = Document::where('student_id', $student->id)->get();
        
        $this->assertStringContainsString('_v1_', $documents->where('version', 1)->first()->file_path);
        $this->assertStringContainsString('_v2_', $documents->where('version', 2)->first()->file_path);
    }
}
