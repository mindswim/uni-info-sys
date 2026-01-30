# CSV Implementation Guide

All CSV routes are now configured! Follow this guide to complete the implementation for each entity.

## ✅ COMPLETED
- **Students** - Full implementation ✓
- **Faculties** - Full implementation ✓
- **CSV Jobs Created** - All 8 import jobs ✓
- **Routes** - All CSV routes added ✓

## 🔨 TO COMPLETE

For each controller below, add these 3 things:

### 1. Add imports at top of controller:
```php
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Jobs\Process{Entity}Import;  // Replace {Entity}
use Illuminate\Support\Collection;
```

### 2. Add trait to class:
```php
class {Entity}Controller extends Controller
{
    use HandlesCsvImportExport;
```

### 3. Add these 5 methods at end of controller:
```php
    protected function getEntityName(): string
    {
        return '{entities}'; // lowercase plural
    }

    protected function getImportJobClass(): string
    {
        return Process{Entity}Import::class;
    }

    protected function getCsvHeaders(): array
    {
        return [/* see below for each entity */];
    }

    protected function getSampleCsvData(): array
    {
        return [/* sample row matching headers */];
    }

    protected function getExportData(Request $request): Collection
    {
        return {Entity}::with([/* relationships */])->get();
    }

    protected function transformToRow($item): array
    {
        return [/* map model to CSV row */];
    }
```

---

## DEPARTMENTS

**Job**: `ProcessDepartmentImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/DepartmentController.php`

**CSV Headers**:
```php
['name', 'code', 'faculty_name']
```

**Sample Data**:
```php
['Computer Science', 'CS', 'School of Engineering']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return Department::with('faculty')->get();
}

protected function transformToRow($dept): array
{
    return [
        $dept->name,
        $dept->code,
        $dept->faculty?->name ?? '',
    ];
}
```

**Frontend**: Add to `departments-tab.tsx` (line ~240):
```tsx
<CsvImportExport
  entityName="departments"
  entityDisplayName="Departments"
  importEndpoint="/api/v1/departments/csv/import"
  exportEndpoint="/api/v1/departments/csv/export"
  templateEndpoint="/api/v1/departments/csv/template"
  onImportComplete={fetchDepartments}
/>
```

---

## PROGRAMS

**Job**: `ProcessProgramImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/ProgramController.php`

**CSV Headers**:
```php
['name', 'code', 'department_code', 'degree_level', 'description', 'credits_required']
```

**Sample Data**:
```php
['Bachelor of Science in Computer Science', 'CS-BS', 'CS', 'Bachelor', 'Comprehensive CS program', '120']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return Program::with('department')->get();
}

protected function transformToRow($program): array
{
    return [
        $program->name,
        $program->code,
        $program->department?->code ?? '',
        $program->degree_level,
        $program->description ?? '',
        $program->credits_required ?? '',
    ];
}
```

**Frontend**: Add to `programs-tab.tsx`

---

## TERMS

**Job**: `ProcessTermImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/TermController.php`

**CSV Headers**:
```php
['name', 'code', 'start_date', 'end_date', 'is_current']
```

**Sample Data**:
```php
['Fall 2024', 'FALL2024', '2024-08-26', '2024-12-20', 'true']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return Term::all();
}

protected function transformToRow($term): array
{
    return [
        $term->name,
        $term->code,
        $term->start_date?->format('Y-m-d') ?? '',
        $term->end_date?->format('Y-m-d') ?? '',
        $term->is_current ? 'true' : 'false',
    ];
}
```

**Frontend**: Add to `terms-tab.tsx` (if exists) or create basic admin page

---

## BUILDINGS

**Job**: `ProcessBuildingImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/BuildingController.php`

**CSV Headers**:
```php
['name', 'code', 'address', 'city', 'state', 'postal_code']
```

**Sample Data**:
```php
['Science Building', 'SCI', '123 Campus Dr', 'Boston', 'MA', '02115']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return Building::all();
}

protected function transformToRow($building): array
{
    return [
        $building->name,
        $building->code,
        $building->address ?? '',
        $building->city ?? '',
        $building->state ?? '',
        $building->postal_code ?? '',
    ];
}
```

