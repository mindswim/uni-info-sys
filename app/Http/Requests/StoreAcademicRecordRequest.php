<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "StoreAcademicRecordRequest",
    title: "Store Academic Record Request",
    required: ["institution_name", "qualification_type", "start_date", "end_date", "gpa"],
    properties: [
        new OA\Property(property: "institution_name", type: "string", example: "University of California", description: "The name of the educational institution"),
        new OA\Property(property: "qualification_type", type: "string", example: "Bachelor of Science", description: "The type of qualification or degree"),
        new OA\Property(property: "start_date", type: "string", format: "date", example: "2020-09-01", description: "The start date of the academic program"),
        new OA\Property(property: "end_date", type: "string", format: "date", example: "2024-06-15", description: "The end date of the academic program"),
        new OA\Property(property: "gpa", type: "number", format: "float", example: 3.85, description: "The Grade Point Average achieved (0.00-4.00)"),
        new OA\Property(property: "transcript_url", type: "string", example: "https://example.com/transcript.pdf", description: "URL to the transcript document", nullable: true),
    ]
)]
class StoreAcademicRecordRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'institution_name' => 'required|string|max:255',
            'qualification_type' => 'required|string|max:255',
            'start_date' => 'required|date|before_or_equal:end_date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'gpa' => 'required|numeric|min:0|max:4.0',
            'transcript_url' => 'nullable|url|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'institution_name.required' => 'The institution name is required.',
            'qualification_type.required' => 'The qualification type is required.',
            'start_date.required' => 'The start date is required.',
            'start_date.before_or_equal' => 'The start date must be before or equal to the end date.',
            'end_date.required' => 'The end date is required.',
            'end_date.after_or_equal' => 'The end date must be after or equal to the start date.',
            'gpa.required' => 'The GPA is required.',
            'gpa.numeric' => 'The GPA must be a number.',
            'gpa.min' => 'The GPA must be at least 0.00.',
            'gpa.max' => 'The GPA cannot exceed 4.00.',
            'transcript_url.url' => 'The transcript URL must be a valid URL.',
        ];
    }
}
