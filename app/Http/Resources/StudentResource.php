<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'student_id_number' => $this->student_number,
            'name' => $this->first_name . ' ' . $this->last_name,
            'date_of_birth' => $this->date_of_birth->format('Y-m-d'),
            'nationality' => $this->nationality,
            'profile_complete' => $this->hasCompleteProfile(), // From your Student model
            
            // Use whenLoaded to include relationships only when they are explicitly loaded in the controller.
            // This prevents N+1 query problems.
            'applications' => AdmissionApplicationResource::collection($this->whenLoaded('admissionApplications')),
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
            'academic_records' => AcademicRecordResource::collection($this->whenLoaded('academicRecords')),
        ];
    }
}
