# Testing Audit Framework - Evergreen Resource

## 🎯 Purpose
This document provides a systematic approach to ensure complete test coverage by auditing what exists versus what should be tested. Use this as a recurring process to maintain testing confidence.

## 📋 Testing Audit Process

### **Phase 1: Inventory What Needs Testing**

#### **1.1 Application Logic Locations**
These folders contain code that requires testing:

```bash
app/
├── Controllers/           # API endpoints & request handling
├── Services/             # Business logic & workflows  
├── Models/               # Data logic & relationships
├── Jobs/                 # Background processing
├── Exceptions/           # Custom error handling
├── Filters/              # Query filtering logic
├── Policies/             # Authorization logic
├── Rules/                # Custom validation rules
├── Observers/            # Model event handling
└── Console/Commands/     # Artisan commands
```

#### **1.2 Code Elements Requiring Tests**
Within each file, identify:

**Controllers:**
- ✅ Each public method (index, store, show, update, destroy)
- ✅ Authorization checks
- ✅ Validation logic
- ✅ Error responses
- ✅ Success responses

**Services:**
- ✅ Each public method
- ✅ Business rule enforcement
- ✅ Exception handling
- ✅ Transaction logic
- ✅ External integrations

**Models:**
- ✅ Relationships (hasMany, belongsTo, etc.)
- ✅ Scopes (local and global)
- ✅ Accessors & mutators
- ✅ Custom methods
- ✅ Validation rules

**Jobs:**
- ✅ Handle method logic
- ✅ Failed method logic
- ✅ Queue configuration
- ✅ Retry logic

### **Phase 2: Create Testing Inventory**

#### **2.1 Automated Inventory Generation**
```bash
# Create a script to scan your codebase
./scripts/generate-testing-inventory.sh

# This should output:
# - All controller methods
# - All service methods  
# - All model methods
# - All job classes
# - All custom classes
```

#### **2.2 Manual Inventory Template**
Create `docs/testing-inventory.md`:

```markdown
## Controllers Testing Checklist
### AuthController
- [ ] login() - POST /api/v1/auth/login
- [ ] logout() - POST /api/v1/auth/logout
- [ ] register() - POST /api/v1/auth/register

### StudentController  
- [ ] index() - GET /api/v1/students
- [ ] store() - POST /api/v1/students
- [ ] show() - GET /api/v1/students/{id}
- [ ] update() - PUT /api/v1/students/{id}
- [ ] destroy() - DELETE /api/v1/students/{id}

## Services Testing Checklist
### EnrollmentService
- [ ] enrollStudent()
- [ ] checkPrerequisites()
- [ ] checkScheduleConflicts()
- [ ] promoteFromWaitlist()

## Models Testing Checklist
### Student
- [ ] enrollments() relationship
- [ ] calculateGPA() method
- [ ] getCurrentGPAAttribute() accessor
- [ ] user() relationship

## Jobs Testing Checklist
### SendApplicationStatusNotification
- [ ] handle() method
- [ ] failed() method
```

### **Phase 3: Audit Existing Tests**

#### **3.1 Test Coverage Analysis**
```bash
# Generate coverage report
./vendor/bin/sail artisan test --coverage-html coverage

# Review coverage report at coverage/index.html
# Look for:
# - Lines not covered (red)
# - Methods not tested
# - Branches not tested
```

#### **3.2 Test File Inventory**
```bash
# List all existing test files
find tests/ -name "*.php" -type f | sort

# Expected structure:
tests/
├── Unit/
│   ├── Services/
│   ├── Models/
│   ├── Jobs/
│   └── Filters/
├── Feature/
│   ├── Api/V1/
│   ├── Workflows/
│   └── Integration/
└── TestCase.php
```

#### **3.3 Test Method Inventory**
For each test file, list what's being tested:

```bash
# Extract test methods from files
grep -r "public function test" tests/ 
grep -r "/** @test */" tests/
```

### **Phase 4: Gap Analysis**

#### **4.1 Compare Inventories**
Create a comparison matrix:

| Component | Method/Feature | Has Test | Test File | Coverage % | Priority |
|-----------|----------------|----------|-----------|------------|----------|
| StudentController | index() | ✅ | StudentApiTest.php | 100% | High |
| StudentController | store() | ✅ | StudentApiTest.php | 100% | High |
| EnrollmentService | checkPrerequisites() | ❌ | Missing | 0% | High |
| Student | calculateGPA() | ❌ | Missing | 0% | High |

#### **4.2 Identify Critical Gaps**
**High Priority (Must Test):**
- Business logic methods
- API endpoints
- Authorization checks
- Data validation

**Medium Priority (Should Test):**
- Helper methods
- Formatting methods
- Non-critical workflows

