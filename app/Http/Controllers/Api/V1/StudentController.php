<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Http\Resources\StudentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Students",
    description: "API endpoints for managing student records"
)]
class StudentController extends Controller
{
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
        description: "Create a new student record. This is a complex administrative action and is not implemented in this version.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
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
        description: "Update a student's record. This is a complex administrative action and is not implemented in this version.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function update(Request $request, Student $student): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }

    #[OA\Delete(
        path: "/api/v1/students/{student}",
        summary: "Delete a student",
        description: "Delete a student's record. This is a complex administrative action and is not implemented in this version.",
        security: [["sanctum" => []]],
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function destroy(Student $student): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }
}
