<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $studentUser;

    protected User $staffUser;

    protected Student $student;

    protected Staff $staff;

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

        // Create staff user
        $this->staffUser = User::factory()->create();
        $staffRole = \App\Models\Role::where('name', 'staff')->first();
        $this->staffUser->roles()->attach($staffRole);
        $this->staff = Staff::factory()->create(['user_id' => $this->staffUser->id]);

        // Create student user with enrollment
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

    public function test_can_create_university_wide_announcement(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/announcements', [
                'author_id' => $this->staff->id,
                'title' => 'Welcome to the New Semester',
                'content' => 'We are excited to welcome everyone back.',
                'priority' => 'important',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Announcement created successfully.',
            ]);

        $this->assertDatabaseHas('announcements', [
            'title' => 'Welcome to the New Semester',
            'announceable_type' => null,
            'announceable_id' => null,
        ]);
    }

    public function test_can_create_course_section_announcement(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/announcements', [
                'target_type' => 'course_section',
                'target_id' => $this->courseSection->id,
                'author_id' => $this->staff->id,
                'title' => 'Class Cancelled Tomorrow',
                'content' => 'Due to unforeseen circumstances, class is cancelled.',
                'priority' => 'urgent',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('announcements', [
            'title' => 'Class Cancelled Tomorrow',
            'announceable_type' => CourseSection::class,
            'announceable_id' => $this->courseSection->id,
            'priority' => 'urgent',
        ]);
    }

    public function test_can_create_department_announcement(): void
    {
        $department = Department::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/announcements', [
                'target_type' => 'department',
                'target_id' => $department->id,
                'author_id' => $this->staff->id,
                'title' => 'Department Meeting',
                'content' => 'All faculty and students are invited.',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('announcements', [
            'title' => 'Department Meeting',
            'announceable_type' => Department::class,
            'announceable_id' => $department->id,
        ]);
    }

    public function test_can_update_announcement(): void
    {
        $announcement = Announcement::factory()->universityWide()->published()->create([
            'author_id' => $this->staff->id,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/announcements/{$announcement->id}", [
                'title' => 'Updated Title',
                'priority' => 'urgent',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Announcement updated successfully.',
            ]);

        $announcement->refresh();
        $this->assertEquals('Updated Title', $announcement->title);
        $this->assertEquals('urgent', $announcement->priority);
    }

    public function test_can_delete_announcement(): void
    {
        $announcement = Announcement::factory()->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/announcements/{$announcement->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Announcement deleted successfully.',
            ]);

        $this->assertDatabaseMissing('announcements', [
            'id' => $announcement->id,
        ]);
    }

    public function test_can_get_university_wide_announcements(): void
    {
        Announcement::factory()->universityWide()->published()->count(3)->create([
            'author_id' => $this->staff->id,
        ]);
        Announcement::factory()->forCourseSection($this->courseSection)->published()->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/announcements/university-wide');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_get_course_section_announcements(): void
    {
        Announcement::factory()->forCourseSection($this->courseSection)->published()->count(2)->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$this->courseSection->id}/announcements");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_publish_announcement(): void
    {
        $announcement = Announcement::factory()->draft()->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/announcements/{$announcement->id}/publish");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Announcement published successfully.',
            ]);

        $announcement->refresh();
        $this->assertTrue($announcement->is_published);
    }

    public function test_can_unpublish_announcement(): void
    {
        $announcement = Announcement::factory()->published()->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/announcements/{$announcement->id}/unpublish");

        $response->assertStatus(200);

        $announcement->refresh();
        $this->assertFalse($announcement->is_published);
    }

    public function test_can_pin_announcement(): void
    {
        $announcement = Announcement::factory()->create([
            'author_id' => $this->staff->id,
            'is_pinned' => false,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/announcements/{$announcement->id}/pin");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Announcement pinned successfully.',
            ]);

        $announcement->refresh();
        $this->assertTrue($announcement->is_pinned);
    }

    public function test_can_unpin_announcement(): void
    {
        $announcement = Announcement::factory()->pinned()->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/announcements/{$announcement->id}/unpin");

        $response->assertStatus(200);

        $announcement->refresh();
        $this->assertFalse($announcement->is_pinned);
    }

    public function test_student_can_view_relevant_announcements(): void
    {
        // University-wide announcement
        Announcement::factory()->universityWide()->published()->create([
            'author_id' => $this->staff->id,
        ]);

        // Announcement for enrolled course section
        Announcement::factory()->forCourseSection($this->courseSection)->published()->create([
            'author_id' => $this->staff->id,
        ]);

        // Announcement for non-enrolled course section (should not appear)
        $otherSection = CourseSection::factory()->create();
        Announcement::factory()->forCourseSection($otherSection)->published()->create([
            'author_id' => $this->staff->id,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/v1/announcements/me');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_staff_can_view_created_announcements(): void
    {
        Announcement::factory()->count(3)->create([
            'author_id' => $this->staff->id,
        ]);

        // Another staff's announcement
        $otherStaff = Staff::factory()->create();
        Announcement::factory()->create([
            'author_id' => $otherStaff->id,
        ]);

        $response = $this->actingAs($this->staffUser, 'sanctum')
            ->getJson('/api/v1/announcements/me/created');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_model_checks_visibility(): void
    {
        // Published and no dates - visible
        $visible = Announcement::factory()->create([
            'author_id' => $this->staff->id,
            'is_published' => true,
            'published_at' => now()->subHour(),
            'expires_at' => null,
        ]);

        // Published with future published_at - not visible yet
        $scheduled = Announcement::factory()->create([
            'author_id' => $this->staff->id,
            'is_published' => true,
            'published_at' => now()->addDay(),
            'expires_at' => null,
        ]);

        // Published but expired - not visible
        $expired = Announcement::factory()->create([
            'author_id' => $this->staff->id,
            'is_published' => true,
            'published_at' => now()->subWeek(),
            'expires_at' => now()->subDay(),
        ]);

        // Unpublished - not visible
        $draft = Announcement::factory()->create([
            'author_id' => $this->staff->id,
            'is_published' => false,
        ]);

        $this->assertTrue($visible->isVisible());
        $this->assertFalse($scheduled->isVisible());
        $this->assertFalse($expired->isVisible());
        $this->assertFalse($draft->isVisible());
    }

    public function test_can_get_priority_levels(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/announcements/priorities');

        $response->assertStatus(200)
            ->assertJson([
                'data' => Announcement::PRIORITIES,
            ]);
    }

    public function test_announcements_ordered_correctly(): void
    {
        // Create announcements in specific order
        $normal = Announcement::factory()->published()->normal()->create([
            'author_id' => $this->staff->id,
            'published_at' => now()->subHours(3),
            'is_pinned' => false,
        ]);

        $urgent = Announcement::factory()->published()->create([
            'author_id' => $this->staff->id,
            'published_at' => now()->subHours(2),
            'priority' => 'urgent',
            'is_pinned' => false,
        ]);

        $pinnedNormal = Announcement::factory()->published()->normal()->create([
            'author_id' => $this->staff->id,
            'published_at' => now()->subHour(),
            'is_pinned' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/announcements/university-wide');

        $response->assertStatus(200);

        $data = $response->json('data');
        // Pinned should be first
        $this->assertEquals($pinnedNormal->id, $data[0]['id']);
        // Then urgent (not pinned, but urgent priority)
        $this->assertEquals($urgent->id, $data[1]['id']);
        // Normal priority last
        $this->assertEquals($normal->id, $data[2]['id']);
    }
}
