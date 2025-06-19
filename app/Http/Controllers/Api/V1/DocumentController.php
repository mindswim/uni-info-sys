<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Student;
use App\Http\Resources\DocumentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Documents",
    description: "API endpoints for managing student documents"
)]
class DocumentController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Document::class, 'document');
    }

    #[OA\Get(
        path: "/api/v1/students/{student}/documents",
        summary: "Get a student's documents",
        description: "Retrieve a list of documents for a specific student. The student's user ID is used for authorization.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer"), description: "The ID of the student."),
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful", content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/DocumentResource"))),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function index(Request $request, Student $student): AnonymousResourceCollection
    {
        // Authorize that the current user can see documents for the given student.
        $this->authorize('viewAny', [Document::class, $student]);
        // Documents are linked to a User, not a Student directly.
        return DocumentResource::collection($student->user->documents);
    }

    #[OA\Post(
        path: "/api/v1/students/{student}/documents",
        summary: "Upload a document",
        description: "Upload a new document for a student. File upload handling is not implemented in this version.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer"), description: "The ID of the student."),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function store(Request $request, Student $student): JsonResponse
    {
        $this->authorize('create', [Document::class, $student]);
        return response()->json(['message' => 'Not Implemented'], 501);
    }

    #[OA\Get(
        path: "/api/v1/documents/{document}",
        summary: "Get a specific document",
        description: "Retrieve the details of a specific document.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        parameters: [
            new OA\Parameter(name: "document", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful", content: new OA\JsonContent(ref: "#/components/schemas/DocumentResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(Document $document): DocumentResource
    {
        return new DocumentResource($document);
    }

    #[OA\Put(
        path: "/api/v1/documents/{document}",
        summary: "Update a document",
        description: "Update a document's details. Not implemented.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function update(Request $request, Document $document): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }

    #[OA\Delete(
        path: "/api/v1/documents/{document}",
        summary: "Delete a document",
        description: "Delete a document. Not implemented.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        parameters: [
            new OA\Parameter(name: "document", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented"),
        ]
    )]
    public function destroy(Document $document): JsonResponse
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }
}
