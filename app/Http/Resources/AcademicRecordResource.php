<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "AcademicRecordResource",
    title: "Academic Record Resource",
    description: "Represents an academic record for a student, such as their GPA for a specific program in a given term.",
    properties: [
        new OA\Property(property: "id", type: "integer", description: "The unique identifier for the academic record.", example: 1),
        new OA\Property(property: "student_id", type: "integer", description: "The ID of the student this record belongs to.", example: 1),
        new OA\Property(property: "program_id", type: "integer", description: "The ID of the program this record is associated with.", example: 1, nullable: true),
        new OA\Property(property: "term_id", type: "integer", description: "The ID of the term this record is for.", example: 1, nullable: true),
        new OA\Property(property: "gpa", type: "number", format: "float", description: "The Grade Point Average for this record.", example: 3.85),
        new OA\Property(property: "status", type: "string", description: "The academic standing or status.", example: "Good Standing"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
class AcademicRecordResource extends JsonResource
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
            'program_id' => $this->program_id,
            'term_id' => $this->term_id,
            'gpa' => $this->gpa,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
