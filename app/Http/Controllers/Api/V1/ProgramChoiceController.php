<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramChoiceRequest;
use App\Http\Requests\UpdateProgramChoiceRequest;
use App\Http\Resources\ProgramChoiceResource;
use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Program Choices",
    description: "API endpoints for managing program choices within admission applications"
)]
class ProgramChoiceController extends Controller
{
    /**
     * Display a listing of program choices for a specific admission application
     */
    #[OA\Get(
        path: "/api/v1/admission-applications/{admission_application}/program-choices",
        summary: "Get program choices for an admission application",
        description: "Retrieve all program choices for a specific admission application. Students can only see choices for their own applications.",
        security: [["sanctum" => []]],
        tags: ["Program Choices"],
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
                description: "List of program choices retrieved successfully",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/ProgramChoiceResource")
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
    public function index(AdmissionApplication $admissionApplication): AnonymousResourceCollection
    {
        // Check if user can view program choices for this specific application
        $user = request()->user();
        $userRoles = $user->roles()->pluck('name')->toArray();
        
        // Admin/staff can view any application's choices
        if (!in_array('admin', $userRoles) && !in_array('staff', $userRoles)) {
            // Students can only view choices for their own applications
            if (!in_array('student', $userRoles) || 
                !$admissionApplication->student || 
                $user->id !== $admissionApplication->student->user_id) {
                abort(403, 'Forbidden - insufficient permissions');
            }
        }

        $programChoices = $admissionApplication->programChoices()
            ->with(['program.department'])
            ->orderBy('preference_order')
            ->get();

        return ProgramChoiceResource::collection($programChoices);
    }

    /**
     * Store a newly created program choice
     */
    #[OA\Post(
        path: "/api/v1/admission-applications/{admission_application}/program-choices",
        summary: "Create a new program choice",
        description: "Add a new program choice to an admission application. Students can only add choices to their own applications.",
        security: [["sanctum" => []]],
        tags: ["Program Choices"],
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
            required: true,
            content: new OA\JsonContent(
                required: ["program_id", "preference_order"],
                properties: [
                    new OA\Property(
                        property: "program_id",
                        type: "integer",
                        description: "ID of the program to choose",
                        example: 1
                    ),
                    new OA\Property(
                        property: "preference_order",
                        type: "integer",
                        description: "Preference order (1 = most preferred)",
                        example: 1,
                        minimum: 1,
                        maximum: 10
                    ),
                    new OA\Property(
                        property: "status",
                        type: "string",
                        description: "Initial status (defaults to pending)",
                        enum: ["pending", "accepted", "rejected"],
                        example: "pending"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Program choice created successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Program choice created successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/ProgramChoiceResource")
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
    public function store(StoreProgramChoiceRequest $request, AdmissionApplication $admissionApplication): JsonResponse
    {
        $validated = $request->validated();
        
        // Set default values
        $validated['application_id'] = $admissionApplication->id;
        $validated['status'] = $validated['status'] ?? 'pending';

        // Create the program choice
        $programChoice = ProgramChoice::create($validated);

        // Load relationships for response
        $programChoice->load(['program.department']);

        return response()->json([
            'message' => 'Program choice created successfully.',
            'data' => new ProgramChoiceResource($programChoice),
        ], 201);
    }

    /**
     * Display a specific program choice
     */
    #[OA\Get(
        path: "/api/v1/program-choices/{program_choice}",
        summary: "Get a specific program choice",
        description: "Retrieve details of a specific program choice. Students can only view choices for their own applications.",
        security: [["sanctum" => []]],
        tags: ["Program Choices"],
        parameters: [
            new OA\Parameter(
                name: "program_choice",
                description: "ID of the program choice",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Program choice retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/ProgramChoiceResource")
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
                description: "Program choice not found"
            )
        ]
    )]
    public function show(ProgramChoice $programChoice): JsonResponse
    {
        $this->authorize('view', $programChoice);

        $programChoice->load([
            'program.department',
            'admissionApplication.student.user',
            'admissionApplication.term'
        ]);

        return response()->json([
            'data' => new ProgramChoiceResource($programChoice),
        ]);
    }

    /**
     * Update a specific program choice
     */
    #[OA\Put(
        path: "/api/v1/program-choices/{program_choice}",
        summary: "Update a program choice",
        description: "Update a program choice. Students can only update choices for their own draft applications. Admin/staff can update any choice.",
        security: [["sanctum" => []]],
        tags: ["Program Choices"],
        parameters: [
            new OA\Parameter(
                name: "program_choice",
                description: "ID of the program choice",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "preference_order",
                        type: "integer",
                        description: "Preference order (1 = most preferred)",
                        example: 2,
                        minimum: 1,
                        maximum: 10
                    ),
                    new OA\Property(
                        property: "status",
                        type: "string",
                        description: "Status (admin/staff only)",
                        enum: ["pending", "accepted", "rejected"],
                        example: "accepted"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Program choice updated successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Program choice updated successfully."),
                        new OA\Property(property: "data", ref: "#/components/schemas/ProgramChoiceResource")
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
                description: "Program choice not found"
            )
        ]
    )]
    public function update(UpdateProgramChoiceRequest $request, ProgramChoice $programChoice): JsonResponse
    {
        $validated = $request->validated();

        $programChoice->update($validated);

        // Load relationships for response
        $programChoice->load(['program.department']);

        return response()->json([
            'message' => 'Program choice updated successfully.',
            'data' => new ProgramChoiceResource($programChoice),
        ]);
    }

    /**
     * Remove a specific program choice
     */
    #[OA\Delete(
        path: "/api/v1/program-choices/{program_choice}",
        summary: "Delete a program choice",
        description: "Delete a program choice. Students can only delete choices from their own draft applications. Admin can delete any choice.",
        security: [["sanctum" => []]],
        tags: ["Program Choices"],
        parameters: [
            new OA\Parameter(
                name: "program_choice",
                description: "ID of the program choice",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Program choice deleted successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Program choice deleted successfully.")
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
                description: "Program choice not found"
            )
        ]
    )]
    public function destroy(ProgramChoice $programChoice): JsonResponse
    {
        $this->authorize('delete', $programChoice);

        $programChoice->delete();

        return response()->json([
            'message' => 'Program choice deleted successfully.',
        ]);
    }
}
