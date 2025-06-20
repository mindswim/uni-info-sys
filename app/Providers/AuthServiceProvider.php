<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

use App\Models\AcademicRecord;
use App\Models\AdmissionApplication;
use App\Models\Building;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Document;
use App\Models\Enrollment;
use App\Models\Faculty;
use App\Models\Permission;
use App\Models\Program;
use App\Models\ProgramChoice;
use App\Models\Role;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;

use App\Policies\AcademicRecordPolicy;
use App\Policies\AdmissionApplicationPolicy;
use App\Policies\BuildingPolicy;
use App\Policies\CoursePolicy;
use App\Policies\CourseSectionPolicy;
use App\Policies\DepartmentPolicy;
use App\Policies\DocumentPolicy;
use App\Policies\EnrollmentPolicy;
use App\Policies\FacultyPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\ProgramPolicy;
use App\Policies\ProgramChoicePolicy;
use App\Policies\RolePolicy;
use App\Policies\RoomPolicy;
use App\Policies\StaffPolicy;
use App\Policies\StudentPolicy;
use App\Policies\TermPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        AcademicRecord::class => AcademicRecordPolicy::class,
        AdmissionApplication::class => AdmissionApplicationPolicy::class,
        Building::class => BuildingPolicy::class,
        Course::class => CoursePolicy::class,
        CourseSection::class => CourseSectionPolicy::class,
        Department::class => DepartmentPolicy::class,
        Document::class => DocumentPolicy::class,
        Enrollment::class => EnrollmentPolicy::class,
        Faculty::class => FacultyPolicy::class,
        Permission::class => PermissionPolicy::class,
        Program::class => ProgramPolicy::class,
        ProgramChoice::class => ProgramChoicePolicy::class,
        Role::class => RolePolicy::class,
        Room::class => RoomPolicy::class,
        Staff::class => StaffPolicy::class,
        Student::class => StudentPolicy::class,
        Term::class => TermPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        
        // Define custom gates
        Gate::define('create-document-for-student', function ($user, $student) {
            // A student can add a document to their own profile. Admin/staff can add to any.
            return $user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $student->user_id;
        });
    }
}
