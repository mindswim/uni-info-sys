<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AcademicRecordResource',
    title: 'Academic Record Resource',
    description: 'Represents an academic record for a student, such as their educational background and qualifications.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', description: 'The unique identifier for the academic record.', example: 1),
        new OA\Property(property: 'student_id', type: 'integer', description: 'The ID of the student this record belongs to.', example: 1),
        new OA\Property(property: 'institution_name', type: 'string', description: 'The name of the educational institution.', example: 'University of California'),
        new OA\Property(property: 'qualification_type', type: 'string', description: 'The type of qualification or degree.', example: 'Bachelor of Science'),
        new OA\Property(property: 'start_date', type: 'string', format: 'date', description: 'The start date of the academic program.', example: '2020-09-01'),
        new OA\Property(property: 'end_date', type: 'string', format: 'date', description: 'The end date of the academic program.', example: '2024-06-15'),
        new OA\Property(property: 'gpa', type: 'number', format: 'float', description: 'The Grade Point Average achieved.', example: 3.85),
        new OA\Property(property: 'transcript_url', type: 'string', description: 'URL to the transcript document.', example: 'https://example.com/transcript.pdf', nullable: true),
        new OA\Property(property: 'verified', type: 'boolean', description: 'Whether the academic record has been verified.', example: false),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
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
            'institution_name' => $this->institution_name,
            'qualification_type' => $this->qualification_type,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'gpa' => $this->gpa,
            'transcript_url' => $this->transcript_url,
            'verified' => $this->verified,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
