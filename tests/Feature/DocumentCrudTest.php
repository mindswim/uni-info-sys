<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Document;
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
    }

    /** @test */
    public function admin_can_upload_document_for_student()
    {
        // Create admin user
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
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
            'status' => 'pending'
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
        $user->assignRole('student');
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
            'original_filename' => 'essay.doc'
        ]);
    }

    /** @test */
    public function student_cannot_upload_document_for_another_student()
    {
        // Create two students
        $user1 = User::factory()->create();
        $user1->assignRole('student');
        $student1 = Student::factory()->create(['user_id' => $user1->id]);
        
        $user2 = User::factory()->create();
        $user2->assignRole('student');
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
        $admin->assignRole('admin');
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
        $admin->assignRole('admin');
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
        $user->assignRole('student');
        $student = Student::factory()->create(['user_id' => $user->id]);
        
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
        $admin->assignRole('admin');
        $document = Document::factory()->create(['document_type' => 'essay']);
        
        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/documents/{$document->id}", [
                'document_type' => 'transcript',
            ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Document updated successfully',
                'data' => [
                    'document_type' => 'transcript'
                ]
            ]);
        
        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'document_type' => 'transcript'
        ]);
    }

    /** @test */
    public function admin_can_delete_document()
    {
        Storage::fake('public');
        
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        
        // Create document with actual file
        $document = Document::factory()->create([
            'file_path' => 'documents/test.pdf'
        ]);
        
        // Create the fake file
        Storage::disk('public')->put($document->file_path, 'fake content');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/documents/{$document->id}");
        
        $response->assertStatus(200)
            ->assertJson(['message' => 'Document deleted successfully']);
        
        // Verify document was deleted from database
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
        
        // Verify file was deleted from storage
        Storage::disk('public')->assertMissing($document->file_path);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_documents()
    {
        $student = Student::factory()->create();
        
        $response = $this->getJson("/api/v1/students/{$student->id}/documents");
        $response->assertStatus(401);
        
        $file = UploadedFile::fake()->create('doc.pdf', 1000, 'application/pdf');
        $response = $this->postJson("/api/v1/students/{$student->id}/documents", [
            'document_type' => 'transcript',
            'file' => $file,
        ]);
        $response->assertStatus(401);
    }
}
