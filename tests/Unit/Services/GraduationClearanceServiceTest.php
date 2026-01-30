<?php

namespace Tests\Unit\Services;

use App\Models\GraduationApplication;
use App\Models\Hold;
use App\Models\Program;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use App\Services\GraduationClearanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraduationClearanceServiceTest extends TestCase
{
    use RefreshDatabase;

    private GraduationClearanceService $service;

    private Student $student;

    private Program $program;

    private Term $term;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(GraduationClearanceService::class);

        $user = User::factory()->create();
        $this->student = Student::factory()->create(['user_id' => $user->id]);
        $this->program = Program::factory()->create();
        $this->term = Term::factory()->create();
    }

    public function test_initiate_clearance_sets_status_and_departments(): void
    {
        $app = GraduationApplication::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'status' => 'pending',
        ]);

        $result = $this->service->initiateClearance($app);

        $this->assertEquals('clearance_in_progress', $result->status);
        $this->assertNotNull($result->clearance_status);
        $this->assertCount(4, $result->clearance_status);
    }

    public function test_automated_checks_clear_financial_when_no_holds(): void
    {
        $app = GraduationApplication::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'status' => 'pending',
        ]);

        $result = $this->service->initiateClearance($app);

        $this->assertEquals('cleared', $result->clearance_status['financial']['status']);
        $this->assertEquals('cleared', $result->clearance_status['library']['status']);
    }

    public function test_automated_checks_hold_financial_with_active_hold(): void
    {
        Hold::factory()->financial()->create([
            'student_id' => $this->student->id,
        ]);

        $app = GraduationApplication::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'status' => 'pending',
        ]);

        $result = $this->service->initiateClearance($app);

        $this->assertEquals('hold', $result->clearance_status['financial']['status']);
    }

    public function test_clear_department(): void
    {
        $app = GraduationApplication::factory()->clearanceInProgress()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $result = $this->service->clearDepartment($app, 'registrar', 1, 'Verified');

        $this->assertEquals('cleared', $result->clearance_status['registrar']['status']);
    }

    public function test_advance_status_when_all_cleared(): void
    {
        $clearance = [];
        foreach (GraduationApplication::CLEARANCE_DEPARTMENTS as $dept) {
            $clearance[$dept] = [
                'status' => $dept === 'registrar'
                    ? GraduationApplication::CLEARANCE_PENDING
                    : GraduationApplication::CLEARANCE_CLEARED,
                'cleared_by' => null,
                'cleared_at' => now()->toISOString(),
                'notes' => null,
            ];
        }

        $app = GraduationApplication::factory()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
            'status' => 'clearance_in_progress',
            'clearance_status' => $clearance,
        ]);

        $result = $this->service->clearDepartment($app, 'registrar', 1);

        $this->assertEquals('cleared', $result->status);
    }

    public function test_final_approve(): void
    {
        $app = GraduationApplication::factory()->fullyCleared()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $user = User::factory()->create();
        $result = $this->service->finalApprove($app, $user->id);

        $this->assertEquals('approved', $result->status);
        $this->assertEquals($user->id, $result->reviewed_by);
    }

    public function test_final_approve_throws_when_not_fully_cleared(): void
    {
        $app = GraduationApplication::factory()->clearanceInProgress()->create([
            'student_id' => $this->student->id,
            'program_id' => $this->program->id,
            'term_id' => $this->term->id,
        ]);

        $this->expectException(\RuntimeException::class);
        $this->service->finalApprove($app, 1);
    }
}
