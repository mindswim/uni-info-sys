<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
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
            'title' => $this->title,
            'course_code' => $this->course_code,
            'credits' => $this->credits,
            'description' => $this->description,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'prerequisites' => CourseResource::collection($this->whenLoaded('prerequisites')),
        ];
    }
}
