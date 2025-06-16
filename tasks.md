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

### ✅ Task 2: Isolate Business Logic with Service Classes

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

### ✅ Task 3: Standardize JSON Output with API Resources

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

### Task 6: Implement Academic Calendar & Terms

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

### Task 7: Implement Course Catalog System

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

### Task 8: Implement Staff Management

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

### Task 9: Implement Physical Infrastructure

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

### Task 10: Implement Class Scheduling & Sections

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

### Task 11: Implement Student Enrollment System

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
3.  **Commit & Push**: Once tests pass, commit the changes to version control.

---

### Task 12: Implement Faculty API Endpoints

**Goal:** Create API endpoints for managing `Faculty` resources. This will allow clients to list, view, create, update, and delete faculties.

1.  **Create Controller**: Generate a new API controller for the `Faculty` model.
    ```bash
    php artisan make:controller Api/V1/FacultyController --api --model=Faculty
    ```

2.  **Create API Resource**: Generate a resource to control the JSON output for the `Faculty` model.
    ```bash
    php artisan make:resource FacultyResource
    ```

3.  **Define `FacultyResource`**: Open `app/Http/Resources/FacultyResource.php` and define its structure.
    ```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    class FacultyResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                // Include departments only when the relationship is loaded
                'departments' => DepartmentResource::collection($this->whenLoaded('departments')),
            ];
        }
    }
    ```

4.  **Implement Controller Methods**: In `app/Http/Controllers/Api/V1/FacultyController.php`, implement the CRUD methods. Use route model binding and the new `FacultyResource`.
    ```php
    // index() - List all faculties
    public function index()
    {
        return FacultyResource::collection(Faculty::with('departments')->paginate());
    }

    // show() - Show a single faculty
    public function show(Faculty $faculty)
    {
        return new FacultyResource($faculty->load('departments'));
    }
    
    // store() - Create a new faculty (add validation with a FormRequest later)
    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:faculties|max:255']);
        $faculty = Faculty::create($validated);
        return response()->json(new FacultyResource($faculty), 201);
    }
    
    // update() - Update a faculty
    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate(['name' => 'sometimes|string|unique:faculties,name,'.$faculty->id.'|max:255']);
        $faculty->update($validated);
        return new FacultyResource($faculty);
    }

    // destroy() - Delete a faculty
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return response()->noContent();
    }
    ```

5.  **Define API Routes**: Add the resource route to `routes/api.php`.
    ```php
    use App\Http\Controllers\Api\V1\FacultyController;

    Route::apiResource('v1/faculties', FacultyController::class);
    ```

6.  **Create Feature Test**: Create a test file to validate the API endpoints.
    ```bash
    php artisan make:test Api/V1/FacultyApiTest
    ```
    *   Write tests for `GET /api/v1/faculties`, `GET /api/v1/faculties/{id}`, `POST /api/v1/faculties`, `PUT/PATCH /api/v1/faculties/{id}`, and `DELETE /api/v1/faculties/{id}`.
    *   Ensure tests cover success cases, validation errors, and not found errors.

---

### Task 13: Implement Department API Endpoints

**Goal:** Create API endpoints for managing `Department` resources.

1.  **Create Controller**: Generate a new API controller for the `Department` model.
    ```bash
    php artisan make:controller Api/V1/DepartmentController --api --model=Department
    ```

2.  **Update `DepartmentResource`**: Open `app/Http/Resources/DepartmentResource.php` and add the related faculty and programs.
    ```php
    <?php

    namespace App\Http\Resources;

    use Illuminate\Http\Request;
    use Illuminate\Http\Resources\Json\JsonResource;

    class DepartmentResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'faculty' => new FacultyResource($this->whenLoaded('faculty')),
                'programs' => ProgramResource::collection($this->whenLoaded('programs')),
            ];
        }
    }
    ```
    *(Note: This requires creating a `ProgramResource` as well)*

3.  **Implement Controller Methods**: In `app/Http/Controllers/Api/V1/DepartmentController.php`, implement the CRUD methods.
    ```php
    // Example for index() method
    public function index(Request $request)
    {
        $query = Department::with('faculty', 'programs');

        // Allow filtering by faculty
        if ($request->has('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        return DepartmentResource::collection($query->paginate());
    }
    
    // Implement store(), show(), update(), destroy() similarly, including validation.
    ```

4.  **Define API Routes**: Add the resource route to `routes/api.php`.
    ```php
    use App\Http\Controllers\Api\V1\DepartmentController;

    Route::apiResource('v1/departments', DepartmentController::class);
    ```

5.  **Create Feature Test**: Create a test file to validate the API endpoints.
    ```bash
    php artisan make:test Api/V1/DepartmentApiTest
    ```
    *   Write tests for all CRUD operations, including the `faculty_id` filter.

---

### Task 14: Implement Program API Endpoints

**Goal:** Create API endpoints for managing `Program` resources.

1.  **Create Controller**: Generate a new API controller for the `Program` model.
    ```bash
    php artisan make:controller Api/V1/ProgramController --api --model=Program
    ```

2.  **Update `ProgramResource`**: Open `app/Http/Resources/ProgramResource.php` and ensure it includes the department.
    ```php
    <?php
    // ...
    class ProgramResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'department' => new DepartmentResource($this->whenLoaded('department')),
                // ... other fields
            ];
        }
    }
    ```

