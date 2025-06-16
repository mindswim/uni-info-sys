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
            'capacity' => $this->capacity,
            'schedule_days' => $this->schedule_days,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'course' => new CourseResource($this->whenLoaded('course')),
            'term' => new TermResource($this->whenLoaded('term')),
            'instructor' => new StaffResource($this->whenLoaded('instructor')),
            'room' => new RoomResource($this->whenLoaded('room')),
        ];
    }
}
