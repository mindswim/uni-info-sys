<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Faculty Resource",
    description: "Represents a faculty in the university.",
    properties: [
        new OA\Property(property: "id", type: "integer", readOnly: true, example: 1),
        new OA\Property(property: "name", type: "string", example: "Faculty of Science"),
        new OA\Property(
            property: "departments",
            type: "array",
            items: new OA\Items(ref: "#/components/schemas/DepartmentResource")
        ),
    ]
)]
class FacultyResource extends JsonResource
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
            'name' => $this->name,
            'departments' => DepartmentResource::collection($this->whenLoaded('departments')),
        ];
    }
}
