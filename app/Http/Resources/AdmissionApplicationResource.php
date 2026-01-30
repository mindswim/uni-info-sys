<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdmissionApplicationResource',
    title: 'Admission Application Resource',
    description: 'Admission application resource representation',
    properties: [
        new OA\Property(
            property: 'id',
            type: 'integer',
            description: 'Unique identifier of the admission application',
            example: 1
        ),
        new OA\Property(
            property: 'student_id',
            type: 'integer',
            description: 'ID of the student who submitted the application',
            example: 1
        ),
        new OA\Property(
            property: 'term_id',
            type: 'integer',
            description: 'ID of the term for which the application is submitted',
            example: 1
        ),
        new OA\Property(
            property: 'status',
            type: 'string',
            description: 'Current status of the application',
            enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'enrolled'],
            example: 'submitted'
        ),
        new OA\Property(
            property: 'application_date',
            type: 'string',
            format: 'date-time',
            description: 'Date and time when the application was created',
            example: '2024-01-15 10:30:00'
        ),
        new OA\Property(
            property: 'decision_date',
            type: 'string',
            format: 'date-time',
            description: 'Date and time when the decision was made',
            example: '2024-02-15 14:20:00',
            nullable: true
        ),
        new OA\Property(
            property: 'decision_status',
            type: 'string',
            description: 'Additional information about the decision',
            example: 'Accepted with conditions',
            nullable: true
        ),
        new OA\Property(
            property: 'comments',
            type: 'string',
            description: 'Additional comments or notes about the application',
            example: 'Looking forward to joining the program',
            nullable: true
        ),
        new OA\Property(
            property: 'student',
            type: 'object',
            description: 'Student information (when loaded)',
            nullable: true
        ),
        new OA\Property(
            property: 'term',
            type: 'object',
            description: 'Term information (when loaded)',
            nullable: true
        ),
        new OA\Property(
            property: 'program_choices',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/ProgramChoiceResource'),
            description: 'List of program choices for this application (when loaded)'
        ),
    ]
)]
class AdmissionApplicationResource extends JsonResource
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
            'term_id' => $this->term_id,
            'status' => $this->status,
            'application_date' => $this->application_date?->format('Y-m-d H:i:s'),
            'decision_date' => $this->decision_date?->format('Y-m-d H:i:s'),
            'decision_status' => $this->decision_status,
            'comments' => $this->comments,
            'student' => $this->whenLoaded('student', function () {
                return new StudentResource($this->student);
            }),
            'term' => $this->whenLoaded('term', function () {
                return new TermResource($this->term);
            }),
            'program_choices' => ProgramChoiceResource::collection($this->whenLoaded('programChoices')),
        ];
    }
}
