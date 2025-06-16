# University Admissions Backend: Task List

This document provides a granular, step-by-step task list to refactor the existing backend and expand its features based on the `BACKEND_ANALYSIS.md` document.

---

## Section 1: Refactoring for Excellence

This section focuses on improving the quality and organization of the existing code.

### ✅ Task 1: Refactor Validation with Form Requests - COMPLETED ✅

**Goal:** Move validation logic from controllers into dedicated `FormRequest` classes to make controllers leaner and validation logic reusable.

**Instructions for `StudentController`:**

1.  **Generate Request Classes:** Open your terminal and run the following commands:
    ```bash
    php artisan make:request StoreStudentRequest
    php artisan make:request UpdateStudentRequest
    ```

2.  **Update `StoreStudentRequest`:** Open `app/Http/Requests/StoreStudentRequest.php` and replace its content with this:
    ```php
    <?php

    namespace App\Http\Requests;

    use Illuminate\Foundation\Http\FormRequest;

    class StoreStudentRequest extends FormRequest
    {
        public function authorize(): bool
        {
            // Set to true if any authenticated user can create a student profile.
            // You can add more specific logic here later (e.g., check for roles).
            return true;
        }

        public function rules(): array
        {
            return [
                'user_id' => 'required|exists:users,id|unique:students',
                'student_number' => 'required|unique:students',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'date_of_birth' => 'required|date',
                'gender' => 'required|string',
                'nationality' => 'required|string',
                'address' => 'required|string',
                'city' => 'required|string',
                'state' => 'required|string',
                'postal_code' => 'required|string',
                'country' => 'required|string',
                'phone' => 'required|string',
                'emergency_contact_name' => 'required|string',
                'emergency_contact_phone' => 'required|string',
            ];
        }
    }
    ```

3.  **Update `UpdateStudentRequest`:** Open `app/Http/Requests/UpdateStudentRequest.php` and replace its content with this:
    ```php
    <?php

    namespace App\Http\Requests;

    use Illuminate\Foundation\Http\FormRequest;

    class UpdateStudentRequest extends FormRequest
    {
        public function authorize(): bool
        {
            // Ensure the user can only update their own profile, or an admin can update any.
            // For now, we'll keep it simple.
            return true;
        }

        public function rules(): array
        {
            return [
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'date_of_birth' => 'sometimes|date',
                'gender' => 'sometimes|string',
                'nationality' => 'sometimes|string',
                'address' => 'sometimes|string',
                'city' => 'sometimes|string',
                'state' => 'sometimes|string',
                'postal_code' => 'sometimes|string',
                'country' => 'sometimes|string',
                'phone' => 'sometimes|string',
                'emergency_contact_name' => 'sometimes|string',
                'emergency_contact_phone' => 'sometimes|string',
            ];
        }
    }
    ```

4.  **Refactor `StudentController`:** Open `app/Http/Controllers/StudentController.php`.
    *   Import the new request classes at the top.
    *   Replace the `Illuminate\Http\Request` with your new classes in the `store` and `update` method signatures.
    *   Remove the `$request->validate(...)` call from both methods and use `$request->validated()` instead.

    Your refactored methods should look like this:
    ```php
    // At the top of the file
    use App\Http\Requests\StoreStudentRequest;
    use App\Http\Requests\UpdateStudentRequest;
    
    // ...

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());
        return redirect()->route('students.index')->with('success', 'Student created successfully.');
    }

    // ...

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());
        return redirect()->route('students.show', $student->id)->with('success', 'Student updated successfully.');
    }
    ```

---

### ✅ Task 2: Isolate Business Logic with Service Classes - COMPLETED ✅

**Goal:** Move complex business logic out of controllers and into dedicated "Service" classes.

**Instructions for `AdmissionApplicationController`:**

1.  **Create the Service Class:**
    *   Create a new directory: `app/Services`.
    *   Create a new file inside it: `app/Services/AdmissionService.php`.

