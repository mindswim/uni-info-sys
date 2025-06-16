<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'schedule_days' => $this->schedule_days,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships
            'course' => new CourseResource($this->whenLoaded('course')),
            'term' => new TermResource($this->whenLoaded('term')),
            'instructor' => new StaffResource($this->whenLoaded('instructor')),
            'room' => new RoomResource($this->whenLoaded('room')),

            // Computed fields
            'full_course_name' => $this->when($this->relationLoaded('course'),
                fn() => $this->course->course_code . ' - ' . $this->course->title),
            'schedule_display' => $this->when(
                $this->schedule_days && $this->start_time && $this->end_time,
                fn() => $this->schedule_days . ' ' . $this->start_time . '-' . $this->end_time
            ),
            'enrolled_count' => $this->whenCounted('enrollments'),
            'available_spots' => $this->when(isset($this->enrollments_count),
                fn() => $this->capacity - $this->enrollments_count),
        ];
    }
}
