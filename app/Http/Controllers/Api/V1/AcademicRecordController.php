<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicRecord;
use App\Models\Student;
use App\Http\Resources\AcademicRecordResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;


#[OA\Tag(
    name: "Academic Records",
    description: "API endpoints for managing academic records for a student"
)]
class AcademicRecordController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(AcademicRecord::class, 'academic_record');
    }

    #[OA\Get(
        path: "/api/v1/students/{student}/academic-records",
        summary: "Get a student's academic records",
        description: "Retrieve a list of academic records for a specific student.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer"), description: "The ID of the student."),
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful", content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/AcademicRecordResource"))),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function index(Request $request, Student $student): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [AcademicRecord::class, $student]);
        return AcademicRecordResource::collection($student->academicRecords);
    }

    #[OA\Post(
        path: "/api/v1/students/{student}/academic-records",
        summary: "Create a new academic record",
        description: "Create a new academic record for a student. Not implemented.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer"), description: "The ID of the student."),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function store(Request $request, Student $student): JsonResponse
    {
        $this->authorize('create', [AcademicRecord::class, $student]);
        return response()->json(['message' => 'Not Implemented'], 501);
    }

    #[OA\Get(
        path: "/api/v1/academic-records/{academic_record}",
        summary: "Get a specific academic record",
        description: "Retrieve the details of a specific academic record.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "academic_record", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful", content: new OA\JsonContent(ref: "#/components/schemas/AcademicRecordResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(AcademicRecord $academicRecord): AcademicRecordResource
    {
        return new AcademicRecordResource($academicRecord);
    }

    #[OA\Put(
        path: "/api/v1/academic-records/{academic_record}",
        summary: "Update an academic record",
        description: "Update an academic record. Not implemented.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "academic_record", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function update(Request $request, AcademicRecord $academicRecord): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }

    #[OA\Delete(
        path: "/api/v1/academic-records/{academic_record}",
        summary: "Delete an academic record",
        description: "Delete an academic record. Not implemented.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "academic_record", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function destroy(AcademicRecord $academicRecord): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }
}