2.  **Add Logic to `AdmissionService`:** Open the new file and add the following code:
    ```php
    <?php

    namespace App\Services;

    use App\Models\Student;
    use App\Models\AdmissionApplication;
    use Illuminate\Support\Facades\Log;

    class AdmissionService
    {
        /**
         * Create a new draft admission application for a student.
         *
         * @param Student $student The student applying.
         * @param array $data Validated data for the application.
         * @return AdmissionApplication
         */
        public function createDraftApplication(Student $student, array $data): AdmissionApplication
        {
            // This is where business logic lives. For example, check for existing drafts.
            $existingDraft = $student->admissionApplications()->where('status', 'draft')->first();

            if ($existingDraft) {
                Log::info("Student {$student->id} already has a draft application. Returning existing one.");
                return $existingDraft;
            }

            // Create the new application
            return $student->admissionApplications()->create([
                ...$data,
                'application_date' => now(),
                'status' => 'draft' // Explicitly set status
            ]);
        }
    }
    ```

3.  **Refactor `AdmissionApplicationController`:**
    *   Open `app/Http/Controllers/AdmissionApplicationController.php`.
    *   Import the `AdmissionService`.
    *   Use dependency injection to get an instance of the service in the `store` method.
    *   Call the service to handle the logic.

    The refactored `store` method should look like this:
    ```php
    // At the top of the file
    use App\Services\AdmissionService;
    use Illuminate\Http\JsonResponse;
    // ... other imports

    // ...

    // Note: We are injecting AdmissionService directly into the method. Laravel handles this automatically.
    public function store(Request $request, Student $student, AdmissionService $admissionService): JsonResponse
    {
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
        ]);

        $application = $admissionService->createDraftApplication($student, $validated);

        return response()->json($application, 201);
    }
    ```

---

### ✅ Task 3: Standardize JSON Output with API Resources - COMPLETED ✅

**Goal:** Use API Resources to control and standardize the JSON output of your API, preventing accidental data exposure and ensuring a consistent structure.

**Instructions for `StudentController` API output:**

1.  **Generate Resource Classes:** Run this command to create a resource for the `Student` model:
    ```bash
    php artisan make:resource StudentResource
    ```

2.  **Define the `StudentResource`:** Open `app/Http/Resources/StudentResource.php` and define the structure of your student API response.
    ```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    class StudentResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'student_id_number' => $this->student_number,
                'name' => $this->first_name . ' ' . $this->last_name,
                'date_of_birth' => $this->date_of_birth->format('Y-m-d'),
                'nationality' => $this->nationality,
                'profile_complete' => $this->hasCompleteProfile(), // From your Student model
                
                // Use whenLoaded to include relationships only when they are explicitly loaded in the controller.
                // This prevents N+1 query problems.
                'applications' => AdmissionApplicationResource::collection($this->whenLoaded('admissionApplications')),
                'documents' => DocumentResource::collection($this->whenLoaded('documents')),
                'academic_records' => AcademicRecordResource::collection($this->whenLoaded('academicRecords')),
            ];
        }
    }
    ```
    *(Note: This assumes you will also create `AdmissionApplicationResource`, `DocumentResource`, and `AcademicRecordResource` for the nested data. You can generate them with the same `php artisan make:resource` command.)*

