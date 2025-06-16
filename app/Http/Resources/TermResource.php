<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TermResource extends JsonResource
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
            'academic_year' => $this->academic_year,
            'semester' => $this->semester,
            'start_date' => $this->start_date instanceof \Carbon\Carbon ? $this->start_date->toDateString() : $this->start_date,
            'end_date' => $this->end_date instanceof \Carbon\Carbon ? $this->end_date->toDateString() : $this->end_date,
        ];
    }
}
