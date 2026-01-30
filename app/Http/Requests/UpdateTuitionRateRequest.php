<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTuitionRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => 'sometimes|exists:programs,id',
            'term_id' => 'sometimes|exists:terms,id',
            'student_type' => 'sometimes|string|in:domestic,international',
            'enrollment_status' => 'sometimes|string|in:full_time,part_time',
            'tuition_per_credit' => 'sometimes|numeric|min:0',
            'base_fee' => 'sometimes|numeric|min:0',
            'technology_fee' => 'nullable|numeric|min:0',
            'activity_fee' => 'nullable|numeric|min:0',
            'health_fee' => 'nullable|numeric|min:0',
            'effective_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:effective_date',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string',
        ];
    }
}