3.  **Refactor `StudentController` `show` Method:**
    *   Open `app/Http/Controllers/StudentController.php`.
    *   Import the `StudentResource`.
    *   In the `show` method, load the necessary relationships and then return a new instance of your resource.

    The refactored method will look like this:
    ```php
    // At the top of the file
    use App\Http\Resources\StudentResource;

    // ...
    public function show(Student $student)
    {
        // Eager load the relationships you want to include in the response.
        $student->load(['academicRecords', 'documents', 'admissionApplications.programChoices.program']);

        // Instead of returning an Inertia view or raw JSON, return the resource.
        // The resource will format the final JSON output.
        return new StudentResource($student);
    }
    ```
    *(Note: To make this work, the `show` route should be part of your `api.php` routes file, not `web.php` since it's now returning JSON.)*

---

### ✅ Task 5: Implement Academic Hierarchy - COMPLETED ✅

**Goal:** Restructure the `Program` model to be part of a formal `Faculty` -> `Department` hierarchy.

**✅ IMPLEMENTATION COMPLETED:**
- ✅ Created Faculty and Department models with migrations
- ✅ Updated programs table to use department_id foreign key instead of department string
- ✅ Defined all model relationships (Faculty->departments, Department->faculty/programs, Program->department)
- ✅ Updated ProgramController validation to use department_id with exists validation
- ✅ Added eager loading for department.faculty relationships in ProgramController
- ✅ Created comprehensive test suite (14 tests, 50 assertions)
- ✅ Created AcademicHierarchySeeder with realistic university structure
- ✅ All tests passing, including cascade delete and set null verification

**Key Features Implemented:**
- Three-tier hierarchy: Faculty -> Department -> Program
- Proper foreign key constraints with cascade delete (Faculty->Department) and set null (Department->Program)
- Factory classes for easy test data generation
- Comprehensive seeder with 4 faculties, 10+ departments, and 8+ programs
- Updated validation and eager loading in controllers

1.  **Create `Faculty` and `Department` Models & Migrations:**
    ```bash
    php artisan make:model Faculty -m
    php artisan make:model Department -m
    ```

2.  **Define New Migrations:**
    *   In `..._create_faculties_table.php`:
        ```php
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
        ```
    *   In `..._create_departments_table.php`:
        ```php
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });
        ```

3.  **Create Migration to Update `programs` Table:**
    ```bash
    php artisan make:migration update_programs_table_for_hierarchy --table=programs
    ```
    *   Open the new file `..._update_programs_table_for_hierarchy.php` and modify the `up` and `down` methods:
        ```php
        public function up(): void
        {
            Schema::table('programs', function (Blueprint $table) {
                // Add the new foreign key column after 'name'
                $table->foreignId('department_id')->nullable()->after('name')->constrained()->onDelete('set null');
                // Remove the old string column
                $table->dropColumn('department');
            });
        }

        public function down(): void
        {
            Schema::table('programs', function (Blueprint $table) {
                $table->dropConstrainedForeignId('department_id');
                $table->string('department')->after('name');
            });
        }
        ```

4.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

5.  **Define Model Relationships:**
    *   In `app/Models/Faculty.php`:
        ```php
        public function departments()
        {
            return $this->hasMany(Department::class);
        }
        ```
    *   In `app/Models/Department.php`:
        ```php
        public function faculty()
        {
            return $this->belongsTo(Faculty::class);
        }

        public function programs()
        {
            return $this->hasMany(Program::class);
        }
        ```
    *   In `app/Models/Program.php`:
        ```php
        public function department()
        {
            return $this->belongsTo(Department::class);
        }
        ```

6.  **Update `ProgramController` Validation:** Remember to update the validation in `ProgramController` (or its new `FormRequest`) to use `department_id` instead of `department`. 

---

## Project Roadmap: From Foundation to Production

This section provides a high-level overview of the development phases to build a complete, professional-grade university management system.

### Phase 1: ✅ Foundation (COMPLETED)
- Data Models & RBAC
- Academic Hierarchy
- Best Practices Implementation

### Phase 1.5: 🎯 Complete University Core (CRITICAL - 3-4 weeks)
- Academic Operations (Courses, Enrollment, Grading)
- Faculty & Staff Management
- Physical Infrastructure
- Financial Management
- Workflow & Notifications

### Phase 2: 🔧 Backend Excellence (2-3 weeks)
- API Completion & Documentation
- File Upload & Document Management
- Advanced Security & Performance
- Integration & Testing

### Phase 3: 🎨 Frontend Excellence (3-4 weeks)
- Student Portal & Admin Dashboard
- Course Registration & Management
- Reporting & Analytics Interface
- Mobile Responsiveness

### Phase 4: 🚀 Production Deployment (1-2 weeks)
- Infrastructure & DevOps
- Security & Monitoring
- Go-Live Preparation

---
## Section 3: Building the Complete University Core (Phase 1.5)

This section focuses on creating the core data models that transform the application from an admissions system into a full-fledged university management system. Each task includes models, migrations, relationships, and comprehensive tests.

### ✅ Task 6: Implement Academic Calendar & Terms - COMPLETED

**Goal:** Create a robust system for managing academic terms and important dates, removing hardcoded strings like `academic_year` and `semester`.

1.  **Create `Term` Model and Migration:**
    ```bash
    php artisan make:model Term -m
    ```
    -   In the `..._create_terms_table.php` migration:
        ```php
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Fall 2024"
            $table->unsignedSmallInteger('academic_year'); // e.g., 2024
            $table->string('semester'); // e.g., "Fall", "Spring", "Summer"
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
            $table->unique(['academic_year', 'semester']);
        });
        ```

2.  **Update `AdmissionApplication` to use `term_id`:**
    ```bash
    php artisan make:migration update_admission_applications_for_terms --table=admission_applications
    ```
    -   In the new migration file:
        ```php
        public function up(): void
        {
            Schema::table('admission_applications', function (Blueprint $table) {
                $table->foreignId('term_id')->nullable()->after('student_id')->constrained()->onDelete('set null');
                $table->dropColumn(['academic_year', 'semester']);
            });
        }
        
        public function down(): void
        {
            Schema::table('admission_applications', function (Blueprint $table) {
                $table->string('academic_year');
                $table->string('semester');
                $table->dropConstrainedForeignId('term_id');
            });
        }
        ```
    
3.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

4.  **Update Models:**
    -   In `app/Models/Term.php`:
        ```php
        protected $fillable = ['name', 'academic_year', 'semester', 'start_date', 'end_date'];
        
        public function admissionApplications()
        {
            return $this->hasMany(AdmissionApplication::class);
        }
        ```
    -   In `app/Models/AdmissionApplication.php`, update the `fillable` array and add the new relationship:
        ```php
        // ... existing code ...
        protected $fillable = [
            'student_id', 'term_id', 'status', 'application_date', 
            'decision_date', 'decision_status', 'comments'
        ];
        // ... existing code ...
        public function term()
        {
            return $this->belongsTo(Term::class);
        }
        // ... existing code ...
        ```

### ✅ Task 7: Implement Course Catalog System - COMPLETED

**Goal:** Create a comprehensive catalog of all courses offered by the university.

1.  **Create `Course` Model and Migration:**
    ```bash
    php artisan make:model Course -m
    ```
    -   In the `..._create_courses_table.php` migration:
        ```php
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_code')->unique(); // e.g., "CS101"
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('credits');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        ```

2.  **Create Prerequisite Pivot Table:**
    ```bash
    php artisan make:migration create_course_prerequisites_table
    ```
    -   In the new migration file:
        ```php
        Schema::create('course_prerequisites', function (Blueprint $table) {
            $table->primary(['course_id', 'prerequisite_id']);
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('prerequisite_id')->constrained('courses')->onDelete('cascade');
            $table->timestamps();
        });
        ```

3.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

4.  **Update Models:**
    -   In `app/Models/Course.php`:
        ```php
        protected $fillable = ['course_code', 'title', 'description', 'credits', 'department_id'];

        public function department()
        {
            return $this->belongsTo(Department::class);
        }

        public function prerequisites()
        {
            return $this->belongsToMany(Course::class, 'course_prerequisites', 'course_id', 'prerequisite_id');
        }
        
        public function isPrerequisiteFor()
        {
            return $this->belongsToMany(Course::class, 'course_prerequisites', 'prerequisite_id', 'course_id');
        }
        ```

### ✅ Task 8: Implement Staff Management - COMPLETED

**Goal:** Create a system to manage faculty and administrative staff information, linking them to users.

1.  **Create `Staff` Model and Migration:**
    ```bash
    php artisan make:model Staff -m
    ```
    -   In the `..._create_staff_table.php` migration:
        ```php
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->string('job_title'); // e.g., "Professor", "Admissions Officer"
            $table->string('office_location')->nullable();
            $table->string('phone_number')->nullable();
            $table->date('hire_date');
            $table->timestamps();
        });
        ```

2.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

3.  **Update Models:**
    -   In `app/Models/User.php`, add the `staff` relationship:
        ```php
        // ... existing code ...
        public function getAllPermissions()
        {
            // ... existing code ...
        }

        public function staff()
        {
            return $this->hasOne(Staff::class);
        }
    }
        ```
    -   In `app/Models/Staff.php`:
        ```php
        protected $fillable = ['user_id', 'department_id', 'job_title', 'office_location', 'phone_number', 'hire_date'];

        public function user()
        {
            return $this->belongsTo(User::class);
        }

        public function department()
        {
            return $this->belongsTo(Department::class);
        }
        ```

### ✅ Task 9: Implement Physical Infrastructure - COMPLETED

**Goal:** Model the university's physical campus, including buildings and rooms.

1.  **Create `Building` and `Room` Models & Migrations:**
    ```bash
    php artisan make:model Building -m
    php artisan make:model Room -m
    ```
    -   In `..._create_buildings_table.php`:
        ```php
        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address')->nullable();
            $table->timestamps();
        });
        ```
    -   In `..._create_rooms_table.php`:
        ```php
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained()->onDelete('cascade');
            $table->string('room_number');
            $table->unsignedSmallInteger('capacity');
            $table->enum('type', ['classroom', 'lab', 'lecture_hall', 'office', 'other']);
            $table->timestamps();
            $table->unique(['building_id', 'room_number']);
        });
        ```

2.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

3.  **Update Models:**
    -   In `app/Models/Building.php`:
        ```php
        protected $fillable = ['name', 'address'];

        public function rooms()
        {
            return $this->hasMany(Room::class);
        }
        ```
    -   In `app/Models/Room.php`:
        ```php
        protected $fillable = ['building_id', 'room_number', 'capacity', 'type'];

        public function building()
        {
            return $this->belongsTo(Building::class);
        }
        ```

### ✅ Task 10: Implement Class Scheduling & Sections - COMPLETED

**Goal:** Create specific instances (sections) of courses for a given term, with assigned instructors and locations.

1.  **Create `CourseSection` Model and Migration:**
    ```bash
    php artisan make:model CourseSection -m
    ```
    -   In `..._create_course_sections_table.php`:
        ```php
        Schema::create('course_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->foreignId('instructor_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->string('section_number'); // e.g., "001", "A"
            $table->unsignedSmallInteger('capacity');
            $table->string('schedule_days')->nullable(); // e.g., "MWF", "TTh"
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->timestamps();
            $table->unique(['course_id', 'term_id', 'section_number']);
        });
        ```

2.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

3.  **Update Models:**
    -   In `app/Models/CourseSection.php`:
        ```php
        protected $fillable = ['course_id', 'term_id', 'instructor_id', 'room_id', 'section_number', 'capacity', 'schedule_days', 'start_time', 'end_time'];

        public function course() { return $this->belongsTo(Course::class); }
        public function term() { return $this->belongsTo(Term::class); }
        public function instructor() { return $this->belongsTo(Staff::class, 'instructor_id'); }
        public function room() { return $this->belongsTo(Room::class); }
        ```

### ✅ Task 11: Implement Student Enrollment System - COMPLETED

**Goal:** Build the system that allows students to enroll in course sections and tracks their academic progress.

1.  **Create `Enrollment` Model and Migration:**
    ```bash
    php artisan make:model Enrollment -m
    ```
    -   In `..._create_enrollments_table.php`:
        ```php
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_section_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['enrolled', 'waitlisted', 'completed', 'withdrawn'])->default('enrolled');
            $table->string('grade')->nullable(); // e.g., "A", "B+", "P" for Pass/Fail
            $table->timestamps();
            $table->unique(['student_id', 'course_section_id']);
        });
        ```

2.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

3.  **Update Models:**
    -   In `app/Models/Enrollment.php`:
        ```php
        protected $fillable = ['student_id', 'course_section_id', 'status', 'grade'];

        public function student() { return $this->belongsTo(Student::class); }
        public function courseSection() { return $this->belongsTo(CourseSection::class); }
        ```
    -   In `app/Models/Student.php`, add the `enrollments` relationship:
        ```php
        // ... existing code ...
        public function hasCompleteProfile(): bool
        {
            // ... existing code ...
        }

        public function enrollments()
        {
            return $this->hasMany(Enrollment::class);
        }
    }
        ```
    -   In `app/Models/CourseSection.php`, add the `enrollments` relationship:
        ```php
        // ... existing code ...
        public function room() { return $this->belongsTo(Room::class); }

        public function enrollments()
        {
            return $this->hasMany(Enrollment::class);
        }
        ```

## Phase 2: API Layer Implementation

With a robust and tested data model in place, this phase focuses on building a secure, efficient, and well-structured API to interact with the core university data. We will follow best practices, including using controllers for orchestration, form requests for validation, and API resources for transforming output.

For each task, the workflow will be:
1.  **Implement**: Write the code for the controller, resource, and routes.
2.  **Test**: Create a feature test to validate the new endpoints.
3.  **Checkpoint**: All tests must pass before proceeding. Verify API endpoints work correctly with proper JSON responses, validation, and relationships.
4.  **Git Commit**: Once tests pass, commit the changes to version control.
5.  **Approval**: Get approval from a team member.
6.  **Next Task**: Move on to the next task.

---

### ✅ Task 17: Implement Building and Room APIs (Infrastructure) - COMPLETED

**Goal:** Create comprehensive API endpoints for managing university physical infrastructure - buildings and rooms.

**⚠️ CHECKPOINT PROCESS:**
1.  **Implement**: Write the code for the controller, resource, and routes.
2.  **Test**: Create a feature test to validate the new endpoints.
3.  **Checkpoint**: All tests must pass before proceeding. Verify API endpoints work correctly with proper JSON responses, validation, and relationships.
4.  **Git Commit**: Once tests pass, commit the changes to version control.
5.  **Approval**: Get approval from a team member.
6.  **Next Task**: Move on to the next task.

**🔍 CHECKPOINT:** All tests must pass before proceeding. Verify API endpoints work correctly with proper JSON responses, validation, and relationships.

---

### ✅ Task 18: Implement CourseSection API (Complex Academic Core) - COMPLETED

**Goal:** Create API endpoints for managing course sections - the heart of academic scheduling that connects courses, terms, instructors, and rooms.

**⚠️ CHECKPOINT PROCESS:**
1.  **Implement**: Write the code for the controller, resource, and routes.
2.  **Test**: Create a feature test to validate the new endpoints.
3.  **Checkpoint**: All tests must pass. Verify complex filtering, relationships, and business logic work correctly.
4.  **Git Commit**: Once tests pass, commit the changes to version control.
5.  **Approval**: Get approval from a team member.
6.  **Next Task**: Move on to the next task.

**🔍 CHECKPOINT:** All tests must pass. Verify complex filtering, relationships, and business logic work correctly.

---

### ✅ Task 19: Implement Enrollment API (Student Registration System) - COMPLETED ✅

**Goal:** Create API endpoints for managing student enrollments in course sections, including enrollment validation and capacity management.

**Scope:** This is the most complex API as it handles the core business logic of student registration, including capacity management, waitlist functionality, prerequisite validation, and enrollment status tracking.

**Implementation Requirements:**

1.  **Generate API Controller:**
    ```bash
    php artisan make:controller Api/V1/EnrollmentController --api
    ```

2.  **Create API Resource:**
    ```bash
    php artisan make:resource EnrollmentResource
    ```
    - Include student information (name, student number)
    - Include course section details (course code, title, section, term)
    - Include instructor and room information
    - Include enrollment status and grade
    - Add computed fields for enrollment date, grade points, etc.

3.  **Create Form Requests:**
    ```bash
    php artisan make:request StoreEnrollmentRequest
    php artisan make:request UpdateEnrollmentRequest
    ```
    - Validate student_id exists and is active
    - Validate course_section_id exists and is available for enrollment
    - Implement business logic validation:
      - Check course section capacity
      - Prevent duplicate enrollments
      - Validate enrollment timing (within registration period)
      - Check prerequisites (if implemented)
    - For updates: validate status transitions (enrolled → completed/withdrawn)
    - For grading: validate grade format and instructor permissions

4.  **Controller Features:**
    - **Index**: List enrollments with filtering by:
      - Student (student_id)
      - Course section (course_section_id)
      - Term (via course section relationship)
      - Status (enrolled, waitlisted, completed, withdrawn)
      - Course (via course section relationship)
      - Department (via course → department relationship)
    - **Store**: Enroll student with business logic:
      - Check capacity and add to waitlist if full
      - Validate prerequisites
      - Prevent duplicate enrollments
      - Return appropriate status codes and messages
    - **Show**: Display single enrollment with full relationships
    - **Update**: Modify enrollment status, grade, or other fields
    - **Destroy**: Withdraw/drop enrollment (soft delete concept)

5.  **API Routes:**
    ```php
    // In routes/api.php
    Route::apiResource('enrollments', EnrollmentController::class);
    
    // Additional custom routes for business logic:
    Route::post('enrollments/{enrollment}/withdraw', [EnrollmentController::class, 'withdraw']);
    Route::post('enrollments/{enrollment}/complete', [EnrollmentController::class, 'complete']);
    Route::get('students/{student}/enrollments', [EnrollmentController::class, 'byStudent']);
    Route::get('course-sections/{courseSection}/enrollments', [EnrollmentController::class, 'byCourseSection']);
    ```

6.  **Business Logic Requirements:**
    - **Capacity Management**: Check course section capacity before enrollment
    - **Waitlist Logic**: Automatically move students from waitlist when spots open
    - **Status Transitions**: Enforce valid status changes (enrolled → completed/withdrawn)
    - **Duplicate Prevention**: Ensure students can't enroll in same course section twice
    - **Grade Management**: Allow instructors to assign grades to completed enrollments

7.  **Expected JSON Structure:**
    ```json
    {
      "data": {
        "id": 1,
        "status": "enrolled",
        "grade": null,
        "enrolled_at": "2024-01-15T10:30:00Z",
        "student": {
          "id": 1,
          "student_number": "STU001",
          "name": "John Doe"
        },
        "course_section": {
          "id": 1,
          "section_number": "001",
          "capacity": 30,
          "enrolled_count": 25,
          "available_spots": 5,
          "course": {
            "id": 1,
            "course_code": "CS101",
            "title": "Introduction to Computer Science",
            "credits": 3
          },
          "term": {
            "id": 1,
            "name": "Fall 2024",
            "academic_year": 2024,
            "semester": "Fall"
          },
          "instructor": {
            "id": 1,
            "name": "Dr. Smith",
            "job_title": "Professor"
          },
          "room": {
            "id": 1,
            "room_number": "101",
            "building": {
              "name": "Science Building"
            }
          }
        }
      }
    }
    ```

**Testing Requirements:**

Create `tests/Feature/Api/V1/EnrollmentApiTest.php` with comprehensive tests:

1.  **Basic CRUD Operations:**
    - Test enrollment creation with valid data
    - Test enrollment listing with pagination
    - Test single enrollment retrieval
    - Test enrollment updates (status, grade)
    - Test enrollment deletion/withdrawal

2.  **Business Logic Tests:**
    - Test capacity management (enrollment vs waitlist)
    - Test duplicate enrollment prevention
    - Test status transition validation
    - Test grade assignment validation
    - Test filtering by various criteria

3.  **Relationship Tests:**
    - Test eager loading of student, course section, course, term, instructor, room
    - Test nested filtering (by course, department, term)

4.  **Validation Tests:**
    - Test required field validation
    - Test foreign key validation
    - Test business rule validation
    - Test authorization (students can only see their enrollments)

5.  **Edge Cases:**
    - Test enrollment in full course section (waitlist)
    - Test withdrawal and capacity adjustment
    - Test invalid status transitions
    - Test enrollment in non-existent course section

**⚠️ CHECKPOINT PROCESS:**
1.  **Implement**: Write the code for the controller, resource, form requests, and routes.
2.  **Test**: Create comprehensive feature tests covering all business logic.
3.  **Checkpoint**: All tests must pass. Verify enrollment business logic, capacity management, and waitlist functionality work correctly.
4.  **Git Commit**: Once tests pass, commit the changes to version control.
5.  **Approval**: Get approval from a team member.
6.  **Next Task**: Move on to the next task.

**🔍 CHECKPOINT:** All tests must pass. Verify enrollment business logic, capacity management, waitlist functionality, and complex relationship loading work correctly. This API should handle the core student registration workflow seamlessly.

---

</rewritten_file>