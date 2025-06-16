<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
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
            'enrollment_date' => $this->enrollment_date->format('Y-m-d'),
            'status' => $this->status,
            'student' => new StudentResource($this->whenLoaded('student')),
            'course_section' => new CourseSectionResource($this->whenLoaded('courseSection')),
        ];
    }
}
