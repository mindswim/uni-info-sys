<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Student;
use App\Http\Resources\DocumentResource;
use App\Http\Requests\StoreDocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
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
        // Documents are linked to a Student directly.
        return DocumentResource::collection($student->documents);
    }

    #[OA\Post(
        path: "/api/v1/students/{student}/documents",
        summary: "Upload a document",
        description: "Upload a new document for a student. Supports PDF, DOC, and DOCX files up to 5MB.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        parameters: [
            new OA\Parameter(name: "student", in: "path", required: true, schema: new OA\Schema(type: "integer"), description: "The ID of the student."),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(ref: "#/components/schemas/StoreDocumentRequest")
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Document uploaded successfully", content: new OA\JsonContent(ref: "#/components/schemas/DocumentResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 422, description: "Validation Error"),
        ]
    )]
    public function store(StoreDocumentRequest $request, Student $student): JsonResponse
    {
        $this->authorize('create', [Document::class, $student]);
        
        $uploadedFile = $request->file('file');
        
        // Generate a unique filename to prevent conflicts
        $filename = time() . '_' . $uploadedFile->getClientOriginalName();
        
        // Store the file in the documents directory
        $filePath = $uploadedFile->storeAs('documents', $filename, 'public');
        
        // Create the document record
        $document = Document::create([
            'student_id' => $student->id,
            'document_type' => $request->document_type,
            'file_path' => $filePath,
            'original_filename' => $uploadedFile->getClientOriginalName(),
            'mime_type' => $uploadedFile->getMimeType(),
            'file_size' => $uploadedFile->getSize(),
            'status' => 'pending',
            'uploaded_at' => now(),
        ]);
        
        return response()->json([
            'message' => 'Document uploaded successfully',
            'data' => new DocumentResource($document)
        ], 201);
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
        description: "Update a document's details (not the file itself). Only document type can be updated.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/json",
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: "document_type", type: "string", enum: ["transcript", "essay", "recommendation", "certificate", "other"], example: "transcript"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Document updated successfully", content: new OA\JsonContent(ref: "#/components/schemas/DocumentResource")),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation Error"),
        ]
    )]
    public function update(Request $request, Document $document): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string|in:transcript,essay,recommendation,certificate,other',
        ]);
        
        $document->update([
            'document_type' => $request->document_type,
        ]);
        
        return response()->json([
            'message' => 'Document updated successfully',
            'data' => new DocumentResource($document)
        ]);
    }

    #[OA\Delete(
        path: "/api/v1/documents/{document}",
        summary: "Delete a document",
        description: "Delete a document and its associated file from storage.",
        security: [["sanctum" => []]],
        tags: ["Documents"],
        parameters: [
            new OA\Parameter(name: "document", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Document deleted successfully"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(Document $document): JsonResponse
    {
        // Delete the file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        // Delete the document record
        $document->delete();
        
        return response()->json([
            'message' => 'Document deleted successfully'
        ]);
    }
}
