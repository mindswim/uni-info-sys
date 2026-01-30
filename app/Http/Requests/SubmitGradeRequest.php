<?php

namespace App\Http\Requests;

use App\Services\GradeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitGradeRequest extends FormRequest
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
            'grade' => [
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
            'grade.required' => 'A grade is required',
            'grade.in' => 'Invalid grade. Must be one of: '.implode(', ', GradeService::getValidGrades()),
        ];
    }
}
