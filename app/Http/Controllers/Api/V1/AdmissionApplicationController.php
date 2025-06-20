<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdmissionApplicationRequest;
use App\Http\Requests\UpdateAdmissionApplicationRequest;
use App\Http\Resources\AdmissionApplicationResource;
use App\Models\AdmissionApplication;
use App\Services\AdmissionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Admission Applications",
    description: "API endpoints for managing admission applications"
)]
class AdmissionApplicationController extends Controller
{
    public function __construct(
        private AdmissionService $admissionService
    ) {
    }

    /**
     * Display a listing of admission applications
     */
    #[OA\Get(
        path: "/api/v1/admission-applications",
        summary: "Get a list of admission applications",
        description: "Retrieve a paginated list of admission applications. Admin and staff can see all applications, students can only see their own.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "page",
                description: "Page number for pagination",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer", minimum: 1, default: 1)
            ),
            new OA\Parameter(
                name: "per_page",
                description: "Number of items per page",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer", minimum: 1, maximum: 100, default: 15)
            ),
            new OA\Parameter(
                name: "status",
                description: "Filter by application status",
                in: "query",
                required: false,
                schema: new OA\Schema(
                    type: "string",
                    enum: ["draft", "submitted", "under_review", "accepted", "rejected"]
                )
            ),
            new OA\Parameter(
                name: "student_id",
                description: "Filter by student ID (admin/staff only)",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "term_id",
                description: "Filter by term ID",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of admission applications retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(ref: "#/components/schemas/AdmissionApplicationResource")
                        ),
                        new OA\Property(
                            property: "meta",
                            properties: [
                                new OA\Property(property: "current_page", type: "integer"),
                                new OA\Property(property: "last_page", type: "integer"),
                                new OA\Property(property: "per_page", type: "integer"),
                                new OA\Property(property: "total", type: "integer")
                            ],
                            type: "object"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Unauthenticated.")
                    ]
                )
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "This action is unauthorized.")
                    ]
                )
            )
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', AdmissionApplication::class);

        $user = $request->user();
        $userRoles = $user->roles()->pluck('name')->toArray();

        $query = AdmissionApplication::with([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        // If the user is a student, they can only see their own applications.
        // This is the primary authorization scope.
        if (!in_array('admin', $userRoles) && !in_array('staff', $userRoles)) {
            $student = $user->student;
            if (!$student) {
                // Return an empty collection if the user has no student record.
                return response()->json(['data' => [], 'meta' => ['total' => 0]]);
            }
            $query->where('student_id', $student->id);
        }

        // Apply filters on top of the base query.
        $query->when($request->has('status'), function ($q) use ($request) {
            $q->where('status', $request->status);
        });

        // Admin/staff can filter by any student_id.
        // This check is nested inside a `when` to ensure it only applies if the user is authorized.
        $query->when($request->has('student_id') && (in_array('admin', $userRoles) || in_array('staff', $userRoles)), function ($q) use ($request) {
            $q->where('student_id', $request->student_id);
        });

        $query->when($request->has('term_id'), function ($q) use ($request) {
            $q->where('term_id', $request->term_id);
        });

        // Order by most recent first
        $query->orderBy('created_at', 'desc');

        $applications = $query->paginate($request->get('per_page', 15));
        
        // Return the paginated resource collection directly.
        // Laravel will handle the 'data', 'links', and 'meta' keys.
        return AdmissionApplicationResource::collection($applications);
    }

    /**
     * Store a newly created admission application
     */
    #[OA\Post(
        path: "/api/v1/admission-applications",
        summary: "Create a new admission application",
        description: "Create a new admission application. Students can only create applications for themselves unless they have admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["student_id", "term_id"],
                properties: [
                    new OA\Property(
                        property: "student_id",
                        type: "integer",
                        description: "ID of the student applying",
                        example: 1
                    ),
                    new OA\Property(
                        property: "term_id",
                        type: "integer",
                        description: "ID of the term for which the student is applying",
                        example: 1
                    ),
                    new OA\Property(
                        property: "status",
                        type: "string",
                        description: "Initial status of the application",
                        enum: ["draft", "submitted"],
                        example: "draft"
                    ),
                    new OA\Property(
                        property: "comments",
                        type: "string",
                        description: "Additional comments or notes",
                        example: "Looking forward to joining the program",
                        nullable: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Admission application created successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Admission application created successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Bad request - validation failed",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "The given data was invalid."),
                        new OA\Property(
                            property: "errors",
                            type: "object",
                            additionalProperties: new OA\AdditionalProperties(
                                type: "array",
                                items: new OA\Items(type: "string")
                            )
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated"
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions"
            )
        ]
    )]
    public function store(StoreAdmissionApplicationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Set default values
        $validated['application_date'] = $validated['application_date'] ?? now();
        $validated['status'] = $validated['status'] ?? 'draft';

        // Create the application
        $application = AdmissionApplication::create($validated);

        // Load relationships for response
        $application->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'message' => 'Admission application created successfully.',
            'data' => new AdmissionApplicationResource($application),
        ], 201);
    }

    /**
     * Display the specified admission application
     */
    #[OA\Get(
        path: "/api/v1/admission-applications/{id}",
        summary: "Get a specific admission application",
        description: "Retrieve details of a specific admission application. Students can only view their own applications.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID of the admission application",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Admission application retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated"
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions"
            ),
            new OA\Response(
                response: 404,
                description: "Admission application not found",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Admission application not found.")
                    ]
                )
            )
        ]
    )]
    public function show(AdmissionApplication $admissionApplication): JsonResponse
    {
        $this->authorize('view', $admissionApplication);

        $admissionApplication->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'data' => new AdmissionApplicationResource($admissionApplication),
        ]);
    }

    /**
     * Update the specified admission application
     */
    #[OA\Put(
        path: "/api/v1/admission-applications/{id}",
        summary: "Update an admission application",
        description: "Update an admission application. Students can only update their own draft applications. Admin/staff can update any application.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID of the admission application",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "term_id",
                        type: "integer",
                        description: "ID of the term",
                        example: 1
                    ),
                    new OA\Property(
                        property: "status",
                        type: "string",
                        description: "Application status",
                        enum: ["draft", "submitted", "under_review", "accepted", "rejected"],
                        example: "submitted"
                    ),
                    new OA\Property(
                        property: "comments",
                        type: "string",
                        description: "Comments or notes",
                        example: "Updated application details",
                        nullable: true
                    ),
                    new OA\Property(
                        property: "decision_date",
                        type: "string",
                        format: "date",
                        description: "Decision date (admin/staff only)",
                        example: "2024-12-31",
                        nullable: true
                    ),
                    new OA\Property(
                        property: "decision_status",
                        type: "string",
                        description: "Decision status (admin/staff only)",
                        example: "Accepted with conditions",
                        nullable: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Admission application updated successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Admission application updated successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Bad request - validation failed"
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated"
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions"
            ),
            new OA\Response(
                response: 404,
                description: "Admission application not found"
            )
        ]
    )]
    public function update(UpdateAdmissionApplicationRequest $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validated();

        // If status is being changed to a decision status, set decision_date if not provided
        if (isset($validated['status']) && 
            in_array($validated['status'], ['accepted', 'rejected']) && 
            !isset($validated['decision_date'])) {
            $validated['decision_date'] = now();
        }

        $admissionApplication->update($validated);

        // Load relationships for response
        $admissionApplication->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'message' => 'Admission application updated successfully.',
            'data' => new AdmissionApplicationResource($admissionApplication),
        ]);
    }

    /**
     * Remove the specified admission application
     */
    #[OA\Delete(
        path: "/api/v1/admission-applications/{id}",
        summary: "Delete an admission application",
        description: "Delete an admission application. Students can only delete their own draft applications. Admin can delete any application.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "id",
                description: "ID of the admission application",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Admission application deleted successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Admission application deleted successfully.")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated"
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions"
            ),
            new OA\Response(
                response: 404,
                description: "Admission application not found"
            )
        ]
    )]
    public function destroy(AdmissionApplication $admissionApplication): JsonResponse
    {
        $this->authorize('delete', $admissionApplication);

        $admissionApplication->delete();

        return response()->json([
            'message' => 'Admission application deleted successfully.',
        ]);
    }

    /**
     * Restore a soft-deleted admission application
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/{admission_application}/restore",
        summary: "Restore a soft-deleted admission application",
        description: "Restore a soft-deleted admission application record. Requires admin permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(name: "admission_application", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Admission application restored successfully",
                content: new OA\JsonContent(ref: "#/components/schemas/AdmissionApplicationResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function restore($id): JsonResponse
    {
        $admissionApplication = AdmissionApplication::withTrashed()->findOrFail($id);
        $this->authorize('restore', $admissionApplication);
        
        $admissionApplication->restore();
        
        return response()->json([
            'message' => 'Admission application restored successfully',
            'data' => new AdmissionApplicationResource($admissionApplication)
        ], 200);
    }

    /**
     * Permanently delete an admission application
     */
    #[OA\Delete(
        path: "/api/v1/admission-applications/{admission_application}/force",
        summary: "Permanently delete an admission application",
        description: "Permanently delete an admission application record. Requires admin permissions. This action cannot be undone.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(name: "admission_application", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Admission application permanently deleted"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function forceDelete($id): JsonResponse
    {
        $admissionApplication = AdmissionApplication::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $admissionApplication);
        
        $admissionApplication->forceDelete();
        
        return response()->json(null, 204);
    }
}
