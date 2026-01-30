<?php

namespace Tests\Feature;

use App\Models\ClassSession;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Services\ClassSessionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassSessionTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected ClassSessionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->adminUser = User::factory()->create();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        if ($adminRole) {
            $this->adminUser->roles()->attach($adminRole);
        }

        $this->service = app(ClassSessionService::class);
    }

    public function test_can_generate_sessions_for_course_section(): void
    {
        // Create a term spanning 2 weeks
        $term = Term::factory()->create([
            'start_date' => '2025-01-06', // Monday
            'end_date' => '2025-01-17',   // Friday (2 weeks)
        ]);

        // Create course section with MWF schedule
        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
            'start_time' => '09:00',
            'end_time' => '10:15',
        ]);

        $sessions = $this->service->generateSessionsForSection($courseSection);

        // Should generate 6 sessions (3 per week * 2 weeks)
        $this->assertCount(6, $sessions);

        // Verify session numbers are sequential
        $sessionNumbers = $sessions->pluck('session_number')->toArray();
        $this->assertEquals([1, 2, 3, 4, 5, 6], $sessionNumbers);

        // Verify all sessions are scheduled
        $this->assertTrue($sessions->every(fn ($s) => $s->status === 'scheduled'));
    }

    public function test_can_exclude_dates_when_generating_sessions(): void
    {
        $term = Term::factory()->create([
            'start_date' => '2025-01-06',
            'end_date' => '2025-01-10',
        ]);

        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
            'start_time' => '09:00',
            'end_time' => '10:15',
        ]);

        // Exclude Wednesday
        $sessions = $this->service->generateSessionsForSection(
            $courseSection,
            ['2025-01-08']
        );

        // Should generate 2 sessions (Mon and Fri only)
        $this->assertCount(2, $sessions);
    }

    public function test_can_mark_session_as_completed(): void
    {
        $session = ClassSession::factory()->create([
            'status' => 'scheduled',
        ]);

        $updated = $this->service->markSessionComplete($session, 'Covered chapters 1-3');

        $this->assertEquals('completed', $updated->status);
        $this->assertEquals('Covered chapters 1-3', $updated->description);
    }

    public function test_can_cancel_session(): void
    {
        $session = ClassSession::factory()->create([
            'status' => 'scheduled',
        ]);

        $updated = $this->service->cancelSession($session, 'Instructor illness');

        $this->assertEquals('cancelled', $updated->status);
        $this->assertEquals('Instructor illness', $updated->cancellation_reason);
    }

    public function test_can_reschedule_session(): void
    {
        $session = ClassSession::factory()->create([
            'status' => 'cancelled',
            'session_date' => '2025-01-15',
            'start_time' => '09:00',
        ]);

        $updated = $this->service->rescheduleSession(
            $session,
            '2025-01-20',
            '14:00',
            '15:15',
            'Room 201'
        );

        $this->assertEquals('scheduled', $updated->status);
        $this->assertEquals('2025-01-20', $updated->session_date->toDateString());
        $this->assertEquals('Room 201', $updated->location_override);
        $this->assertNull($updated->cancellation_reason);
    }

    public function test_can_assign_substitute_instructor(): void
    {
        $session = ClassSession::factory()->create();
        $substitute = Staff::factory()->create();

        $updated = $this->service->assignSubstitute($session, $substitute->id);

        $this->assertEquals($substitute->id, $updated->substitute_instructor_id);
    }

    public function test_get_student_sessions_for_date(): void
    {
        $term = Term::factory()->create([
            'start_date' => '2025-01-01',
            'end_date' => '2025-05-31',
        ]);

        $student = Student::factory()->create();

        $section1 = CourseSection::factory()->create(['term_id' => $term->id]);
        $section2 = CourseSection::factory()->create(['term_id' => $term->id]);

        // Enroll student in section1
        Enrollment::factory()->create([
            'student_id' => $student->id,
            'course_section_id' => $section1->id,
            'status' => 'enrolled',
        ]);

        // Create sessions for both sections on the same date
        ClassSession::factory()->create([
            'course_section_id' => $section1->id,
            'session_date' => '2025-01-15',
        ]);
        ClassSession::factory()->create([
            'course_section_id' => $section2->id,
            'session_date' => '2025-01-15',
        ]);

        $sessions = $this->service->getStudentSessionsForDate($student->id, '2025-01-15');

        // Should only get the session for enrolled course
        $this->assertCount(1, $sessions);
        $this->assertEquals($section1->id, $sessions->first()->course_section_id);
    }

    public function test_api_can_list_sessions(): void
    {
        $section = CourseSection::factory()->create();
        ClassSession::factory()->count(3)->sequence(
            ['session_number' => 1],
            ['session_number' => 2],
            ['session_number' => 3],
        )->create(['course_section_id' => $section->id]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/class-sessions');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'course_section_id',
                        'session_number',
                        'session_date',
                        'start_time',
                        'end_time',
                        'status',
                    ],
                ],
            ]);
    }

    public function test_api_can_create_session(): void
    {
        $courseSection = CourseSection::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/class-sessions', [
                'course_section_id' => $courseSection->id,
                'session_number' => 1,
                'session_date' => '2025-02-01',
                'start_time' => '09:00',
                'end_time' => '10:15',
                'title' => 'Introduction',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Introduction')
            ->assertJsonPath('data.status', 'scheduled');
    }

    public function test_api_can_generate_sessions_for_section(): void
    {
        $term = Term::factory()->create([
            'start_date' => '2025-01-06',
            'end_date' => '2025-01-10',
        ]);

        $courseSection = CourseSection::factory()->create([
            'term_id' => $term->id,
            'schedule_days' => ['Monday', 'Wednesday', 'Friday'],
            'start_time' => '09:00',
            'end_time' => '10:15',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/course-sections/{$courseSection->id}/sessions/generate");

        $response->assertCreated()
            ->assertJsonPath('data.sessions_created', 3);

        $this->assertDatabaseCount('class_sessions', 3);
    }

    public function test_api_can_complete_session(): void
    {
        $section = CourseSection::factory()->create();
        $session = ClassSession::factory()->create([
            'course_section_id' => $section->id,
            'session_number' => 1,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/class-sessions/{$session->id}/complete", [
                'description' => 'Covered introduction material',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_api_can_cancel_session(): void
    {
        $section = CourseSection::factory()->create();
        $session = ClassSession::factory()->create([
            'course_section_id' => $section->id,
            'session_number' => 1,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/class-sessions/{$session->id}/cancel", [
                'reason' => 'Weather closure',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.cancellation_reason', 'Weather closure');
    }

    public function test_api_can_get_section_session_stats(): void
    {
        $courseSection = CourseSection::factory()->create();

        // Create sessions with unique session numbers
        for ($i = 1; $i <= 5; $i++) {
            ClassSession::factory()->create([
                'course_section_id' => $courseSection->id,
                'session_number' => $i,
                'status' => 'completed',
            ]);
        }
        for ($i = 6; $i <= 8; $i++) {
            ClassSession::factory()->create([
                'course_section_id' => $courseSection->id,
                'session_number' => $i,
                'status' => 'scheduled',
            ]);
        }
        ClassSession::factory()->create([
            'course_section_id' => $courseSection->id,
            'session_number' => 9,
            'status' => 'cancelled',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/course-sections/{$courseSection->id}/session-stats");

        $response->assertOk()
            ->assertJsonPath('data.total_sessions', 9)
            ->assertJsonPath('data.completed', 5)
            ->assertJsonPath('data.scheduled', 3)
            ->assertJsonPath('data.cancelled', 1);
    }
}
