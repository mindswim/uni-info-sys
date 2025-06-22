# Code Standardization Guide

## Purpose
This guide provides a systematic approach to standardizing the codebase for maximum readability, consistency, and maintainability without introducing bugs or requiring major refactoring. It follows a tiered approach from universal principles to specific file types.

## Philosophy: The 90/10 Rule
Focus on changes that provide 90% of the value with 10% of the effort:
- ✅ Documentation improvements
- ✅ Consistent formatting
- ✅ Standardized patterns
- ❌ No logic changes
- ❌ No architectural refactoring
- ❌ No breaking changes

---

## Tier 1: Universal Standards (All PHP Files)

### 1.1 File Structure Order
Every PHP file should follow this exact order:

```php
<?php

declare(strict_types=1);  // If using strict types

namespace App\Path\To\Class;

// 1. PHP built-in classes
use Exception;
use DateTime;

// 2. Laravel/Illuminate classes
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// 3. Third-party packages
use Carbon\Carbon;
use OpenApi\Attributes as OA;

// 4. App classes (grouped by type)
use App\Models\{Model1, Model2};
use App\Services\ServiceName;
use App\Http\Resources\ResourceName;
use App\Http\Requests\RequestName;
use App\Exceptions\ExceptionName;

// Class definition
class ClassName
{
    // Implementation
}
```

### 1.2 Import Organization Rules
- Group imports by origin (built-in → framework → third-party → app)
- Within app imports, group by type (models → services → resources → requests → exceptions)
- Use grouped imports for same namespace: `use App\Models\{Student, Course, Term};`
- Alphabetize within each group
- Remove unused imports

### 1.3 Method Organization Within Classes
```php
class ExampleClass
{
    // 1. Class constants
    private const MAX_ATTEMPTS = 3;
    
    // 2. Static properties
    private static array $cache = [];
    
    // 3. Instance properties
    private string $name;
    protected int $count;
    public bool $active;
    
    // 4. Constructor
    public function __construct()
    
    // 5. Static factory methods
    public static function create()
    
    // 6. Public methods (primary API)
    public function publicMethod()
    
    // 7. Protected methods
    protected function helperMethod()
    
    // 8. Private methods
    private function internalLogic()
    
    // 9. Magic methods
    public function __toString()
}
```

### 1.4 Documentation Standards

#### Method Documentation
```php
/**
 * Brief description of what the method does
 * 
 * @param string $param Description of parameter
 * @return array Description of return value
 * @throws ExceptionType When this exception is thrown
 */
public function methodName(string $param): array
```

#### Inline Comments
```php
// Single-line comment for simple explanations

/*
 * Multi-line comment for complex explanations
 * that need more than one line
 */

// TODO: Task to be done (with ticket number if applicable)
// FIXME: Known issue that needs fixing
// NOTE: Important information for other developers
```

### 1.5 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes | StudlyCase | `StudentController` |
| Methods | camelCase | `getStudentById()` |
| Properties | camelCase | `$firstName` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Database | snake_case | `student_number` |
| Routes | kebab-case | `course-sections` |
| Config keys | snake_case | `default_timeout` |

---

## Tier 2: Laravel-Specific Standards

### 2.1 Consistent Use of Facades vs Dependency Injection

**Standardize on Dependency Injection for testability:**
```php
// ❌ Avoid (harder to test)
public function handle()
{
    $users = DB::table('users')->get();
    Cache::put('key', $value);
}

// ✅ Prefer (easier to test and mock)
public function __construct(
    private Connection $db,
    private CacheManager $cache
) {}

public function handle()
{
    $users = $this->db->table('users')->get();
    $this->cache->put('key', $value);
}
```

**Exception: Use Facades for one-off operations in controllers**

### 2.2 Consistent Response Patterns

**For API Controllers:**
```php
// Success responses
return response()->json([
    'message' => 'Operation successful',
    'data' => new ResourceClass($model)
], 200);

// Error responses (handled by exception handler)
throw new CustomException('Error message');

// No content responses
return response()->json(null, 204);

// Collection responses
return ResourceClass::collection($paginated);
```

### 2.3 Consistent Authorization Patterns

