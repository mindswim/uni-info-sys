<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "StudentResource",
    title: "Student Resource",
    description: "Represents a student in the system.",
    properties: [
        new OA\Property(property: "id", type: "integer", description: "The unique identifier for the student.", example: 1),
        new OA\Property(property: "student_number", type: "string", description: "The unique student identification number.", example: "2024-00001"),
        new OA\Property(property: "user", ref: "#/components/schemas/UserResource", description: "The user account associated with the student (when loaded)."),
    ]
)]
class StudentResource extends JsonResource
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
            'student_number' => $this->student_number,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
