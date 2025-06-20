<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "DocumentResource",
    title: "Document Resource",
    description: "Represents a document uploaded by a student, such as a transcript or essay.",
    properties: [
        new OA\Property(property: "id", type: "integer", description: "The unique identifier for the document."),
        new OA\Property(property: "student_id", type: "integer", description: "The ID of the student who owns this document."),
        new OA\Property(property: "document_type", type: "string", description: "The type of the document.", example: "transcript"),
        new OA\Property(property: "file_path", type: "string", description: "The storage path of the document file."),
        new OA\Property(property: "original_filename", type: "string", description: "The original name of the document file."),
        new OA\Property(property: "mime_type", type: "string", description: "The MIME type of the document file."),
        new OA\Property(property: "file_size", type: "integer", description: "The size of the document file in bytes."),
        new OA\Property(property: "status", type: "string", description: "The status of the document.", example: "pending"),
        new OA\Property(property: "verified", type: "boolean", description: "Whether the document has been verified."),
        new OA\Property(property: "uploaded_at", type: "string", format: "date-time", description: "When the document was uploaded."),
        new OA\Property(property: "verified_at", type: "string", format: "date-time", description: "When the document was verified by an administrator.", nullable: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
class DocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'document_type' => $this->document_type,
            'file_path' => $this->file_path,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'status' => $this->status,
            'verified' => $this->verified ?? false,
            'uploaded_at' => $this->uploaded_at?->toISOString(),
            'verified_at' => $this->verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