**Frontend**: Add to `buildings-tab.tsx` (create if needed)

---

## ROOMS

**Job**: `ProcessRoomImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/RoomController.php`

**CSV Headers**:
```php
['room_number', 'building_code', 'capacity', 'room_type']
```

**Sample Data**:
```php
['101', 'SCI', '30', 'Classroom']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return Room::with('building')->get();
}

protected function transformToRow($room): array
{
    return [
        $room->room_number,
        $room->building?->code ?? '',
        $room->capacity,
        $room->room_type ?? 'Classroom',
    ];
}
```

**Frontend**: Rooms might not have a dedicated tab - could add to Buildings tab

---

## STAFF

**Job**: `ProcessStaffImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/StaffController.php`

**CSV Headers**:
```php
['employee_number', 'first_name', 'last_name', 'email', 'department_code', 'title', 'office_location', 'office_phone', 'hire_date']
```

**Sample Data**:
```php
['E24001', 'John', 'Smith', 'j.smith@university.edu', 'CS', 'Professor', 'SCI-301', '555-0100', '2020-08-15']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return Staff::with(['user', 'department'])->get();
}

protected function transformToRow($staff): array
{
    return [
        $staff->employee_number,
        $staff->first_name,
        $staff->last_name,
        $staff->user?->email ?? '',
        $staff->department?->code ?? '',
        $staff->title ?? '',
        $staff->office_location ?? '',
        $staff->office_phone ?? '',
        $staff->hire_date?->format('Y-m-d') ?? '',
    ];
}
```

**Frontend**: Add to faculty management tab or create `staff-tab.tsx`

---

## COURSE SECTIONS

**Job**: `ProcessCourseSectionImport` ✅ Created
**Controller**: `app/Http/Controllers/Api/V1/CourseSectionController.php`

**CSV Headers**:
```php
['course_code', 'term_code', 'section_number', 'instructor_email', 'room_code', 'capacity', 'schedule_days', 'start_time', 'end_time', 'status']
```

**Sample Data**:
```php
['CS101', 'FALL2024', '001', 'j.smith@university.edu', 'SCI-101', '30', 'Monday,Wednesday,Friday', '09:00', '09:50', 'Active']
```

**Export & Transform**:
```php
protected function getExportData(Request $request): Collection
{
    return CourseSection::with(['course', 'term', 'instructor.user', 'room.building'])->get();
}

protected function transformToRow($section): array
{
    $roomCode = '';
    if ($section->room) {
        $roomCode = ($section->room->building?->code ?? '') . '-' . $section->room->room_number;
    }

    return [
        $section->course?->course_code ?? '',
        $section->term?->code ?? '',
        $section->section_number,
        $section->instructor?->user?->email ?? '',
        $roomCode,
        $section->capacity,
        implode(',', $section->schedule_days ?? []),
        $section->start_time ?? '',
        $section->end_time ?? '',
        $section->status ?? 'Active',
    ];
}
```

**Frontend**: Add to `sections-tab.tsx` (ALREADY EXISTS ✓)

---

## IMPORT ORDER

When populating your university from scratch, import CSVs in this order:

1. **Faculties** (no dependencies)
2. **Departments** (requires Faculties)
3. **Programs** (requires Departments)
4. **Buildings** (no dependencies)
5. **Rooms** (requires Buildings)
6. **Terms** (no dependencies)
7. **Courses** (requires Departments) - *Already has import!*
8. **Staff** (optional: Departments)
9. **Students** (optional: Programs) - *Already implemented!*
10. **Course Sections** (requires Courses, Terms, optional: Staff, Rooms)
11. **Enrollments** (requires Students, Course Sections) - *Can add later*

## Quick Start

1. Complete controller implementations (30 min)
2. Add frontend components to existing tabs (15 min)
3. Create sample CSVs with AI assistance
4. Import and build your 10,000-student university!

**Total work remaining**: ~45 minutes of copy-paste + adjustments
