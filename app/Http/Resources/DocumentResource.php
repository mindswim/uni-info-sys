<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "DocumentResource",
    title: "Document Resource",
    description: "Represents a document uploaded by a user, such as a transcript or a resume.",
    properties: [
        new OA\Property(property: "id", type: "integer", description: "The unique identifier for the document."),
        new OA\Property(property: "user_id", type: "integer", description: "The ID of the user who owns this document."),
        new OA\Property(property: "document_type", type: "string", description: "The type of the document.", example: "transcript"),
        new OA\Property(property: "file_path", type: "string", description: "The storage path of the document file."),
        new OA\Property(property: "file_name", type: "string", description: "The original name of the document file."),
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
            'user_id' => $this->user_id,
            'document_type' => $this->document_type,
            'file_path' => $this->file_path,
            'file_name' => $this->file_name,
            'verified_at' => $this->verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
