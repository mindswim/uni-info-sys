<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Jobs\ProcessStaffImport;
use App\Models\Staff;
use App\Models\User;
use App\Models\CourseSection;
use App\Http\Resources\StaffResource;
use App\Http\Resources\CourseSectionResource;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Staff",
    description: "Endpoints for managing staff members."
)]
class StaffController extends Controller
{
    use HandlesCsvImportExport;
    #[OA\Get(
        path: "/api/v1/staff",
        summary: "List all staff members",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "department_id", in: "query", required: false, description: "Filter by department ID", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "position", in: "query", required: false, description: "Filter by job title", schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "A paginated list of staff members.",
                content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/StaffResource"))
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
        ]
    )]
    public function index(Request $request)
    {
        $this->authorize('viewAny', Staff::class);

        $query = Staff::with(['user', 'department']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        return StaffResource::collection($query->paginate(10));
    }

    #[OA\Post(
        path: "/api/v1/staff",
        summary: "Create a new staff member",
        tags: ["Staff"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/StoreStaffRequest")
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Staff member created successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/StaffResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(StoreStaffRequest $request)
    {
        $this->authorize('create', Staff::class);

        $validated = $request->validated();

        $staff = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['user']['name'],
                'email' => $validated['user']['email'],
                'password' => Hash::make($validated['user']['password']),
            ]);

            return Staff::create([
                'user_id' => $user->id,
                'department_id' => $validated['department_id'],
                'job_title' => $validated['job_title'],
                'bio' => $validated['bio'] ?? null,
                'office_location' => $validated['office_location'] ?? null,
            ]);
        });

        $staff->load(['user', 'department']);

        return new StaffResource($staff);
    }

    #[OA\Get(
        path: "/api/v1/staff/{staff}",
        summary: "Get a single staff member",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "staff", in: "path", required: true, description: "ID of the staff member", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "The requested staff member.",
                content: new OA\JsonContent(ref: "#/components/schemas/StaffResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(Staff $staff)
    {
        $this->authorize('view', $staff);

        $staff->load(['user', 'department']);
        return new StaffResource($staff);
    }

    #[OA\Put(
        path: "/api/v1/staff/{staff}",
        summary: "Update a staff member",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "staff", in: "path", required: true, description: "ID of the staff member", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/UpdateStaffRequest")
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Staff member updated successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/StaffResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        $this->authorize('update', $staff);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $staff) {
            if (isset($validated['user'])) {
                $staff->user->update($validated['user']);
            }
            
            $staff->update($validated);
        });

        $staff->load(['user', 'department']);
        return new StaffResource($staff);
    }

    #[OA\Delete(
        path: "/api/v1/staff/{staff}",
        summary: "Delete a staff member",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "staff", in: "path", required: true, description: "ID of the staff member", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Staff member deleted successfully."),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(Staff $staff)
    {
        $this->authorize('delete', $staff);

        DB::transaction(function () use ($staff) {
            // Workaround for failing cascade delete in test environment
            $user = $staff->user;
            $staff->delete();
            if ($user) {
                $user->delete();
            }
        });

        return response()->noContent();
    }

    #[OA\Get(
        path: "/api/v1/staff/me",
        summary: "Get the authenticated staff member's profile",
        tags: ["Staff"],
        responses: [
            new OA\Response(
                response: 200,
                description: "The authenticated staff member's profile.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/StaffResource"),
                    ],
                    type: "object"
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Staff profile not found for the authenticated user"),
        ]
    )]
    public function me(Request $request)
    {
        $user = $request->user();

        $staff = Staff::where('user_id', $user->id)
            ->with(['user', 'department'])
            ->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Staff profile not found for the authenticated user'
            ], 404);
        }

        return response()->json([
            'data' => new StaffResource($staff)
        ], 200);
    }

    #[OA\Get(
        path: "/api/v1/staff/me/sections",
        summary: "Get the authenticated staff member's course sections",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(
                name: "term_id",
                in: "query",
                required: false,
                description: "Filter by term ID",
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "status",
                in: "query",
                required: false,
                description: "Filter by section status (active, completed, cancelled)",
                schema: new OA\Schema(type: "string")
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of course sections taught by the authenticated staff member.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(ref: "#/components/schemas/CourseSectionResource")
                        ),
                    ],
                    type: "object"
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Staff profile not found for the authenticated user"),
        ]
    )]
    public function mySections(Request $request)
    {
        $user = $request->user();

        $staff = Staff::where('user_id', $user->id)->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Staff profile not found for the authenticated user'
            ], 404);
        }

        $query = CourseSection::where('instructor_id', $staff->id)
            ->with([
                'course',
                'term',
                'room.building',
                'enrollments.student.user'
            ]);

        if ($request->has('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sections = $query->orderBy('term_id', 'desc')
            ->orderBy('section_number', 'asc')
            ->get();

        return response()->json([
            'data' => CourseSectionResource::collection($sections)
        ], 200);
    }

    /**
     * Get all students enrolled in the authenticated staff member's course sections
     */
    public function myStudents(Request $request)
    {
        $user = $request->user();

        $staff = Staff::where('user_id', $user->id)->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Staff profile not found for the authenticated user'
            ], 404);
        }

        // Get all students enrolled in staff's sections
        $query = \App\Models\Student::whereHas('enrollments.courseSection', function ($q) use ($staff, $request) {
            $q->where('instructor_id', $staff->id);
            if ($request->has('term_id')) {
                $q->where('term_id', $request->term_id);
            }
        })
        ->with([
            'user',
            'majorProgram',
            'enrollments' => function ($q) use ($staff, $request) {
                $q->whereHas('courseSection', function ($sq) use ($staff, $request) {
                    $sq->where('instructor_id', $staff->id);
                    if ($request->has('term_id')) {
                        $sq->where('term_id', $request->term_id);
                    }
                })->with('courseSection.course');
            }
        ]);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('student_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('email', 'like', "%{$search}%");
                    });
            });
        }

        // Academic status filter
        if ($request->has('academic_status')) {
            $query->where('academic_status', $request->academic_status);
        }

        $students = $query->orderBy('last_name')->orderBy('first_name')->get();

        return response()->json([
            'data' => $students->map(function ($student) {
                return [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'full_name' => $student->first_name . ' ' . $student->last_name,
                    'email' => $student->user?->email,
                    'gpa' => $student->gpa,
                    'semester_gpa' => $student->semester_gpa,
                    'class_standing' => $student->class_standing,
                    'academic_status' => $student->academic_status,
                    'enrollment_status' => $student->enrollment_status,
                    'total_credits_earned' => $student->total_credits_earned,
                    'credits_in_progress' => $student->credits_in_progress,
                    'major' => $student->majorProgram?->name,
                    'financial_hold' => $student->financial_hold,
                    'enrollments' => $student->enrollments->map(function ($enrollment) {
                        return [
                            'id' => $enrollment->id,
                            'course_code' => $enrollment->courseSection->course->course_code,
                            'course_title' => $enrollment->courseSection->course->title,
                            'section_number' => $enrollment->courseSection->section_number,
                            'status' => $enrollment->status,
                            'grade' => $enrollment->grade,
                        ];
                    }),
                ];
            }),
            'meta' => [
                'total' => $students->count(),
            ]
        ]);
    }

    // CSV Import/Export Methods

    protected function getEntityName(): string
    {
        return 'staff';
    }

    protected function getImportJobClass(): string
    {
        return ProcessStaffImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return ['employee_number', 'first_name', 'last_name', 'email', 'department_code', 'title', 'office_location', 'office_phone', 'hire_date'];
    }

    protected function getSampleCsvData(): array
    {
        return ['E24001', 'John', 'Smith', 'j.smith@university.edu', 'CS', 'Professor', 'SCI-301', '555-0100', '2020-08-15'];
    }

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
}
