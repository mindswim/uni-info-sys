<?php

namespace App\Http\Requests;

use App\Services\GradeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GradeChangeRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled by GradeService business logic
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'enrollment_id' => ['required', 'integer', 'exists:enrollments,id'],
            'new_grade' => [
                'required',
                'string',
                Rule::in(GradeService::getValidGrades()),
            ],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'enrollment_id.required' => 'Enrollment ID is required',
            'enrollment_id.exists' => 'Enrollment not found',
            'new_grade.required' => 'New grade is required',
            'new_grade.in' => 'Invalid grade. Must be one of: '.implode(', ', GradeService::getValidGrades()),
            'reason.required' => 'Reason for grade change is required',
            'reason.min' => 'Reason must be at least 10 characters',
            'reason.max' => 'Reason must not exceed 1000 characters',
        ];
    }
}
