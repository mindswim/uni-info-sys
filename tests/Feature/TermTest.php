<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\QueryException;
use Tests\TestCase;
use App\Models\Term;
use App\Models\Student;
use App\Models\AdmissionApplication;
use App\Models\User;

class TermTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function can_create_a_term()
    {
        $term = Term::factory()->create([
            'name' => 'Fall 2024',
            'academic_year' => 2024,
            'semester' => 'Fall',
            'start_date' => '2024-09-01',
            'end_date' => '2024-12-20',
        ]);

        $this->assertDatabaseHas('terms', [
            'name' => 'Fall 2024',
            'academic_year' => 2024,
            'semester' => 'Fall'
        ]);
        $this->assertTrue($term->exists);
    }

    /**
     * @test
     */
    public function academic_year_and_semester_must_be_unique_together()
    {
        $this->expectException(QueryException::class);

        Term::factory()->create([
            'academic_year' => 2025,
            'semester' => 'Spring',
        ]);

        // Attempt to create another term with the same academic_year and semester
        Term::factory()->create([
            'academic_year' => 2025,
            'semester' => 'Spring',
        ]);
    }

    /**
     * @test
     */
    public function can_associate_term_with_admission_application()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create();

        $application = AdmissionApplication::factory()->create([
            'student_id' => $student->id,
            'term_id' => $term->id,
        ]);

        $this->assertDatabaseHas('admission_applications', [
            'id' => $application->id,
            'term_id' => $term->id,
        ]);

        $this->assertEquals($term->id, $application->term->id);
    }

    /**
     * @test
     */
    public function admission_application_term_id_is_set_to_null_on_term_delete()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create();
        $application = AdmissionApplication::factory()->create([
            'student_id' => $student->id,
            'term_id' => $term->id
        ]);

        $this->assertNotNull($application->term_id);

        $term->delete();
        $application->refresh();

        $this->assertNull($application->term_id);
    }

    /**
     * @test
     */
    public function term_model_has_many_admission_applications()
    {
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $term = Term::factory()->create();
        
        AdmissionApplication::factory()->count(3)->create([
            'student_id' => $student->id,
            'term_id' => $term->id,
        ]);

        $this->assertCount(3, $term->admissionApplications);
        $this->assertInstanceOf(AdmissionApplication::class, $term->admissionApplications->first());
    }
}