3.  **Implement Controller Methods**: In `app/Http/Controllers/Api/V1/ProgramController.php`, implement the CRUD methods. Include filtering by `department_id`.
    ```php
    // Example for index() method
    public function index(Request $request)
    {
        $query = Program::with('department');

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return ProgramResource::collection($query->paginate());
    }
    
    // Implement other methods
    ```

4.  **Define API Routes**: Add the resource route to `routes/api.php`.
    ```php
    use App\Http\Controllers\Api\V1\ProgramController;

    Route::apiResource('v1/programs', ProgramController::class);
    ```

5.  **Create Feature Test**: Create a test file to validate the API endpoints.
    ```bash
    php artisan make:test Api/V1/ProgramApiTest
    ```

### Task 15: Implement Course API Endpoints

**Goal:** Create API endpoints for managing `Course` resources, including their prerequisites.

1.  **Create Controller**:
    ```bash
    php artisan make:controller Api/V1/CourseController --api --model=Course
    ```

2.  **Create API Resource**:
    ```bash
    php artisan make:resource CourseResource
    ```

3.  **Define `CourseResource`**: This resource should handle nested relationships for the department and prerequisites.
    ```php
    <?php
    // ...
    class CourseResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'title' => $this->title,
                'course_code' => $this->course_code,
                'credits' => $this->credits,
                'description' => $this->description,
                'department' => new DepartmentResource($this->whenLoaded('department')),
                'prerequisites' => CourseResource::collection($this->whenLoaded('prerequisites')),
            ];
        }
    }
    ```

4.  **Implement Controller Methods**: In `app/Http/Controllers/Api/V1/CourseController.php`, implement the CRUD methods. Include filtering by `department_id`.
    ```php
    // Example for index() method
    public function index(Request $request)
    {
        $query = Course::with(['department', 'prerequisites']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return CourseResource::collection($query->paginate());
    }
    
    // In store() and update(), you'll need logic to sync prerequisites.
    // Example for store():
    // $course = Course::create($validatedData);
    // if (isset($validatedData['prerequisites'])) {
    //     $course->prerequisites()->sync($validatedData['prerequisites']);
    // }
    ```

5.  **Define API Routes**:
    ```php
    use App\Http\Controllers\Api\V1\CourseController;

    Route::apiResource('v1/courses', CourseController::class);
    ```

6.  **Create Feature Test**:
    ```bash
    php artisan make:test Api/V1/CourseApiTest
    ```
    *   Include tests for filtering and for correctly attaching/detaching prerequisites.

---

### Task 16: Implement Staff API Endpoints

**Goal:** Create API endpoints for managing `Staff` resources. This will involve linking `Staff` records to `User` and `Department` records.

1.  **Create Controller**:
    ```bash
    php artisan make:controller Api/V1/StaffController --api --model=Staff
    ```

2.  **Create API Resource**:
    ```bash
    php artisan make:resource StaffResource
    ```

3.  **Define `StaffResource`**: This resource should include nested `User` and `Department` data.
    ```php
    <?php
    // ...
    class StaffResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'job_title' => $this->job_title,
                'bio' => $this->bio,
                'office_location' => $this->office_location,
                'user' => new UserResource($this->whenLoaded('user')),
                'department' => new DepartmentResource($this->whenLoaded('department')),
            ];
        }
    }
    ```
    *(Note: This assumes a `UserResource` exists. We may need to create or refine it.)*

4.  **Implement Controller Methods**: In `app/Http/Controllers/Api/V1/StaffController.php`, implement the CRUD methods. Include filtering by `department_id`. The `store` method will need to create a `User` first, then create the `Staff` record linked to it.

5.  **Define API Routes**:
    ```php
    use App\Http\Controllers\Api\V1\StaffController;

    Route::apiResource('v1/staff', StaffController::class);
    ```

6.  **Create Feature Test**:
    ```bash
    php artisan make:test Api/V1/StaffApiTest
    ```
    *   Write tests for all CRUD operations.
    *   Test the creation of a `User` and `Staff` member together.
    *   Test filtering by department.

### Task 17: Implement Term API Endpoints

**Goal:** Create API endpoints for managing academic `Term` resources.

1.  **Create Controller**:
    ```bash
    php artisan make:controller Api/V1/TermController --api --model=Term
    ```

2.  **Create API Resource**:
    ```bash
    php artisan make:resource TermResource
    ```

3.  **Define `TermResource`**:
    ```php
    <?php
    // ...
    class TermResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'name' => $this->name,
                'academic_year' => $this->academic_year,
                'semester' => $this->semester,
                'start_date' => $this->start_date,
                'end_date' => $this->end_date,
            ];
        }
    }
    ```

4.  **Implement Controller Methods**: In `app/Http/Controllers/Api/V1/TermController.php`, implement the CRUD methods. Include filtering by `academic_year`.

5.  **Define API Routes**:
    ```php
    use App\Http\Controllers\Api\V1\TermController;

    Route::apiResource('v1/terms', TermController::class);
    ```

6.  **Create Feature Test**:
    ```bash
    php artisan make:test Api/V1/TermApiTest
    ```
    *   Write tests for all CRUD operations.
    *   Test filtering by `academic_year`.

</rewritten_file> 