<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Course Section Resource',
    description: 'Represents a specific section of a course offered in a term.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'capacity', type: 'integer', example: 40),
        new OA\Property(
            property: 'schedule_days',
            type: 'array',
            items: new OA\Items(type: 'string', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            example: ['Tuesday', 'Thursday']
        ),
        new OA\Property(property: 'start_time', type: 'string', format: 'time', example: '10:00'),
        new OA\Property(property: 'end_time', type: 'string', format: 'time', example: '11:30'),
        new OA\Property(property: 'course', ref: '#/components/schemas/CourseResource'),
        new OA\Property(property: 'term', ref: '#/components/schemas/TermResource'),
        new OA\Property(property: 'instructor', ref: '#/components/schemas/StaffResource'),
        new OA\Property(property: 'room', ref: '#/components/schemas/RoomResource'),
    ]
)]
class CourseSectionResource extends JsonResource
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
            'section_number' => $this->section_number,
            'capacity' => $this->capacity,
            'status' => $this->status,
            'schedule_days' => $this->schedule_days,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'enrolled_count' => $this->whenLoaded('enrollments', fn () => $this->enrollments->count(), 0),
            'available_spots' => $this->capacity - $this->whenLoaded('enrollments', fn () => $this->enrollments->count(), 0),
            'schedule_display' => $this->schedule_days
                ? implode(', ', $this->schedule_days).' '.substr($this->start_time, 0, 5).'-'.substr($this->end_time, 0, 5)
                : null,
            'course' => new CourseResource($this->whenLoaded('course')),
            'term' => new TermResource($this->whenLoaded('term')),
            'instructor' => new StaffResource($this->whenLoaded('instructor')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'enrollments' => EnrollmentResource::collection($this->whenLoaded('enrollments')),
        ];
    }
}
