<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Http\Resources\DepartmentResource;
use App\Jobs\ProcessDepartmentImport;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * @OA\Tag(name="Departments", description="Department management endpoints")
 */
class DepartmentController extends Controller
{
    use HandlesCsvImportExport;

    /**
     * @OA\Get(
     *     path="/api/v1/departments",
     *     summary="List all departments",
     *     description="Retrieve a paginated list of all departments with their faculties and programs",
     *     operationId="getDepartments",
     *     tags={"Departments"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *
     *     @OA\Parameter(
     *         name="faculty_id",
     *         in="query",
     *         description="Filter departments by faculty ID",
     *         required=false,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved departments",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(
     *
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Computer Science"),
     *                     @OA\Property(property="faculty_id", type="integer", example=1),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(
     *                         property="faculty",
     *                         type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string")
     *                     ),
     *                     @OA\Property(
     *                         property="programs",
     *                         type="array",
     *
     *                         @OA\Items(
     *
     *                             @OA\Property(property="id", type="integer"),
     *                             @OA\Property(property="name", type="string")
     *                         )
     *                     )
     *                 )
     *             ),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Department::class);

        // Create cache key based on filters
        $cacheKey = 'departments.all';
        if ($request->has('faculty_id')) {
            $cacheKey = 'departments.faculty.'.$request->faculty_id;
        }

        $departments = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Department::with(['faculty', 'programs']);

            if ($request->has('faculty_id')) {
                $query->where('faculty_id', $request->faculty_id);
            }

            return $query->paginate(10);
        });

        return DepartmentResource::collection($departments);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/departments",
     *     summary="Create a new department",
     *     description="Store a newly created department",
     *     operationId="createDepartment",
     *     tags={"Departments"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Department data",
     *
     *         @OA\JsonContent(
     *             required={"name", "code", "faculty_id"},
     *
     *             @OA\Property(property="name", type="string", example="Computer Science", maxLength=255),
     *             @OA\Property(property="code", type="string", example="CS", maxLength=10, description="Unique department code"),
     *             @OA\Property(property="faculty_id", type="integer", example=1, description="ID of the faculty this department belongs to")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Department created successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Computer Science"),
     *                 @OA\Property(property="faculty_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="faculty",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('create', Department::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code',
            'faculty_id' => 'required|exists:faculties,id',
        ]);

        $department = Department::create($validated);

        // Clear departments cache (all and faculty-specific)
        Cache::forget('departments.all');
        Cache::forget('departments.faculty.'.$validated['faculty_id']);

        return new DepartmentResource($department->load('faculty'));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/departments/{id}",
     *     summary="Get a specific department",
     *     description="Display the specified department with its faculty and programs",
     *     operationId="getDepartment",
     *     tags={"Departments"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Department ID",
     *         required=true,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved department",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Computer Science"),
     *                 @OA\Property(property="faculty_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="faculty",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="programs",
     *                     type="array",
     *
     *                     @OA\Items(
     *
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Department not found")
     * )
     */
    public function show(Department $department)
    {
        $this->authorize('view', $department);

        return new DepartmentResource($department->load(['faculty', 'programs']));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/departments/{id}",
     *     summary="Update a department",
     *     description="Update the specified department",
     *     operationId="updateDepartment",
     *     tags={"Departments"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Department ID",
     *         required=true,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Department data to update",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name", type="string", example="Computer Science & Engineering", maxLength=255),
     *             @OA\Property(property="faculty_id", type="integer", example=1, description="ID of the faculty this department belongs to")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Department updated successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Computer Science & Engineering"),
     *                 @OA\Property(property="faculty_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="faculty",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Department not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, Department $department)
    {
        $this->authorize('update', $department);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'faculty_id' => 'sometimes|exists:faculties,id',
        ]);

        $oldFacultyId = $department->faculty_id;
        $department->update($validated);

        // Clear departments cache (all and affected faculty-specific caches)
        Cache::forget('departments.all');
        Cache::forget('departments.faculty.'.$oldFacultyId);
        if (isset($validated['faculty_id']) && $validated['faculty_id'] !== $oldFacultyId) {
            Cache::forget('departments.faculty.'.$validated['faculty_id']);
        }

        return new DepartmentResource($department->load('faculty'));
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/departments/{id}",
     *     summary="Delete a department",
     *     description="Remove the specified department from storage",
     *     operationId="deleteDepartment",
     *     tags={"Departments"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Department ID",
     *         required=true,
     *
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(response=204, description="Department deleted successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Department not found")
     * )
     */
    public function destroy(Department $department)
    {
        $this->authorize('delete', $department);

        $facultyId = $department->faculty_id;
        $department->delete();

        // Clear departments cache (all and faculty-specific)
        Cache::forget('departments.all');
        Cache::forget('departments.faculty.'.$facultyId);

        return response()->noContent();
    }

    // CSV Import/Export Methods

    protected function getEntityName(): string
    {
        return 'departments';
    }

    protected function getImportJobClass(): string
    {
        return ProcessDepartmentImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return ['name', 'code', 'faculty_name'];
    }

    protected function getSampleCsvData(): array
    {
        return ['Computer Science', 'CS', 'School of Engineering'];
    }

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
}
