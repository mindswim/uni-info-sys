<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use App\Services\AssignmentSubmissionService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentSubmissionTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $studentUser;
    protected Student $student;
    protected CourseSection $courseSection;
    protected Assignment $assignment;
    protected Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        // Create admin user
        $this->adminUser = User::factory()->create();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        $this->adminUser->roles()->attach($adminRole);

        // Create course section and assignment
        $this->courseSection = CourseSection::factory()->create();
        $this->assignment = Assignment::factory()->create([
            'course_section_id' => $this->courseSection->id,
            'is_published' => true,
            'available_from' => now()->subWeek(), // Ensure assignment is available
            'due_date' => now()->addWeek(),
            'max_points' => 100,
            'allows_late' => true,
            'late_penalty_per_day' => 5,
            'max_late_days' => 5,
        ]);

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

    public function test_can_submit_assignment(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/submissions/submit', [
                'assignment_id' => $this->assignment->id,
                'enrollment_id' => $this->enrollment->id,
                'content' => 'This is my submission content.',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Assignment submitted successfully.',
            ]);

        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'submitted',
            'content' => 'This is my submission content.',
        ]);
    }

    public function test_can_save_draft_submission(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/submissions/draft', [
                'assignment_id' => $this->assignment->id,
                'enrollment_id' => $this->enrollment->id,
                'content' => 'This is a draft.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Draft saved successfully.',
            ]);

        $this->assertDatabaseHas('assignment_submissions', [
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_can_grade_submission(): void
    {
        $submission = AssignmentSubmission::factory()->submitted()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $grader = Staff::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/submissions/{$submission->id}/grade", [
                'score' => 85,
                'feedback' => 'Good work!',
                'grader_id' => $grader->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Submission graded successfully.',
            ]);

        $submission->refresh();
        $this->assertEquals('graded', $submission->status);
        $this->assertEquals(85, $submission->score);
        $this->assertEquals(85, $submission->final_score);
        $this->assertEquals('Good work!', $submission->feedback);
    }

    public function test_grading_applies_late_penalty(): void
    {
        $submission = AssignmentSubmission::factory()->late()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'late_days' => 2,
        ]);

        $grader = Staff::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/submissions/{$submission->id}/grade", [
                'score' => 100,
                'grader_id' => $grader->id,
            ]);

        $response->assertStatus(200);

        $submission->refresh();
        // 2 days late * 5% = 10% penalty
        $this->assertEquals(100, $submission->score);
        $this->assertEquals(10, $submission->late_penalty_applied);
        $this->assertEquals(90, $submission->final_score);
    }

    public function test_can_batch_grade_submissions(): void
    {
        $submissions = AssignmentSubmission::factory()
            ->count(3)
            ->submitted()
            ->create([
                'assignment_id' => $this->assignment->id,
            ]);

        $grader = Staff::factory()->create();

        $grades = $submissions->map(function ($submission, $index) {
            return [
                'submission_id' => $submission->id,
                'score' => 80 + ($index * 5),
                'feedback' => "Feedback for submission {$index}",
            ];
        })->toArray();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/submissions/batch-grade', [
                'grader_id' => $grader->id,
                'grades' => $grades,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Graded 3 submissions. 0 failed.',
            ]);

        foreach ($submissions as $submission) {
            $submission->refresh();
            $this->assertEquals('graded', $submission->status);
        }
    }

    public function test_can_return_submission_for_revision(): void
    {
        $submission = AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/submissions/{$submission->id}/return", [
                'feedback' => 'Please revise your work.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Submission returned for revision.',
            ]);

        $submission->refresh();
        $this->assertEquals('returned', $submission->status);
    }

    public function test_can_resubmit_returned_submission(): void
    {
        $submission = AssignmentSubmission::factory()->returned()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/submissions/{$submission->id}/resubmit", [
                'content' => 'This is my revised submission.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Assignment resubmitted successfully.',
            ]);

        $submission->refresh();
        $this->assertContains($submission->status, ['submitted', 'late']);
        $this->assertEquals('This is my revised submission.', $submission->content);
        $this->assertNull($submission->score);
    }

    public function test_student_can_view_own_submissions(): void
    {
        AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/v1/submissions/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'assignment_id',
                        'enrollment_id',
                        'status',
                        'score',
                        'final_score',
                        'percentage',
                        'letter_grade',
                        'is_passing',
                    ],
                ],
            ]);
    }

    public function test_student_can_view_submission_for_specific_assignment(): void
    {
        $submission = AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
            'score' => 85,
            'final_score' => 85,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/v1/assignments/{$this->assignment->id}/my-submission");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $submission->id)
            ->assertJsonPath('data.score', '85.00');
    }

    public function test_can_list_submissions_for_assignment(): void
    {
        AssignmentSubmission::factory()->count(5)->create([
            'assignment_id' => $this->assignment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/assignments/{$this->assignment->id}/submissions");

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }

    public function test_can_get_assignment_submission_stats(): void
    {
        // Create various submissions
        AssignmentSubmission::factory()->count(3)->graded()->create([
            'assignment_id' => $this->assignment->id,
        ]);
        AssignmentSubmission::factory()->count(2)->submitted()->create([
            'assignment_id' => $this->assignment->id,
        ]);
        AssignmentSubmission::factory()->late()->create([
            'assignment_id' => $this->assignment->id,
            'late_days' => 2,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/v1/assignments/{$this->assignment->id}/submission-stats");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_submissions',
                    'submitted',
                    'graded',
                    'returned',
                    'late',
                    'average_score',
                    'median_score',
                    'highest_score',
                    'lowest_score',
                    'passing_count',
                ],
            ]);
    }

    public function test_can_list_pending_grading_submissions(): void
    {
        AssignmentSubmission::factory()->count(3)->submitted()->create([
            'assignment_id' => $this->assignment->id,
        ]);
        AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $this->assignment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/submissions/pending-grading');

        $response->assertStatus(200)
            ->assertJsonPath('meta.count', 3);
    }

    public function test_cannot_grade_unsubmitted_submission(): void
    {
        $submission = AssignmentSubmission::factory()->inProgress()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $grader = Staff::factory()->create();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/submissions/{$submission->id}/grade", [
                'score' => 85,
                'grader_id' => $grader->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot grade a submission that has not been submitted.',
            ]);
    }

    public function test_cannot_delete_graded_submission(): void
    {
        $submission = AssignmentSubmission::factory()->graded()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/submissions/{$submission->id}");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot delete a graded submission.',
            ]);
    }

    public function test_can_delete_ungraded_submission(): void
    {
        $submission = AssignmentSubmission::factory()->submitted()->create([
            'assignment_id' => $this->assignment->id,
            'enrollment_id' => $this->enrollment->id,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/submissions/{$submission->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Submission deleted successfully.',
            ]);

        $this->assertDatabaseMissing('assignment_submissions', [
            'id' => $submission->id,
        ]);
    }

    public function test_service_calculates_attempt_number(): void
    {
        $service = new AssignmentSubmissionService();

        // First submission
        $submission1 = $service->submit($this->assignment, $this->enrollment, [
            'content' => 'First attempt',
        ]);
        $this->assertEquals(1, $submission1->attempt_number);

        // Mark as returned so we can resubmit
        $grader = Staff::factory()->create();
        $service->grade($submission1, 60, $grader);
        $service->returnForRevision($submission1, 'Please redo');
        $service->resubmit($submission1, ['content' => 'Revised']);

        // Second submission (new record)
        $submission2 = $service->submit($this->assignment, $this->enrollment, [
            'content' => 'Second attempt',
        ]);
        $this->assertEquals(2, $submission2->attempt_number);
    }

    public function test_service_rejects_submission_for_wrong_course_section(): void
    {
        $service = new AssignmentSubmissionService();

        // Create enrollment for different course section
        $otherSection = CourseSection::factory()->create();
        $otherEnrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $otherSection->id,
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Enrollment does not match assignment course section.');

        $service->submit($this->assignment, $otherEnrollment, [
            'content' => 'This should fail',
        ]);
    }
}
