<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDegreeRequirementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by policy
    }

    public function rules(): array
    {
        return [
            'category' => 'sometimes|string|in:core,elective,general_education,major,minor,concentration,capstone',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'required_credit_hours' => 'sometimes|integer|min:1',
            'min_courses' => 'nullable|integer|min:1',
            'max_courses' => 'nullable|integer|min:1',
            'min_gpa' => 'nullable|numeric|min:0|max:4.3',
            'allowed_courses' => 'nullable|array',
            'allowed_courses.*' => 'exists:courses,id',
            'excluded_courses' => 'nullable|array',
            'excluded_courses.*' => 'exists:courses,id',
            'is_required' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer',
        ];
    }
}
