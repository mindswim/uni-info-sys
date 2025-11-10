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
                    enum: ["draft", "submitted", "under_review", "accepted", "rejected", "waitlisted", "enrolled"]
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
        $userRolesLower = array_map('strtolower', $userRoles);
        if (!in_array('admin', $userRolesLower) && !in_array('staff', $userRolesLower)) {
            $student = $user->student;
            if (!$student) {
                // Return an empty resource collection if the user has no student record.
                return AdmissionApplicationResource::collection(collect());
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
        path: "/api/v1/admission-applications/{admission_application}",
        summary: "Get a specific admission application",
        description: "Retrieve details of a specific admission application. Students can only view their own applications.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
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
        path: "/api/v1/admission-applications/{admission_application}",
        summary: "Update an admission application",
        description: "Update an admission application. Students can only update their own draft applications. Admin/staff can update any application.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
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
                        enum: ["draft", "submitted", "under_review", "accepted", "rejected", "waitlisted", "enrolled"],
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
        path: "/api/v1/admission-applications/{admission_application}",
        summary: "Delete an admission application",
        description: "Delete an admission application. Students can only delete their own draft applications. Admin can delete any application.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
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

    /**
     * Accept an admission application
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/{admission_application}/accept",
        summary: "Accept an admission application",
        description: "Accept an admission application and notify the applicant. Requires admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
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
                        property: "decision_status",
                        type: "string",
                        description: "Additional decision notes",
                        example: "Accepted with full scholarship",
                        nullable: true
                    ),
                    new OA\Property(
                        property: "comments",
                        type: "string",
                        description: "Additional comments",
                        example: "Exceptional academic performance",
                        nullable: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Application accepted successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Application accepted successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function accept(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $this->authorize('update', $admissionApplication);

        $validated = $request->validate([
            'decision_status' => 'nullable|string|max:255',
            'comments' => 'nullable|string'
        ]);

        $admissionApplication->update([
            'status' => 'accepted',
            'decision_date' => now(),
            'decision_status' => $validated['decision_status'] ?? null,
            'comments' => $validated['comments'] ?? $admissionApplication->comments
        ]);

        $admissionApplication->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'message' => 'Application accepted successfully.',
            'data' => new AdmissionApplicationResource($admissionApplication)
        ]);
    }

    /**
     * Reject an admission application
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/{admission_application}/reject",
        summary: "Reject an admission application",
        description: "Reject an admission application and notify the applicant. Requires admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
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
                        property: "decision_status",
                        type: "string",
                        description: "Reason for rejection",
                        example: "Does not meet minimum GPA requirement",
                        nullable: true
                    ),
                    new OA\Property(
                        property: "comments",
                        type: "string",
                        description: "Additional comments",
                        example: "We encourage you to reapply next year",
                        nullable: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Application rejected successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Application rejected successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function reject(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $this->authorize('update', $admissionApplication);

        $validated = $request->validate([
            'decision_status' => 'nullable|string|max:255',
            'comments' => 'nullable|string'
        ]);

        $admissionApplication->update([
            'status' => 'rejected',
            'decision_date' => now(),
            'decision_status' => $validated['decision_status'] ?? null,
            'comments' => $validated['comments'] ?? $admissionApplication->comments
        ]);

        $admissionApplication->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'message' => 'Application rejected successfully.',
            'data' => new AdmissionApplicationResource($admissionApplication)
        ]);
    }

    /**
     * Waitlist an admission application
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/{admission_application}/waitlist",
        summary: "Waitlist an admission application",
        description: "Place an admission application on waitlist and notify the applicant. Requires admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
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
                        property: "decision_status",
                        type: "string",
                        description: "Waitlist status information",
                        example: "Placed on waitlist - will notify if space becomes available",
                        nullable: true
                    ),
                    new OA\Property(
                        property: "comments",
                        type: "string",
                        description: "Additional comments",
                        example: "Strong candidate, awaiting capacity",
                        nullable: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Application waitlisted successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Application waitlisted successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function waitlist(Request $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $this->authorize('update', $admissionApplication);

        $validated = $request->validate([
            'decision_status' => 'nullable|string|max:255',
            'comments' => 'nullable|string'
        ]);

        $admissionApplication->update([
            'status' => 'waitlisted',
            'decision_date' => now(),
            'decision_status' => $validated['decision_status'] ?? null,
            'comments' => $validated['comments'] ?? $admissionApplication->comments
        ]);

        $admissionApplication->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'message' => 'Application waitlisted successfully.',
            'data' => new AdmissionApplicationResource($admissionApplication)
        ]);
    }

    /**
     * Enroll an accepted application
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/{admission_application}/enroll",
        summary: "Enroll an accepted applicant",
        description: "Convert an accepted application to enrolled student status. Creates student account if needed. Requires admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "admission_application",
                description: "ID of the admission application",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Student enrolled successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Student enrolled successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/AdmissionApplicationResource")
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Bad request - application not accepted",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Application must be accepted before enrollment.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function enroll(AdmissionApplication $admissionApplication): JsonResponse
    {
        $this->authorize('update', $admissionApplication);

        if ($admissionApplication->status !== 'accepted') {
            return response()->json([
                'message' => 'Application must be accepted before enrollment.'
            ], 400);
        }

        $admissionApplication->update([
            'status' => 'enrolled'
        ]);

        $admissionApplication->load([
            'student.user',
            'term',
            'programChoices.program'
        ]);

        return response()->json([
            'message' => 'Student enrolled successfully.',
            'data' => new AdmissionApplicationResource($admissionApplication)
        ]);
    }

    /**
     * Perform bulk actions on applications
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/bulk-actions",
        summary: "Perform bulk actions on multiple applications",
        description: "Accept, reject, or waitlist multiple applications at once. Requires admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["application_ids", "action"],
                properties: [
                    new OA\Property(
                        property: "application_ids",
                        type: "array",
                        items: new OA\Items(type: "integer"),
                        description: "Array of application IDs",
                        example: [1, 2, 3]
                    ),
                    new OA\Property(
                        property: "action",
                        type: "string",
                        enum: ["accept", "reject", "waitlist"],
                        description: "Action to perform",
                        example: "accept"
                    ),
                    new OA\Property(
                        property: "decision_status",
                        type: "string",
                        description: "Decision status for all applications",
                        example: "Batch acceptance",
                        nullable: true
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Bulk action completed successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "3 applications processed successfully."),
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(property: "processed", type: "integer", example: 3),
                                new OA\Property(property: "failed", type: "integer", example: 0)
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(response: 400, description: "Bad request - validation failed"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden")
        ]
    )]
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_ids' => 'required|array|min:1',
            'application_ids.*' => 'required|integer|exists:admission_applications,id',
            'action' => 'required|string|in:accept,reject,waitlist',
            'decision_status' => 'nullable|string|max:255'
        ]);

        $applications = AdmissionApplication::whereIn('id', $validated['application_ids'])->get();

        $processed = 0;
        $failed = 0;

        foreach ($applications as $application) {
            try {
                $this->authorize('update', $application);

                $application->update([
                    'status' => $validated['action'] === 'waitlist' ? 'waitlisted' : $validated['action'] . 'ed',
                    'decision_date' => now(),
                    'decision_status' => $validated['decision_status'] ?? null
                ]);

                $processed++;
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return response()->json([
            'message' => "{$processed} applications processed successfully.",
            'data' => [
                'processed' => $processed,
                'failed' => $failed
            ]
        ]);
    }

    /**
     * Get admission statistics
     */
    #[OA\Get(
        path: "/api/v1/admission-applications/stats",
        summary: "Get admission application statistics",
        description: "Retrieve statistics about admission applications including counts by status. Requires admin/staff permissions.",
        security: [["sanctum" => []]],
        tags: ["Admission Applications"],
        parameters: [
            new OA\Parameter(
                name: "term_id",
                description: "Filter statistics by term ID",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Statistics retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "object",
                            properties: [
                                new OA\Property(property: "total", type: "integer", example: 150),
                                new OA\Property(property: "draft", type: "integer", example: 20),
                                new OA\Property(property: "submitted", type: "integer", example: 50),
                                new OA\Property(property: "under_review", type: "integer", example: 30),
                                new OA\Property(property: "accepted", type: "integer", example: 40),
                                new OA\Property(property: "rejected", type: "integer", example: 8),
                                new OA\Property(property: "waitlisted", type: "integer", example: 2),
                                new OA\Property(property: "enrolled", type: "integer", example: 0)
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden")
        ]
    )]
    public function getStats(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AdmissionApplication::class);

        $query = AdmissionApplication::query();

        if ($request->has('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        $stats = [
            'total' => $query->count(),
            'draft' => (clone $query)->where('status', 'draft')->count(),
            'submitted' => (clone $query)->where('status', 'submitted')->count(),
            'under_review' => (clone $query)->where('status', 'under_review')->count(),
            'accepted' => (clone $query)->where('status', 'accepted')->count(),
            'rejected' => (clone $query)->where('status', 'rejected')->count(),
            'waitlisted' => (clone $query)->where('status', 'waitlisted')->count(),
            'enrolled' => (clone $query)->where('status', 'enrolled')->count()
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}
