<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Jobs\ProcessStudentImport;
use App\Models\Student;
use App\Http\Resources\StudentResource;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Students",
    description: "API endpoints for managing student records"
)]
class StudentController extends Controller
{
    use HandlesCsvImportExport;

    public function __construct()
    {
        $this->authorizeResource(Student::class, 'student');
    }

    #[OA\Get(
        path: "/api/v1/students",
        summary: "Get a list of students",
        description: "Retrieve a paginated list of students. Staff and admins can see all students. Students can only see their own record.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "include_user", in: "query", required: false, schema: new OA\Schema(type: "boolean")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/StudentResource")),
                        new OA\Property(property: "links", type: "object"),
                        new OA\Property(property: "meta", type: "object"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $userRoles = $user->roles()->pluck('name')->toArray();
        $query = Student::query();

        if (in_array('student', $userRoles) && !in_array('admin', $userRoles) && !in_array('staff', $userRoles)) {
            $query->where('user_id', $user->id);
        }

        if ($request->boolean('include_user')) {
            $query->with('user');
        }

        return StudentResource::collection($query->paginate($request->get('per_page', 15)));
    }

    #[OA\Post(
        path: "/api/v1/students",
        summary: "Create a new student",
        description: "Create a new student record. Requires admin or staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/StoreStudentRequest")
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Student created successfully",
                content: new OA\JsonContent(ref: "#/components/schemas/StudentResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 422, description: "Validation Error"),
        ]
    )]
    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = Student::create($request->validated());
        
        return response()->json([
            'message' => 'Student created successfully',
            'data' => new StudentResource($student)
        ], 201);
    }

    #[OA\Get(
        path: "/api/v1/students/{student}",
        summary: "Get a specific student",
        description: "Retrieve the details of a specific student.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "include_user", in: "query", required: false, schema: new OA\Schema(type: "boolean")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful", content: new OA\JsonContent(ref: "#/components/schemas/StudentResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(Request $request, Student $student): StudentResource
    {
        if ($request->boolean('include_user')) {
            $student->load('user');
        }
        return new StudentResource($student);
    }

    #[OA\Put(
        path: "/api/v1/students/{student}",
        summary: "Update a student",
        description: "Update a student's record. Students can update their own profile, admins can update any student.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/UpdateStudentRequest")
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Student updated successfully",
                content: new OA\JsonContent(ref: "#/components/schemas/StudentResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation Error"),
        ]
    )]
    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $student->update($request->validated());
        
        return response()->json([
            'message' => 'Student updated successfully',
            'data' => new StudentResource($student)
        ], 200);
    }

    #[OA\Delete(
        path: "/api/v1/students/{student}",
        summary: "Delete a student",
        description: "Delete a student's record. Requires admin permissions.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Student deleted successfully"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(Student $student): JsonResponse
    {
        $student->delete();
        
        return response()->json(null, 204);
    }

    #[OA\Post(
        path: "/api/v1/students/{student}/restore",
        summary: "Restore a soft-deleted student",
        description: "Restore a soft-deleted student record. Requires admin permissions.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Student restored successfully",
                content: new OA\JsonContent(ref: "#/components/schemas/StudentResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function restore($id): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($id);
        $this->authorize('restore', $student);
        
        $student->restore();
        
        return response()->json([
            'message' => 'Student restored successfully',
            'data' => new StudentResource($student)
        ], 200);
    }

    #[OA\Delete(
        path: "/api/v1/students/{student}/force",
        summary: "Permanently delete a student",
        description: "Permanently delete a student record. Requires admin permissions. This action cannot be undone.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Student permanently deleted"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function forceDelete($id): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $student);

        $student->forceDelete();

        return response()->json(null, 204);
    }

    #[OA\Get(
        path: "/api/v1/students/me",
        summary: "Get current student's profile",
        description: "Retrieve the authenticated student's profile with related data",
        security: [["sanctum" => []]],
        tags: ["Students"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful",
                content: new OA\JsonContent(ref: "#/components/schemas/StudentResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Student profile not found"),
        ]
    )]
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $student = Student::where('user_id', $user->id)
            ->with(['user', 'majorProgram', 'minorProgram', 'enrollments.courseSection.course', 'academicRecords'])
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'Student profile not found for the authenticated user'
            ], 404);
        }

        return response()->json([
            'data' => new StudentResource($student)
        ], 200);
    }

    // CSV Import/Export Methods (required by HandlesCsvImportExport trait)

    protected function getEntityName(): string
    {
        return 'students';
    }

    protected function getImportJobClass(): string
    {
        return ProcessStudentImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return [
            'student_number',
            'first_name',
            'last_name',
            'email',
            'date_of_birth',
            'gender',
            'nationality',
            'phone',
            'address',
            'city',
            'state',
            'postal_code',
            'country',
            'program_code',
            'enrollment_status',
            'class_standing',
            'emergency_contact_name',
            'emergency_contact_phone',
        ];
    }

    protected function getSampleCsvData(): array
    {
        return [
            'S24123456',
            'John',
            'Doe',
            'john.doe@example.com',
            '2000-01-15',
            'Male',
            'US',
            '+1-555-0100',
            '123 Main St',
            'New York',
            'NY',
            '10001',
            'USA',
            'CS-BS',
            'Enrolled',
            'Sophomore',
            'Jane Doe',
            '+1-555-0101',
        ];
    }

    protected function getExportData(Request $request): Collection
    {
        return Student::with(['user', 'majorProgram'])->get();
    }

    protected function transformToRow($student): array
    {
        return [
            $student->student_number,
            $student->first_name,
            $student->last_name,
            $student->user?->email ?? '',
            $student->date_of_birth?->format('Y-m-d') ?? '',
            $student->gender ?? '',
            $student->nationality ?? '',
            $student->phone ?? '',
            $student->address ?? '',
            $student->city ?? '',
            $student->state ?? '',
            $student->postal_code ?? '',
            $student->country ?? '',
            $student->majorProgram?->code ?? '',
            $student->enrollment_status ?? '',
            $student->class_standing ?? '',
            $student->emergency_contact_name ?? '',
            $student->emergency_contact_phone ?? '',
        ];
    }
}