**Use authorizeResource in constructor when possible:**
```php
public function __construct()
{
    $this->authorizeResource(Model::class, 'model');
}
```

**Use inline authorization for custom actions:**
```php
public function customAction(Model $model)
{
    $this->authorize('customAbility', $model);
}
```

---

## Tier 3: Controller-Specific Standards

### 3.1 OpenAPI Documentation
**Migrate all old-style annotations to PHP 8 attributes:**

```php
// ❌ Old style
/**
 * @OA\Get(
 *     path="/api/v1/resource",
 *     @OA\Response(response=200, description="Success")
 * )
 */

// ✅ New style
#[OA\Get(
    path: "/api/v1/resource",
    responses: [
        new OA\Response(response: 200, description: "Success")
    ]
)]
```

### 3.2 Controller Method Order
Always organize controller methods in RESTful order:
1. `index()` - GET /resource
2. `create()` - GET /resource/create (if applicable)
3. `store()` - POST /resource
4. `show()` - GET /resource/{id}
5. `edit()` - GET /resource/{id}/edit (if applicable)
6. `update()` - PUT/PATCH /resource/{id}
7. `destroy()` - DELETE /resource/{id}
8. Custom actions (alphabetically)

### 3.3 Consistent Parameter Handling
```php
public function index(Request $request): AnonymousResourceCollection
{
    $query = Model::query();
    
    // Consistent filter pattern
    $query->when($request->has('status'), function ($q) use ($request) {
        $q->where('status', $request->status);
    });
    
    // Consistent pagination
    return ResourceClass::collection(
        $query->paginate($request->get('per_page', 15))
    );
}
```

---

## Tier 4: Model-Specific Standards

### 4.1 Property Declaration Order
```php
class Student extends Model
{
    // 1. Traits
    use HasFactory, SoftDeletes;
    
    // 2. Table configuration
    protected $table = 'students';
    
    // 3. Mass assignment
    protected $fillable = [...];
    
    // 4. Casts
    protected $casts = [...];
    
    // 5. Dates
    protected $dates = [...];
    
    // 6. Appends
    protected $appends = [...];
    
    // 7. Hidden
    protected $hidden = [...];
    
    // 8. Relationships (belongsTo first, then hasMany, etc.)
    // 9. Scopes
    // 10. Accessors/Mutators
    // 11. Business logic methods
}
```

### 4.2 Relationship Method Naming
- Singular for: `belongsTo`, `hasOne`, `morphOne`
- Plural for: `hasMany`, `belongsToMany`, `morphMany`

```php
public function user(): BelongsTo          // Singular
public function enrollments(): HasMany      // Plural
public function courses(): BelongsToMany    // Plural
```

### 4.3 Scope Naming
Always prefix with `scope` and use descriptive names:
```php
public function scopeActive(Builder $query): Builder
public function scopeByTerm(Builder $query, int $termId): Builder
public function scopeWithGpaAbove(Builder $query, float $gpa): Builder
```

---

## Tier 5: Service Layer Standards

### 5.1 Service Method Organization
```php
class EnrollmentService
{
    // 1. Constructor with dependencies
    public function __construct(
        private NotificationService $notifications
    ) {}
    
    // 2. Primary public methods (main operations)
    public function enrollStudent(): Enrollment
    
    // 3. Secondary public methods (queries, helpers)
    public function getEnrollmentStats(): array
    
    // 4. Protected validation methods
    protected function validateEnrollment(): void
    
    // 5. Private helper methods
    private function checkPrerequisites(): void
}
```

### 5.2 Transaction Handling
Always wrap multi-step operations in transactions:
```php
public function complexOperation(): Model
{
    return DB::transaction(function () {
        // Step 1
        // Step 2
        // Step 3
        return $result;
    });
}
```

### 5.3 Error Handling
Use domain-specific exceptions:
```php
if (!$prerequisitesMet) {
    throw new PrerequisiteNotMetException($course->name);
}
```

---

## Tier 6: Test Standards

### 6.1 Test Method Naming
Use descriptive snake_case that reads like a sentence:
```php
public function test_student_can_enroll_in_available_course()
public function test_student_cannot_enroll_without_prerequisites()
public function test_admin_can_override_enrollment_capacity()
```

