<?php

namespace Tests\Feature;

use App\Models\ClassSession;
use App\Models\CourseMaterial;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseMaterialTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $studentUser;

    protected Student $student;

    protected CourseSection $courseSection;

    protected Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        // Create admin user
        $this->adminUser = User::factory()->create();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        $this->adminUser->roles()->attach($adminRole);

        // Create course section
        $this->courseSection = CourseSection::factory()->create();

        // Create student with enrollment
        $this->studentUser = User::factory()->create();
        $studentRole = \App\Models\Role::where('name', 'student')->first();
        $this->studentUser->roles()->attach($studentRole);

        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
        $this->enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_can_create_course_material(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/course-materials', [
                'course_section_id' => $this->courseSection->id,
                'title' => 'Course Syllabus',
                'type' => 'syllabus',
                'content' => 'This is the syllabus content.',
                'is_published' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Course material created successfully.',
            ]);

        $this->assertDatabaseHas('course_materials', [
            'course_section_id' => $this->courseSection->id,
            'title' => 'Course Syllabus',
            'type' => 'syllabus',
        ]);
    }

    public function test_can_create_material_linked_to_session(): void
    {
        $session = ClassSession::factory()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/course-materials', [
                'course_section_id' => $this->courseSection->id,
                'class_session_id' => $session->id,
                'title' => 'Lecture 1 Notes',
                'type' => 'lecture_notes',
                'content' => 'Notes for this session.',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('course_materials', [
            'class_session_id' => $session->id,
            'title' => 'Lecture 1 Notes',
        ]);
    }

    public function test_cannot_link_session_from_different_section(): void
    {
        $otherSection = CourseSection::factory()->create();
        $session = ClassSession::factory()->create([
            'course_section_id' => $otherSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/course-materials', [
                'course_section_id' => $this->courseSection->id,
                'class_session_id' => $session->id,
                'title' => 'Test Material',
                'type' => 'file',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Class session does not belong to the specified course section.',
            ]);
    }

    public function test_can_update_course_material(): void
    {
        $material = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/course-materials/{$material->id}", [
                'title' => 'Updated Title',
                'description' => 'New description',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Course material updated successfully.',
            ]);

        $material->refresh();
        $this->assertEquals('Updated Title', $material->title);
        $this->assertEquals('New description', $material->description);
    }

    public function test_can_delete_course_material(): void
    {
        $material = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/course-materials/{$material->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Course material deleted successfully.',
            ]);

        $this->assertDatabaseMissing('course_materials', [
            'id' => $material->id,
        ]);
    }

    public function test_can_list_materials_for_course_section(): void
    {
        CourseMaterial::factory()->count(3)->published()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$this->courseSection->id}/materials");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_filter_materials_by_type(): void
    {
        CourseMaterial::factory()->syllabus()->create([
            'course_section_id' => $this->courseSection->id,
        ]);
        CourseMaterial::factory()->reading()->count(2)->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$this->courseSection->id}/materials?type=reading");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_get_syllabus(): void
    {
        CourseMaterial::factory()->syllabus()->published()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$this->courseSection->id}/syllabus");

        $response->assertStatus(200)
            ->assertJsonPath('data.type', 'syllabus');
    }

    public function test_can_publish_material(): void
    {
        $material = CourseMaterial::factory()->draft()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/course-materials/{$material->id}/publish");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Course material published successfully.',
            ]);

        $material->refresh();
        $this->assertTrue($material->is_published);
    }

    public function test_can_unpublish_material(): void
    {
        $material = CourseMaterial::factory()->published()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/course-materials/{$material->id}/unpublish");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Course material unpublished successfully.',
            ]);

        $material->refresh();
        $this->assertFalse($material->is_published);
    }

    public function test_student_can_view_own_course_materials(): void
    {
        CourseMaterial::factory()->published()->count(2)->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/v1/course-materials/me');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_student_can_view_materials_for_enrolled_course(): void
    {
        CourseMaterial::factory()->published()->count(3)->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$this->courseSection->id}/materials/me");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_student_cannot_view_materials_for_non_enrolled_course(): void
    {
        $otherSection = CourseSection::factory()->create();
        CourseMaterial::factory()->published()->create([
            'course_section_id' => $otherSection->id,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$otherSection->id}/materials/me");

        $response->assertStatus(403);
    }

    public function test_can_get_materials_for_session(): void
    {
        $session = ClassSession::factory()->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        CourseMaterial::factory()->available()->count(2)->create([
            'course_section_id' => $this->courseSection->id,
            'class_session_id' => $session->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/class-sessions/{$session->id}/materials");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_reorder_materials(): void
    {
        $material1 = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'sort_order' => 0,
        ]);
        $material2 = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'sort_order' => 1,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/course-materials/reorder', [
                'materials' => [
                    ['id' => $material1->id, 'sort_order' => 1],
                    ['id' => $material2->id, 'sort_order' => 0],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Materials reordered successfully.',
            ]);

        $material1->refresh();
        $material2->refresh();
        $this->assertEquals(1, $material1->sort_order);
        $this->assertEquals(0, $material2->sort_order);
    }

    public function test_can_get_material_types(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/course-materials/types');

        $response->assertStatus(200)
            ->assertJson([
                'data' => CourseMaterial::TYPES,
            ]);
    }

    public function test_model_checks_availability(): void
    {
        // Published and no available_from - should be available
        $available = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'available_from' => null,
        ]);

        // Published with past available_from - should be available
        $availablePast = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'available_from' => now()->subDay(),
        ]);

        // Published with future available_from - should not be available
        $scheduled = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'available_from' => now()->addDay(),
        ]);

        // Unpublished - should not be available
        $draft = CourseMaterial::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => false,
        ]);

        $this->assertTrue($available->isAvailable());
        $this->assertTrue($availablePast->isAvailable());
        $this->assertFalse($scheduled->isAvailable());
        $this->assertFalse($draft->isAvailable());
    }
}
