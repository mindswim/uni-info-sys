<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicHierarchyTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_faculty(): void
    {
        $faculty = Faculty::create([
            'name' => 'Faculty of Engineering',
        ]);

        $this->assertDatabaseHas('faculties', [
            'name' => 'Faculty of Engineering',
        ]);

        $this->assertEquals('Faculty of Engineering', $faculty->name);
    }

    public function test_can_create_department_with_faculty(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);

        $department = Department::create([
            'faculty_id' => $faculty->id,
            'name' => 'Computer Science',
            'code' => 'CS',
        ]);

        $this->assertDatabaseHas('departments', [
            'faculty_id' => $faculty->id,
            'name' => 'Computer Science',
        ]);

        $this->assertEquals('Computer Science', $department->name);
        $this->assertEquals($faculty->id, $department->faculty_id);
    }

    public function test_faculty_has_many_departments(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);

        $dept1 = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);
        $dept2 = Department::create(['faculty_id' => $faculty->id, 'name' => 'Electrical Engineering', 'code' => 'EE']);

        $this->assertCount(2, $faculty->departments);
        $this->assertTrue($faculty->departments->contains('name', 'Computer Science'));
        $this->assertTrue($faculty->departments->contains('name', 'Electrical Engineering'));
    }

    public function test_department_belongs_to_faculty(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);

        $this->assertInstanceOf(Faculty::class, $department->faculty);
        $this->assertEquals('Faculty of Engineering', $department->faculty->name);
    }

    public function test_can_create_program_with_department(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);

        $program = Program::create([
            'name' => 'Bachelor of Computer Science',
            'department_id' => $department->id,
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'A comprehensive computer science program',
            'requirements' => 'High school diploma with mathematics',
            'capacity' => 100,
        ]);

        $this->assertDatabaseHas('programs', [
            'name' => 'Bachelor of Computer Science',
            'department_id' => $department->id,
        ]);

        $this->assertEquals('Bachelor of Computer Science', $program->name);
        $this->assertEquals($department->id, $program->department_id);
    }

    public function test_department_has_many_programs(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);

        $program1 = Program::create([
            'name' => 'Bachelor of Computer Science',
            'department_id' => $department->id,
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Bachelor program',
            'requirements' => 'High school diploma',
            'capacity' => 100,
        ]);

        $program2 = Program::create([
            'name' => 'Master of Computer Science',
            'department_id' => $department->id,
            'degree_level' => 'Master',
            'duration' => 2,
            'description' => 'Master program',
            'requirements' => 'Bachelor degree',
            'capacity' => 50,
        ]);

        $this->assertCount(2, $department->programs);
        $this->assertTrue($department->programs->contains('name', 'Bachelor of Computer Science'));
        $this->assertTrue($department->programs->contains('name', 'Master of Computer Science'));
    }

    public function test_program_belongs_to_department(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);

        $program = Program::create([
            'name' => 'Bachelor of Computer Science',
            'department_id' => $department->id,
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Bachelor program',
            'requirements' => 'High school diploma',
            'capacity' => 100,
        ]);

        $this->assertInstanceOf(Department::class, $program->department);
        $this->assertEquals('Computer Science', $program->department->name);
    }

    public function test_cascade_delete_faculty_deletes_departments(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);

        $this->assertDatabaseHas('departments', ['id' => $department->id]);

        $faculty->delete();

        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }

    public function test_set_null_department_delete_sets_program_department_id_null(): void
    {
        $faculty = Faculty::create(['name' => 'Faculty of Engineering']);
        $department = Department::create(['faculty_id' => $faculty->id, 'name' => 'Computer Science', 'code' => 'CS']);

        $program = Program::create([
            'name' => 'Bachelor of Computer Science',
            'department_id' => $department->id,
            'degree_level' => 'Bachelor',
            'duration' => 4,
            'description' => 'Bachelor program',
            'requirements' => 'High school diploma',
            'capacity' => 100,
        ]);

        $this->assertDatabaseHas('programs', ['id' => $program->id, 'department_id' => $department->id]);

        $department->delete();

        $this->assertDatabaseHas('programs', ['id' => $program->id, 'department_id' => null]);
    }

    public function test_complete_hierarchy_with_factories(): void
    {
        // Create using factories
        $faculty = Faculty::factory()->engineering()->create();
        $department = Department::factory()->computerScience()->create(['faculty_id' => $faculty->id]);
        $program = Program::factory()->create(['department_id' => $department->id]);

        // Verify relationships work
        $this->assertEquals('Faculty of Engineering', $faculty->name);
        $this->assertEquals('Computer Science', $department->name);
        $this->assertEquals($faculty->id, $department->faculty_id);
        $this->assertEquals($department->id, $program->department_id);

        // Test eager loading
        $loadedProgram = Program::with('department.faculty')->find($program->id);
        $this->assertEquals('Faculty of Engineering', $loadedProgram->department->faculty->name);
        $this->assertEquals('Computer Science', $loadedProgram->department->name);
    }

    public function test_can_query_programs_through_hierarchy(): void
    {
        // Create test data
        $engineeringFaculty = Faculty::factory()->engineering()->create();
        $businessFaculty = Faculty::factory()->business()->create();

        $csDepartment = Department::factory()->computerScience()->create(['faculty_id' => $engineeringFaculty->id]);
        $businessDepartment = Department::factory()->business()->create(['faculty_id' => $businessFaculty->id]);

        $csProgram = Program::factory()->create(['department_id' => $csDepartment->id, 'name' => 'Computer Science']);
        $businessProgram = Program::factory()->create(['department_id' => $businessDepartment->id, 'name' => 'Business Administration']);

        // Query programs by faculty
        $engineeringPrograms = Program::whereHas('department', function ($query) use ($engineeringFaculty) {
            $query->where('faculty_id', $engineeringFaculty->id);
        })->get();

        $this->assertCount(1, $engineeringPrograms);
        $this->assertEquals('Computer Science', $engineeringPrograms->first()->name);

        // Query departments by faculty
        $engineeringDepartments = Department::where('faculty_id', $engineeringFaculty->id)->get();
        $this->assertCount(1, $engineeringDepartments);
        $this->assertEquals('Computer Science', $engineeringDepartments->first()->name);
    }

    public function test_faculty_names_can_be_duplicate(): void
    {
        // Faculties can have the same name (no unique constraint)
        Faculty::create(['name' => 'Faculty of Science']);
        Faculty::create(['name' => 'Faculty of Science']);

        $this->assertCount(2, Faculty::where('name', 'Faculty of Science')->get());
    }

    public function test_department_names_can_be_duplicate_across_faculties(): void
    {
        $faculty1 = Faculty::create(['name' => 'Faculty of Engineering']);
        $faculty2 = Faculty::create(['name' => 'Faculty of Science']);

        Department::create(['faculty_id' => $faculty1->id, 'name' => 'Mathematics', 'code' => 'MATH1']);
        Department::create(['faculty_id' => $faculty2->id, 'name' => 'Mathematics', 'code' => 'MATH2']);

        $this->assertCount(2, Department::where('name', 'Mathematics')->get());
    }

    public function test_academic_hierarchy_seeder_creates_expected_data(): void
    {
        // Run the seeder
        $this->artisan('db:seed', ['--class' => 'AcademicHierarchySeeder']);

        // Verify faculties were created
        $this->assertDatabaseHas('faculties', ['name' => 'Faculty of Engineering']);
        $this->assertDatabaseHas('faculties', ['name' => 'Faculty of Science']);
        $this->assertDatabaseHas('faculties', ['name' => 'Faculty of Business']);
        $this->assertDatabaseHas('faculties', ['name' => 'Faculty of Arts']);

        // Verify departments were created with correct faculty relationships
        $engineeringFaculty = Faculty::where('name', 'Faculty of Engineering')->first();
        $this->assertDatabaseHas('departments', [
            'faculty_id' => $engineeringFaculty->id,
            'name' => 'Computer Science',
        ]);
        $this->assertDatabaseHas('departments', [
            'faculty_id' => $engineeringFaculty->id,
            'name' => 'Electrical Engineering',
        ]);

        $scienceFaculty = Faculty::where('name', 'Faculty of Science')->first();
        $this->assertDatabaseHas('departments', [
            'faculty_id' => $scienceFaculty->id,
            'name' => 'Mathematics',
        ]);

        // Verify programs were created with correct department relationships
        $csDepartment = Department::where('name', 'Computer Science')->first();
        $this->assertDatabaseHas('programs', [
            'department_id' => $csDepartment->id,
            'name' => 'Bachelor of Computer Science',
        ]);
        $this->assertDatabaseHas('programs', [
            'department_id' => $csDepartment->id,
            'name' => 'Master of Computer Science',
        ]);

        // Verify the complete hierarchy works
        $program = Program::with('department.faculty')->where('name', 'Bachelor of Computer Science')->first();
        $this->assertEquals('Computer Science', $program->department->name);
        $this->assertEquals('Faculty of Engineering', $program->department->faculty->name);

        // Verify program counts
        $this->assertGreaterThanOrEqual(8, Program::count()); // At least 8 programs created
        $this->assertGreaterThanOrEqual(10, Department::count()); // At least 10 departments created
        $this->assertEquals(4, Faculty::count()); // Exactly 4 faculties created
    }
}
