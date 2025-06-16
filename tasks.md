# University Admissions Backend: Task List

This document provides a granular, step-by-step task list to refactor the existing backend and expand its features based on the `BACKEND_ANALYSIS.md` document.

---

## Section 1: Refactoring for Excellence

This section focuses on improving the quality and organization of the existing code.

### ✅ Task 1: Refactor Validation with Form Requests

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

## Section 2: Expanding the Data Model

This section focuses on creating the new models and database tables required for advanced features.

### ✅ Task 4: Implement Role-Based Access Control (RBAC) - COMPLETED ✅

**Goal:** Create the necessary models and tables to manage user roles and permissions.

**✅ IMPLEMENTATION COMPLETED:**
- ✅ Created Role and Permission models with migrations
- ✅ Created pivot tables (role_user, permission_role) with proper foreign key constraints
- ✅ Defined all model relationships (User->roles, Role->users/permissions, Permission->roles)
- ✅ Added helper methods to User model (hasRole, hasAnyRole, hasPermission, getAllPermissions)
- ✅ Created comprehensive test suite (15 tests, 71 assertions)
- ✅ Created RolePermissionSeeder with realistic roles (admin, student, staff, moderator) and permissions
- ✅ All tests passing, including cascade delete verification and unique constraint tests

**Key Features Implemented:**
- Many-to-many relationships between Users, Roles, and Permissions
- Cascade delete on pivot tables to maintain data integrity
- Helper methods for easy role/permission checking
- Factory classes for testing
- Comprehensive seeder with realistic university roles and permissions

1.  **Create Models and Migrations:** Run these commands:
    ```bash
    php artisan make:model Role -m
    php artisan make:model Permission -m
    ```

2.  **Define `Role` and `Permission` Migrations:**
    *   Open the `..._create_roles_table.php` migration. Define the schema:
        ```php
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'admin', 'student'
            $table->string('description')->nullable();
            $table->timestamps();
        });
        ```
    *   Open the `..._create_permissions_table.php` migration. Define the schema:
        ```php
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'manage-applications', 'submit-documents'
            $table->string('description')->nullable();
            $table->timestamps();
        });
        ```

3.  **Create Pivot Table Migrations:** You need two more tables to link users, roles, and permissions.
    ```bash
    php artisan make:migration create_role_user_table
    php artisan make:migration create_permission_role_table
    ```

4.  **Define Pivot Table Schemas:**
    *   Open `..._create_role_user_table.php`:
        ```php
        Schema::create('role_user', function (Blueprint $table) {
            $table->primary(['user_id', 'role_id']);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        ```
    *   Open `..._create_permission_role_table.php`:
        ```php
        Schema::create('permission_role', function (Blueprint $table) {
            $table->primary(['permission_id', 'role_id']);
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        ```

5.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

6.  **Define Model Relationships:**
    *   In `app/Models/User.php`, add the roles relationship:
        ```php
        public function roles()
        {
            return $this->belongsToMany(Role::class);
        }
        ```
    *   In `app/Models/Role.php`, add the relationships to users and permissions:
        ```php
        public function users()
        {
            return $this->belongsToMany(User::class);
        }

        public function permissions()
        {
            return $this->belongsToMany(Permission::class);
        }
        ```
    *   In `app/Models/Permission.php`, add the roles relationship:
        ```php
        public function roles()
        {
            return $this->belongsToMany(Role::class);
        }
        ```

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