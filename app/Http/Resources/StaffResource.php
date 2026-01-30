<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Staff Resource',
    description: 'Represents a staff member in the system.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'job_title', type: 'string', maxLength: 255, example: 'Professor'),
        new OA\Property(property: 'bio', type: 'string', example: 'Expert in computer science with 10 years of experience.'),
        new OA\Property(property: 'office_location', type: 'string', maxLength: 255, example: 'Building A, Room 101'),
        new OA\Property(property: 'user', ref: '#/components/schemas/UserResource'),
        new OA\Property(property: 'department', ref: '#/components/schemas/DepartmentResource'),
    ]
)]
class StaffResource extends JsonResource
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
            'job_title' => $this->job_title,
            'bio' => $this->bio,
            'office_location' => $this->office_location,
            'user' => new UserResource($this->whenLoaded('user')),
            'department' => new DepartmentResource($this->whenLoaded('department')),
        ];
    }
}
