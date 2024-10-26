<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Document;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $student;

    protected function setUp(): void
    {
        parent::setUp();
        
        Storage::fake('documents');
        
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        
        $this->student = Student::factory()->create();
    }

    public function test_can_get_student_documents(): void
    {
        Document::factory()->count(3)->create([
            'student_id' => $this->student->id
        ]);

        $response = $this->getJson("/students/{$this->student->id}/documents");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_upload_document(): void
    {
        $file = UploadedFile::fake()->create('transcript.pdf', 1024);

        $response = $this->postJson("/students/{$this->student->id}/documents", [
            'document_type' => 'transcript',
            'file' => $file,
            'status' => 'pending'
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'document_type' => 'transcript',
                'status' => 'pending'
            ]);

        Storage::disk('documents')->assertExists($response->json('file_path'));
    }

    public function test_can_show_document(): void
    {
        $document = Document::factory()->create([
            'student_id' => $this->student->id
        ]);

        $response = $this->getJson("/students/{$this->student->id}/documents/{$document->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $document->id,
                'document_type' => $document->document_type
            ]);
    }

    public function test_can_update_document_status(): void
    {
        $document = Document::factory()->create([
            'student_id' => $this->student->id
        ]);

        $response = $this->putJson("/students/{$this->student->id}/documents/{$document->id}", [
            'status' => 'approved',
            'verified' => true
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'status' => 'approved',
                'verified' => true
            ])
            ->assertJsonPath('verified_at', fn ($value) => !is_null($value));
    }

    public function test_can_delete_document(): void
    {
        Storage::fake('documents');

        $document = Document::factory()->create([
            'student_id' => $this->student->id,
            'file_path' => 'test.pdf'
        ]);

        // Create a fake file
        Storage::disk('documents')->put($document->file_path, 'test content');

        $response = $this->deleteJson(
            "/students/{$this->student->id}/documents/{$document->id}"
        );

        $response->assertStatus(204);
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
        Storage::disk('documents')->assertMissing($document->file_path);
    }

    public function test_validate_required_fields_for_upload(): void
    {
        $response = $this->postJson(
            "/students/{$this->student->id}/documents",
            []
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'document_type',
                'file',
                'status'
            ]);
    }

    public function test_cannot_access_other_student_documents(): void
    {
        $otherStudent = Student::factory()->create();
        $document = Document::factory()->create([
            'student_id' => $otherStudent->id
        ]);

        $response = $this->getJson(
            "/students/{$this->student->id}/documents/{$document->id}"
        );

        $response->assertStatus(404);
    }

    public function test_validate_file_type_and_size(): void
    {
        $file = UploadedFile::fake()->create('document.exe', 1024);

        $response = $this->postJson("/students/{$this->student->id}/documents", [
            'document_type' => 'transcript',
            'file' => $file,
            'status' => 'pending'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);

        // Test file too large
        $file = UploadedFile::fake()->create('document.pdf', 11000); // > 10MB

        $response = $this->postJson("/students/{$this->student->id}/documents", [
            'document_type' => 'transcript',
            'file' => $file,
            'status' => 'pending'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }
}
