<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TermResource',
    type: 'object',
    title: 'Term Resource',
    description: 'An academic term/semester in the university calendar.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Fall 2024'),
        new OA\Property(property: 'academic_year', type: 'integer', minimum: 2000, example: 2024),
        new OA\Property(property: 'semester', type: 'string', enum: ['Fall', 'Spring', 'Summer'], example: 'Fall'),
        new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2024-08-26'),
        new OA\Property(property: 'end_date', type: 'string', format: 'date', example: '2024-12-15'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', readOnly: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', readOnly: true),
    ],
)]
class TermResource extends JsonResource
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
            'academic_year' => $this->academic_year,
            'semester' => $this->semester,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
