<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Documents',
    description: 'API endpoints for managing student documents'
)]
class DocumentController extends Controller
{
    public function __construct()
    {
        // Note: Manual authorization is used in each method instead of authorizeResource
        // to avoid policy argument count issues with nested resources
    }

    #[OA\Get(
        path: '/api/v1/students/{student}/documents',
        summary: "Get a student's documents",
        description: "Retrieve a list of documents for a specific student. The student's user ID is used for authorization.",
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'student', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), description: 'The ID of the student.'),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful', content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/DocumentResource'))),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function index(Request $request, Student $student)
    {
        // Manual authorization check
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $student->user_id)) {
            return response()->json(['message' => 'Unauthorized to view documents for this student.'], 403);
        }

        // Documents are linked to a Student directly.
        return DocumentResource::collection($student->documents);
    }

    #[OA\Get(
        path: '/api/v1/students/{student}/documents/all-versions',
        summary: 'Get all document versions for a student (Admin only)',
        description: 'Retrieve all document versions for a specific student, including inactive versions. Only accessible by admins.',
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'student', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), description: 'The ID of the student.'),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful', content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/DocumentResource'))),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden - Admin access required'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function allVersions(Request $request, Student $student)
    {
        // Only admins can view all document versions
        if (! auth()->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Admin access required to view all document versions.'], 403);
        }

        // Return all document versions ordered by version desc
        return DocumentResource::collection($student->allDocuments);
    }

    #[OA\Post(
        path: '/api/v1/students/{student}/documents',
        summary: 'Upload a document',
        description: 'Upload a new document for a student. Supports PDF, DOC, and DOCX files up to 5MB.',
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'student', in: 'path', required: true, schema: new OA\Schema(type: 'integer'), description: 'The ID of the student.'),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(ref: '#/components/schemas/StoreDocumentRequest')
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Document uploaded successfully', content: new OA\JsonContent(ref: '#/components/schemas/DocumentResource')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function store(StoreDocumentRequest $request, Student $student): JsonResponse
    {
        // Manual authorization check
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $student->user_id)) {
            return response()->json(['message' => 'Unauthorized to upload documents for this student.'], 403);
        }

        $uploadedFile = $request->file('file');
        $documentType = $request->document_type;

        return DB::transaction(function () use ($uploadedFile, $documentType, $student) {
            // Get the next version number for this student and document type
            $nextVersion = Document::getNextVersionNumber($student->id, $documentType);

            // Deactivate all previous versions of this document type for the student
            Document::deactivatePreviousVersions($student->id, $documentType);

            // Generate a unique filename to prevent conflicts
            $filename = time().'_v'.$nextVersion.'_'.$uploadedFile->getClientOriginalName();

            // Store the file in the documents directory
            $filePath = $uploadedFile->storeAs('documents', $filename, 'public');

            // Create the new document record with version and active status
            $document = Document::create([
                'student_id' => $student->id,
                'document_type' => $documentType,
                'file_path' => $filePath,
                'original_filename' => $uploadedFile->getClientOriginalName(),
                'mime_type' => $uploadedFile->getMimeType(),
                'file_size' => $uploadedFile->getSize(),
                'status' => 'pending',
                'version' => $nextVersion,
                'is_active' => true,
                'uploaded_at' => now(),
            ]);

            $message = $nextVersion === 1
                ? 'Document uploaded successfully'
                : "Document uploaded successfully (version {$nextVersion})";

            return response()->json([
                'message' => $message,
                'data' => new DocumentResource($document),
            ], 201);
        });
    }

    #[OA\Get(
        path: '/api/v1/documents/{document}',
        summary: 'Get a specific document',
        description: 'Retrieve the details of a specific document.',
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'document', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful', content: new OA\JsonContent(ref: '#/components/schemas/DocumentResource')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function show(Document $document)
    {
        // Manual authorization check
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $document->student->user_id)) {
            return response()->json(['message' => 'Unauthorized to view this document.'], 403);
        }

        return new DocumentResource($document);
    }

    #[OA\Put(
        path: '/api/v1/documents/{document}',
        summary: 'Update a document',
        description: "Update a document's details (not the file itself). Only document type can be updated.",
        security: [['sanctum' => []]],
        tags: ['Documents'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'document_type', type: 'string', enum: ['transcript', 'essay', 'recommendation', 'certificate', 'other'], example: 'transcript'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Document updated successfully', content: new OA\JsonContent(ref: '#/components/schemas/DocumentResource')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function update(Request $request, Document $document): JsonResponse
    {
        // Manual authorization check
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $document->student->user_id)) {
            return response()->json(['message' => 'Unauthorized to update this document.'], 403);
        }

        $request->validate([
            'document_type' => 'required|string|in:transcript,essay,recommendation,certificate,other',
        ]);

        $document->update([
            'document_type' => $request->document_type,
        ]);

        return response()->json([
            'message' => 'Document updated successfully',
            'data' => new DocumentResource($document),
        ]);
    }

    #[OA\Delete(
        path: '/api/v1/documents/{document}',
        summary: 'Delete a document',
        description: 'Delete a document and its associated file from storage.',
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'document', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Document deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function destroy(Document $document): JsonResponse
    {
        // Manual authorization check
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff') || $user->id === $document->student->user_id)) {
            return response()->json(['message' => 'Unauthorized to delete this document.'], 403);
        }

        // Delete the file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        // Delete the document record
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Mark a document as verified
     */
    public function verify(Request $request, Student $student, Document $document): JsonResponse
    {
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff'))) {
            return response()->json(['message' => 'Only admins and staff can verify documents.'], 403);
        }

        if ($document->student_id !== $student->id) {
            return response()->json(['message' => 'Document does not belong to this student.'], 404);
        }

        $document->update([
            'status' => 'approved',
            'verified' => true,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Document verified successfully.',
            'data' => new DocumentResource($document),
        ]);
    }

    /**
     * Mark a document as rejected
     */
    public function reject(Request $request, Student $student, Document $document): JsonResponse
    {
        $user = auth()->user();
        if (! ($user->hasRole('Admin') || $user->hasRole('admin') || $user->hasRole('staff'))) {
            return response()->json(['message' => 'Only admins and staff can reject documents.'], 403);
        }

        if ($document->student_id !== $student->id) {
            return response()->json(['message' => 'Document does not belong to this student.'], 404);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $document->update([
            'status' => 'rejected',
            'verified' => false,
            'verified_at' => null,
        ]);

        return response()->json([
            'message' => 'Document rejected.',
            'data' => new DocumentResource($document),
        ]);
    }

    /**
     * Restore a soft-deleted document
     */
    #[OA\Post(
        path: '/api/v1/documents/{document}/restore',
        summary: 'Restore a soft-deleted document',
        description: 'Restore a soft-deleted document record. Requires admin permissions.',
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'document', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Document restored successfully',
                content: new OA\JsonContent(ref: '#/components/schemas/DocumentResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function restore($id): JsonResponse
    {
        $document = Document::withTrashed()->findOrFail($id);
        $this->authorize('restore', $document);

        $document->restore();

        return response()->json([
            'message' => 'Document restored successfully',
            'data' => new DocumentResource($document),
        ], 200);
    }

    /**
     * Permanently delete a document
     */
    #[OA\Delete(
        path: '/api/v1/documents/{document}/force',
        summary: 'Permanently delete a document',
        description: 'Permanently delete a document record. Requires admin permissions. This action cannot be undone.',
        security: [['sanctum' => []]],
        tags: ['Documents'],
        parameters: [
            new OA\Parameter(name: 'document', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Document permanently deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function forceDelete($id): JsonResponse
    {
        $document = Document::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $document);

        // Delete the file from storage if it exists
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->forceDelete();

        return response()->json(null, 204);
    }
}
