<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ProgramResource',
    type: 'object',
    title: 'Program Resource',
    description: 'A program of study offered by the university.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Bachelor of Science in Computer Science'),
        new OA\Property(property: 'code', type: 'string', maxLength: 50, example: 'BSc-CS'),
        new OA\Property(property: 'description', type: 'string', example: 'A comprehensive program covering the fundamentals of computer science.'),
        new OA\Property(property: 'duration_years', type: 'integer', example: 4),
        new OA\Property(property: 'level', type: 'string', enum: ['undergraduate', 'graduate', 'diploma', 'certificate'], example: 'undergraduate'),
        new OA\Property(property: 'status', type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active'),
        new OA\Property(property: 'faculty_id', type: 'integer', example: 1),
        new OA\Property(property: 'department_id', type: 'integer', example: 1),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', readOnly: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', readOnly: true),
    ],
)]
class ProgramResource extends JsonResource
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
            'code' => $this->code,
            'description' => $this->description,
            'duration_years' => $this->duration_years,
            'level' => $this->level,
            'status' => $this->status,
            'faculty_id' => $this->faculty_id,
            'department_id' => $this->department_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
