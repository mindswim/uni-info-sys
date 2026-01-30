<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreGradeImportRequest',
    title: 'Store Grade Import Request',
    required: ['file'],
    properties: [
        new OA\Property(
            property: 'file',
            type: 'string',
            format: 'binary',
            description: 'CSV file containing grade data with headers: student_id, grade'
        ),
    ]
)]
class StoreGradeImportRequest extends FormRequest
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
                'max:5120', // 5MB max file size (smaller than course import since it's just grades)
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'A CSV file is required for grade import.',
            'file.file' => 'The uploaded file must be a valid file.',
            'file.mimeTypes' => 'The file must be a CSV file.',
            'file.max' => 'The file size must not exceed 5MB.',
        ];
    }
}
