<?php

namespace App\Http\Requests;

use App\Services\GradeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkSubmitGradesRequest extends FormRequest
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
            'grades' => ['required', 'array', 'min:1'],
            'grades.*' => [
                'required',
                'string',
                Rule::in(GradeService::getValidGrades()),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'grades.required' => 'Grades array is required',
            'grades.array' => 'Grades must be provided as an array',
            'grades.min' => 'At least one grade must be provided',
            'grades.*.in' => 'Invalid grade value. Must be one of: '.implode(', ', GradeService::getValidGrades()),
        ];
    }
}