### 6.2 Test Organization (AAA Pattern)
```php
public function test_example()
{
    // Arrange - Set up test data
    $student = Student::factory()->create();
    $course = Course::factory()->create();
    
    // Act - Perform the action
    $response = $this->actingAs($student->user)
        ->postJson('/api/v1/enrollments', [...]);
    
    // Assert - Verify the outcome
    $response->assertStatus(201);
    $this->assertDatabaseHas('enrollments', [...]);
}
```

### 6.3 Test Data Builders
Create meaningful test data:
```php
// Use descriptive factory states
$student = Student::factory()
    ->active()
    ->withCompletedCourses(3)
    ->create();

// Use explicit test values
$course = Course::factory()->create([
    'code' => 'CS101',
    'title' => 'Introduction to Computer Science'
]);
```

---

## Tier 7: Request/Resource Standards

### 7.1 Form Request Validation Organization
```php
public function rules(): array
{
    return [
        // Required fields first
        'email' => 'required|email|unique:users',
        'name' => 'required|string|max:255',
        
        // Optional fields
        'phone' => 'nullable|string|max:20',
        
        // Conditional fields
        'guardian_name' => 'required_if:age,<,18',
    ];
}
```

### 7.2 API Resource Consistency
```php
public function toArray($request): array
{
    return [
        // Always include ID first
        'id' => $this->id,
        
        // Primary attributes
        'name' => $this->name,
        'email' => $this->email,
        
        // Computed attributes
        'full_name' => $this->first_name . ' ' . $this->last_name,
        
        // Conditional attributes
        'gpa' => $this->when($request->user()->can('view-gpa'), $this->gpa),
        
        // Relationships (always last)
        'enrollments' => EnrollmentResource::collection($this->whenLoaded('enrollments')),
        
        // Metadata
        'links' => [
            'self' => route('students.show', $this->id),
        ],
    ];
}
```

---

## Implementation Priority

### Phase 1: Documentation & Imports (2 hours)
1. Convert all @OA annotations to #[OA] attributes
2. Standardize import organization
3. Add missing method documentation

### Phase 2: Response Patterns (1 hour)
1. Standardize JSON response structures
2. Ensure consistent status codes
3. Add message keys to all responses

### Phase 3: Code Organization (1 hour)
1. Reorder class methods according to standards
2. Group related methods together
3. Ensure consistent property visibility

### Phase 4: Naming & Conventions (30 minutes)
1. Fix any naming inconsistencies
2. Ensure database queries use consistent patterns
3. Standardize variable names

### Phase 5: Test Improvements (1 hour)
1. Rename tests to be more descriptive
2. Ensure AAA pattern is followed
3. Add missing test scenarios

---

## Validation Checklist

After implementing changes:

```bash
# 1. Check PHP syntax
find app -name "*.php" -exec php -l {} \;

# 2. Run code style fixer (if configured)
./vendor/bin/php-cs-fixer fix --dry-run

# 3. Regenerate API documentation
./vendor/bin/sail artisan l5-swagger:generate

# 4. Run all tests
./vendor/bin/sail artisan test

# 5. Check for unused imports
./vendor/bin/sail composer require --dev barryvdh/laravel-ide-helper
./vendor/bin/sail artisan ide-helper:generate
```

---

## Benefits of Standardization

1. **Reduced Cognitive Load**: Consistent patterns mean less mental energy spent understanding code
2. **Faster Onboarding**: New developers can quickly understand the codebase
3. **Easier Maintenance**: Predictable structure makes changes safer
4. **Better Collaboration**: Team members write compatible code
5. **Professional Appearance**: Shows attention to detail in interviews

---

## Remember

- **Small changes, big impact**: Focus on readability over perfection
- **Document why, not what**: Code should be self-explanatory
- **Consistency over correctness**: Pick a pattern and stick to it
- **Test after each phase**: Ensure nothing breaks
- **Progress over perfection**: 80% standardized is better than 0%

This guide is a living document. Update it as you discover new patterns or make decisions about conventions. 