**Low Priority (Nice to Test):**
- Simple accessors
- Basic getters/setters
- Trivial methods

### **Phase 5: Test Implementation Plan**

#### **5.1 Create Missing Tests**
For each gap identified:

```bash
# Create test files for missing coverage
php artisan make:test Unit/Services/EnrollmentServicePrerequisitesTest
php artisan make:test Unit/Models/StudentGPATest
php artisan make:test Feature/Api/V1/EnrollmentPrerequisitesApiTest
```

#### **5.2 Test Template Structure**
```php
<?php
// tests/Unit/Services/EnrollmentServicePrerequisitesTest.php

class EnrollmentServicePrerequisitesTest extends TestCase
{
    use RefreshDatabase;

    protected EnrollmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EnrollmentService();
    }

    /** @test */
    public function it_prevents_enrollment_without_prerequisites()
    {
        // Arrange: Create course with prerequisites
        // Act: Attempt enrollment without prerequisites
        // Assert: Exception is thrown
    }

    /** @test */
    public function it_allows_enrollment_with_completed_prerequisites()
    {
        // Arrange: Create course with prerequisites, complete them
        // Act: Attempt enrollment
        // Assert: Enrollment succeeds
    }

    /** @test */
    public function it_provides_clear_error_messages_for_missing_prerequisites()
    {
        // Arrange: Course with multiple prerequisites, some missing
        // Act: Attempt enrollment
        // Assert: Error message lists missing prerequisites
    }
}
```

## 🔄 Ongoing Testing Maintenance

### **Professional Best Practices**

#### **1. Test-Driven Development (TDD)**
```bash
# Ideal workflow for new features:
1. Write failing test first
2. Implement minimum code to pass
3. Refactor while keeping tests green
4. Update testing inventory
```

#### **2. Continuous Integration Checks**
```yaml
# .github/workflows/tests.yml
- name: Run tests with coverage
  run: ./vendor/bin/sail artisan test --coverage --min=80

- name: Check for untested methods
  run: ./scripts/check-test-coverage.sh
```

#### **3. Code Review Checklist**
For every pull request:
- [ ] New methods have corresponding tests
- [ ] Modified methods have updated tests
- [ ] Coverage percentage maintained/improved
- [ ] Testing inventory updated

#### **4. Regular Audit Schedule**
```bash
# Monthly: Full testing audit
# Weekly: Coverage report review  
# Daily: New code testing check
# Per PR: Gap analysis for changes
```

### **Audit Commands Reference**

#### **Quick Coverage Check**
```bash
# Run specific test suites
./vendor/bin/sail artisan test tests/Unit/
./vendor/bin/sail artisan test tests/Feature/
./vendor/bin/sail artisan test tests/Integration/

# Check coverage for specific areas
./vendor/bin/sail artisan test --coverage --filter=EnrollmentService
./vendor/bin/sail artisan test --coverage --filter=StudentController
```

#### **Generate Reports**
```bash
# HTML coverage report
./vendor/bin/sail artisan test --coverage-html coverage

# Text coverage summary
./vendor/bin/sail artisan test --coverage-text

# XML coverage for tools
./vendor/bin/sail artisan test --coverage-clover coverage.xml
```

## 📊 Success Metrics

### **Testing Health Indicators**
- **Coverage Percentage**: >90% for critical paths, >80% overall
- **Test Count vs Feature Count**: Should grow proportionally
- **Test Execution Time**: <2 minutes for full suite
- **Test Stability**: <1% flaky test rate

### **Quality Gates**
```bash
# Minimum requirements before deployment:
✅ All tests passing
✅ Coverage > 80%
✅ No critical methods untested
✅ All new features have tests
✅ All bug fixes have regression tests
```

## 🚀 Implementation Timeline

### **Week 1: Setup Audit Framework**
- Create testing inventory template
- Generate current coverage report
- Identify critical gaps

### **Week 2: Fill Critical Gaps**
- Write tests for business logic
- Write tests for API endpoints
- Write tests for new features

### **Week 3: Implement Automation**
- Setup coverage monitoring
- Create audit scripts
- Integrate with CI/CD

### **Week 4+: Maintain & Improve**
- Regular audit cycles
- Continuous improvement
- Team training on framework

---

## 💡 Pro Tips

1. **Start with the riskiest code first** - business logic, payment processing, security
2. **Use factories liberally** - makes test setup easier and more consistent
3. **Test behaviors, not implementation** - focus on what the code should do
4. **Keep tests fast** - use database transactions, mock external services
5. **Make tests readable** - clear arrange/act/assert structure

This framework ensures you'll never wonder "what should I test?" again! 