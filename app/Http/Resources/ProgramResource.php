<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'degree_level' => $this->degree_level,
            'duration_years' => $this->duration_years,
            'capacity' => $this->capacity,
            'description' => $this->description,
        ];
    }
}
