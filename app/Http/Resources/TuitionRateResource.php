<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TuitionRateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'term_id' => $this->term_id,
            'student_type' => $this->student_type,
            'enrollment_status' => $this->enrollment_status,
            'tuition_per_credit' => $this->tuition_per_credit,
            'base_fee' => $this->base_fee,
            'technology_fee' => $this->technology_fee,
            'activity_fee' => $this->activity_fee,
            'health_fee' => $this->health_fee,
            'effective_date' => $this->effective_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'is_active' => $this->is_active,
            'notes' => $this->notes,
            'program' => new ProgramResource($this->whenLoaded('program')),
            'term' => new TermResource($this->whenLoaded('term')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
