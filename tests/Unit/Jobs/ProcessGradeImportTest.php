<?php

namespace Tests\Unit\Jobs;

use App\Jobs\ProcessGradeImport;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProcessGradeImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    /** @test */
    public function it_processes_valid_grade_csv_successfully()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        $student1 = Student::factory()->create(['id' => 1]);
        $student2 = Student::factory()->create(['id' => 2]);

        $enrollment1 = Enrollment::factory()->create([
            'student_id' => $student1->id,
            'course_section_id' => $courseSection->id,
            'grade' => null,
        ]);
        $enrollment2 = Enrollment::factory()->create([
            'student_id' => $student2->id,
            'course_section_id' => $courseSection->id,
            'grade' => null,
        ]);

        // Create CSV content
        $csvContent = "student_id,grade\n1,A\n2,B+";
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert grades were updated
        $enrollment1->refresh();
        $enrollment2->refresh();

        $this->assertEquals('A', $enrollment1->grade);
        $this->assertEquals('B+', $enrollment2->grade);

        // Assert file was cleaned up
        $this->assertFalse(Storage::disk('local')->exists($filePath));
    }

    /** @test */
    public function it_handles_invalid_student_ids()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        $student1 = Student::factory()->create(['id' => 1]);
        $enrollment1 = Enrollment::factory()->create([
            'student_id' => $student1->id,
            'course_section_id' => $courseSection->id,
            'grade' => null,
        ]);

        // CSV with invalid student ID
        $csvContent = "student_id,grade\n1,A\n999,B+"; // 999 doesn't exist
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert valid grade was updated
        $enrollment1->refresh();
        $this->assertEquals('A', $enrollment1->grade);

        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_errors.log'));
        $errorLog = Storage::disk('local')->get('imports/logs/test_import_errors.log');
        $this->assertStringContainsString('Student ID 999 is not enrolled', $errorLog);
    }

    /** @test */
    public function it_validates_grade_values()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        $student1 = Student::factory()->create(['id' => 1]);
        $enrollment1 = Enrollment::factory()->create([
            'student_id' => $student1->id,
            'course_section_id' => $courseSection->id,
            'grade' => null,
        ]);

        // CSV with invalid grade
        $csvContent = "student_id,grade\n1,INVALID_GRADE";
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert grade was not updated
        $enrollment1->refresh();
        $this->assertNull($enrollment1->grade);

        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_errors.log'));
        $errorLog = Storage::disk('local')->get('imports/logs/test_import_errors.log');
        $this->assertStringContainsString('Grade must be one of', $errorLog);
    }

    /** @test */
    public function it_skips_duplicate_grades()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        $student1 = Student::factory()->create(['id' => 1]);
        $enrollment1 = Enrollment::factory()->create([
            'student_id' => $student1->id,
            'course_section_id' => $courseSection->id,
            'grade' => 'A', // Already has grade A
        ]);

        // CSV with same grade
        $csvContent = "student_id,grade\n1,A";
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert grade remains the same
        $enrollment1->refresh();
        $this->assertEquals('A', $enrollment1->grade);
    }

    /** @test */
    public function it_handles_missing_headers()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        // CSV with missing headers
        $csvContent = "student_id\n1"; // Missing grade header
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_errors.log'));
        $errorLog = Storage::disk('local')->get('imports/logs/test_import_errors.log');
        $this->assertStringContainsString('Missing required headers: grade', $errorLog);
    }

    /** @test */
    public function it_handles_empty_csv_file()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        // Empty CSV
        $csvContent = '';
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_errors.log'));
        $errorLog = Storage::disk('local')->get('imports/logs/test_import_errors.log');
        $this->assertStringContainsString('CSV file is empty', $errorLog);
    }

    /** @test */
    public function it_processes_mixed_valid_and_invalid_rows()
    {
        // Create test data
        $user = User::factory()->create();
        $course = Course::factory()->create(['course_code' => 'CS101']);
        $courseSection = CourseSection::factory()->create(['course_id' => $course->id]);

        $student1 = Student::factory()->create(['id' => 1]);
        $student2 = Student::factory()->create(['id' => 2]);

        $enrollment1 = Enrollment::factory()->create([
            'student_id' => $student1->id,
            'course_section_id' => $courseSection->id,
            'grade' => null,
        ]);
        $enrollment2 = Enrollment::factory()->create([
            'student_id' => $student2->id,
            'course_section_id' => $courseSection->id,
            'grade' => null,
        ]);

        // CSV with mixed valid/invalid data
        $csvContent = "student_id,grade\n1,A\n999,B+\n2,C\ninvalid,D";
        $filePath = 'imports/grades/test.csv';
        Storage::disk('local')->put($filePath, $csvContent);

        // Create and execute job
        $job = new ProcessGradeImport($filePath, $user->id, $courseSection->id, 'test_import', 'test.csv');
        $job->handle();

        // Assert valid grades were updated
        $enrollment1->refresh();
        $enrollment2->refresh();

        $this->assertEquals('A', $enrollment1->grade);
        $this->assertEquals('C', $enrollment2->grade);

        // Assert error log contains failed rows
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_errors.log'));
        $errorLog = Storage::disk('local')->get('imports/logs/test_import_errors.log');
        $this->assertStringContainsString('Student ID 999 is not enrolled', $errorLog);
        $this->assertStringContainsString('Student ID must be a number', $errorLog);
    }
}
