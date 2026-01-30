<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTuitionRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => 'required|exists:programs,id',
            'term_id' => 'required|exists:terms,id',
            'student_type' => 'required|string|in:domestic,international',
            'enrollment_status' => 'required|string|in:full_time,part_time',
            'tuition_per_credit' => 'required|numeric|min:0',
            'base_fee' => 'required|numeric|min:0',
            'technology_fee' => 'nullable|numeric|min:0',
            'activity_fee' => 'nullable|numeric|min:0',
            'health_fee' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'is_active' => 'required|boolean',
            'notes' => 'nullable|string',
        ];
    }
}
