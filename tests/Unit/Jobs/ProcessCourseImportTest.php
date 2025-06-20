<?php

namespace Tests\Unit\Jobs;

use App\Jobs\ProcessCourseImport;
use App\Models\Course;
use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProcessCourseImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test departments
        $csDept = Department::factory()->create(['code' => 'CS', 'name' => 'Computer Science']);
        $mathDept = Department::factory()->create(['code' => 'MATH', 'name' => 'Mathematics']);
        $engDept = Department::factory()->create(['code' => 'ENG', 'name' => 'Engineering']);
        
        // Create prerequisite courses
        Course::factory()->create(['course_code' => 'CS101', 'title' => 'Intro to CS', 'department_id' => $csDept->id]);
        Course::factory()->create(['course_code' => 'MATH101', 'title' => 'Calculus I', 'department_id' => $mathDept->id]);
    }

    public function test_processes_valid_csv_data_successfully()
    {
        Storage::fake('local');
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();
        
        // Create a user
        $user = User::factory()->create();
        
        // Create valid CSV content
        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS201,Data Structures,Advanced data structures,3,CS,CS101\n";
        $csvContent .= "CS301,Algorithms,Algorithm design and analysis,4,CS,\"CS101,CS201\"\n";
        $csvContent .= "MATH201,Calculus II,Advanced calculus,4,MATH,MATH101\n";
        
        $filePath = 'test_courses.csv';
        Storage::disk('local')->put($filePath, $csvContent);
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_123', 'test_courses.csv');
        
        // Execute the job
        $job->handle();
        
        // Assert courses were created
        $this->assertDatabaseHas('courses', ['course_code' => 'CS201', 'title' => 'Data Structures']);
        $this->assertDatabaseHas('courses', ['course_code' => 'CS301', 'title' => 'Algorithms']);
        $this->assertDatabaseHas('courses', ['course_code' => 'MATH201', 'title' => 'Calculus II']);
        
        // Assert prerequisites were set up correctly
        $cs201 = Course::where('course_code', 'CS201')->first();
        $cs301 = Course::where('course_code', 'CS301')->first();
        $math201 = Course::where('course_code', 'MATH201')->first();
        
        $this->assertTrue($cs201->prerequisites->contains('course_code', 'CS101'));
        $this->assertTrue($cs301->prerequisites->contains('course_code', 'CS101'));
        $this->assertTrue($cs301->prerequisites->contains('course_code', 'CS201'));
        $this->assertTrue($math201->prerequisites->contains('course_code', 'MATH101'));
    }

    public function test_handles_invalid_data_gracefully()
    {
        Storage::fake('local');
        
        $user = User::factory()->create();
        
        // Create CSV with invalid data
        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= ",Missing Code,Description,3,CS,\n";                    // Missing course code
        $csvContent .= "CS999,Missing Credits,,abc,CS,\n";                     // Invalid credits
        $csvContent .= "CS998,Invalid Department,,3,INVALID,\n";               // Invalid department
        $csvContent .= "CS997,Valid Course,Description,3,CS,\n";               // Valid course
        
        $filePath = 'test_invalid_courses.csv';
        Storage::disk('local')->put($filePath, $csvContent);
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_456', 'test_invalid_courses.csv');
        
        // Execute the job
        $job->handle();
        
        // Assert only valid course was created
        $this->assertDatabaseHas('courses', ['course_code' => 'CS997', 'title' => 'Valid Course']);
        $this->assertDatabaseMissing('courses', ['course_code' => '']);
        $this->assertDatabaseMissing('courses', ['course_code' => 'CS999']);
        $this->assertDatabaseMissing('courses', ['course_code' => 'CS998']);
        
        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_456_errors.log'));
    }

    public function test_updates_existing_courses()
    {
        Storage::fake('local');
        
        $user = User::factory()->create();
        
        // Create existing course
        $csDept = Department::where('code', 'CS')->first();
        $existingCourse = Course::factory()->create([
            'course_code' => 'CS301',
            'title' => 'Old Title',
            'description' => 'Old Description',
            'credits' => 3,
            'department_id' => $csDept->id
        ]);
        
        // CSV with updated data
        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS301,Updated Algorithms,Updated algorithm design,4,CS,CS101\n";
        
        $filePath = 'test_update_courses.csv';
        Storage::disk('local')->put($filePath, $csvContent);
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_789', 'test_update_courses.csv');
        
        // Execute the job
        $job->handle();
        
        // Assert course was updated
        $updatedCourse = Course::where('course_code', 'CS301')->first();
        $this->assertEquals('Updated Algorithms', $updatedCourse->title);
        $this->assertEquals('Updated algorithm design', $updatedCourse->description);
        $this->assertEquals(4, $updatedCourse->credits);
    }

    public function test_handles_missing_prerequisites_gracefully()
    {
        Storage::fake('local');
        Log::shouldReceive('warning')->once();
        Log::shouldReceive('error')->zeroOrMoreTimes();
        Log::shouldReceive('info')->zeroOrMoreTimes();
        
        $user = User::factory()->create();
        
        // CSV with non-existent prerequisites
        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS401,Advanced Course,Advanced topics,4,CS,\"CS301,CS999\"\n"; // CS999 doesn't exist
        
        $filePath = 'test_missing_prereq.csv';
        Storage::disk('local')->put($filePath, $csvContent);
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_prereq', 'test_missing_prereq.csv');
        
        // Execute the job
        $job->handle();
        
        // Assert course was still created
        $this->assertDatabaseHas('courses', ['course_code' => 'CS401', 'title' => 'Advanced Course']);
        
        // Assert only existing prerequisites were added
        $course = Course::where('course_code', 'CS401')->first();
        $this->assertFalse($course->prerequisites->contains('course_code', 'CS301')); // CS301 doesn't exist in our test data
        $this->assertFalse($course->prerequisites->contains('course_code', 'CS999')); // CS999 doesn't exist
    }

    public function test_handles_empty_csv_file()
    {
        Storage::fake('local');
        
        $user = User::factory()->create();
        
        // Empty CSV file
        $filePath = 'test_empty.csv';
        Storage::disk('local')->put($filePath, '');
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_empty', 'test_empty.csv');
        
        // Execute the job - should not throw exception
        $job->handle();
        
        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_empty_errors.log'));
    }

    public function test_handles_missing_required_headers()
    {
        Storage::fake('local');
        
        $user = User::factory()->create();
        
        // CSV missing required headers
        $csvContent = "course_code,title,description\n"; // Missing credits, department_code
        $csvContent .= "CS999,Test Course,Test Description\n";
        
        $filePath = 'test_missing_headers.csv';
        Storage::disk('local')->put($filePath, $csvContent);
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_headers', 'test_missing_headers.csv');
        
        // Execute the job - should handle gracefully
        $job->handle();
        
        // Assert no courses were created
        $this->assertDatabaseMissing('courses', ['course_code' => 'CS999']);
        
        // Assert error log was created
        $this->assertTrue(Storage::disk('local')->exists('imports/logs/test_import_headers_errors.log'));
    }

    public function test_cleans_up_uploaded_file_after_processing()
    {
        Storage::fake('local');
        
        $user = User::factory()->create();
        
        $csvContent = "course_code,title,description,credits,department_code,prerequisite_course_codes\n";
        $csvContent .= "CS501,Test Course,Test Description,3,CS,\n";
        
        $filePath = 'test_cleanup.csv';
        Storage::disk('local')->put($filePath, $csvContent);
        
        // Verify file exists before processing
        $this->assertTrue(Storage::disk('local')->exists($filePath));
        
        $job = new ProcessCourseImport($filePath, $user->id, 'test_import_cleanup', 'test_cleanup.csv');
        
        // Execute the job
        $job->handle();
        
        // Assert file was cleaned up
        $this->assertFalse(Storage::disk('local')->exists($filePath));
    }
} 