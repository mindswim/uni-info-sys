<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Department Resource',
    description: 'Represents a department within a faculty.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Computer Science'),
        new OA\Property(property: 'faculty', ref: '#/components/schemas/FacultyResource'),
        new OA\Property(
            property: 'programs',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/ProgramResource')
        ),
    ]
)]
class DepartmentResource extends JsonResource
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
            'faculty' => new FacultyResource($this->whenLoaded('faculty')),
            'programs' => ProgramResource::collection($this->whenLoaded('programs')),
        ];
    }
}
