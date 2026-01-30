<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DegreeRequirementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'category' => $this->category,
            'name' => $this->name,
            'description' => $this->description,
            'required_credit_hours' => $this->required_credit_hours,
            'min_courses' => $this->min_courses,
            'max_courses' => $this->max_courses,
            'min_gpa' => $this->min_gpa,
            'allowed_courses' => $this->allowed_courses,
            'excluded_courses' => $this->excluded_courses,
            'is_required' => $this->is_required,
            'sort_order' => $this->sort_order,
            'program' => new ProgramResource($this->whenLoaded('program')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
