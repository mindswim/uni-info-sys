<?php

namespace Tests\Feature\Api\V1;

use App\Models\Document;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentVerificationTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $studentUser;
    private Student $student;
    private Document $document;

    protected function setUp(): void
    {
        parent::setUp();

        $this->studentUser = User::factory()->create(['email_verified_at' => now()]);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);

        $this->document = Document::factory()->create([
            'student_id' => $this->student->id,
            'status' => 'pending',
            'verified' => false,
            'verified_at' => null,
        ]);

        $this->adminUser = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $this->adminUser->roles()->attach($adminRole);
    }

    public function test_admin_can_verify_document(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson(
            "/api/v1/students/{$this->student->id}/documents/{$this->document->id}/verify"
        );

        $response->assertStatus(200);
        $this->document->refresh();
        $this->assertEquals('approved', $this->document->status);
        $this->assertEquals(1, $this->document->verified);
        $this->assertNotNull($this->document->verified_at);
    }

    public function test_admin_can_reject_document(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson(
            "/api/v1/students/{$this->student->id}/documents/{$this->document->id}/reject",
            ['reason' => 'Illegible scan']
        );

        $response->assertStatus(200);
        $this->document->refresh();
        $this->assertEquals('rejected', $this->document->status);
        $this->assertEquals(0, $this->document->verified);
    }

    public function test_student_cannot_verify_document(): void
    {
        $studentRole = Role::factory()->create(['name' => 'student']);
        $this->studentUser->roles()->attach($studentRole);
        Sanctum::actingAs($this->studentUser);

        $response = $this->postJson(
            "/api/v1/students/{$this->student->id}/documents/{$this->document->id}/verify"
        );

        $response->assertStatus(403);
    }

    public function test_verify_wrong_student_returns_404(): void
    {
        $otherStudent = Student::factory()->create();

        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson(
            "/api/v1/students/{$otherStudent->id}/documents/{$this->document->id}/verify"
        );

        $response->assertStatus(404);
    }

    public function test_staff_can_verify_document(): void
    {
        $staffUser = User::factory()->create();
        $staffRole = Role::factory()->create(['name' => 'staff']);
        $staffUser->roles()->attach($staffRole);

        Sanctum::actingAs($staffUser);

        $response = $this->postJson(
            "/api/v1/students/{$this->student->id}/documents/{$this->document->id}/verify"
        );

        $response->assertStatus(200);
    }
}
