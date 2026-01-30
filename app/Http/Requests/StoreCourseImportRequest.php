<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreCourseImportRequest',
    title: 'Store Course Import Request',
    required: ['file'],
    properties: [
        new OA\Property(
            property: 'file',
            type: 'string',
            format: 'binary',
            description: 'CSV file containing course data with headers: course_code, title, description, credits, department_code, prerequisite_course_codes'
        ),
    ]
)]
class StoreCourseImportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by the controller policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimeTypes:text/csv,text/plain,application/csv',
                'max:10240', // 10MB max file size
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'A CSV file is required for course import.',
            'file.file' => 'The uploaded file must be a valid file.',
            'file.mimeTypes' => 'The file must be a CSV file.',
            'file.max' => 'The file size must not exceed 10MB.',
        ];
    }
}
