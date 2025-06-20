<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicRecord;
use App\Models\Student;
use App\Http\Resources\AcademicRecordResource;
use App\Http\Requests\StoreAcademicRecordRequest;
use App\Http\Requests\UpdateAcademicRecordRequest;
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
        description: "Create a new academic record for a student. Only administrators can create academic records.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer"), description: "The ID of the student."),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(ref: "#/components/schemas/StoreAcademicRecordRequest")
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Academic record created successfully", content: new OA\JsonContent(ref: "#/components/schemas/AcademicRecordResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 422, description: "Validation Error"),
        ]
    )]
    public function store(StoreAcademicRecordRequest $request, Student $student): JsonResponse
    {
        $this->authorize('create', [AcademicRecord::class, $student]);
        
        $academicRecord = AcademicRecord::create([
            'student_id' => $student->id,
            'institution_name' => $request->institution_name,
            'qualification_type' => $request->qualification_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'gpa' => $request->gpa,
            'transcript_url' => $request->transcript_url,
            'verified' => false, // New records are unverified by default
        ]);
        
        return response()->json([
            'message' => 'Academic record created successfully',
            'data' => new AcademicRecordResource($academicRecord)
        ], 201);
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
        description: "Update an academic record. Only administrators can update academic records.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "academic_record", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(ref: "#/components/schemas/UpdateAcademicRecordRequest")
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Academic record updated successfully", content: new OA\JsonContent(ref: "#/components/schemas/AcademicRecordResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation Error"),
        ]
    )]
    public function update(UpdateAcademicRecordRequest $request, AcademicRecord $academicRecord): JsonResponse
    {
        $academicRecord->update($request->validated());
        
        return response()->json([
            'message' => 'Academic record updated successfully',
            'data' => new AcademicRecordResource($academicRecord)
        ]);
    }

    #[OA\Delete(
        path: "/api/v1/academic-records/{academic_record}",
        summary: "Delete an academic record",
        description: "Delete an academic record. Only administrators can delete academic records.",
        security: [["sanctum" => []]],
        tags: ["Academic Records"],
        parameters: [
            new OA\Parameter(name: "academic_record", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Academic record deleted successfully"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(AcademicRecord $academicRecord): JsonResponse
    {
        $academicRecord->delete();
        
        return response()->json([
            'message' => 'Academic record deleted successfully'
        ]);
    }
}
