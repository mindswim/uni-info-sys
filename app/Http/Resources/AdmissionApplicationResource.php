<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'academic_year' => $this->academic_year,
            'semester' => $this->semester,
            'status' => $this->status,
            'application_date' => $this->application_date->format('Y-m-d H:i:s'),
            'comments' => $this->comments,
            'program_choices' => ProgramChoiceResource::collection($this->whenLoaded('programChoices')),
        ];
    }
}
