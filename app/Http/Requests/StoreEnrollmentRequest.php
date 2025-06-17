<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by middleware/policies
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => [
                'required',
                'integer',
                'exists:students,id',
            ],
            'course_section_id' => [
                'required',
                'integer',
                'exists:course_sections,id',
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['enrolled', 'waitlisted']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'A student must be selected for enrollment.',
            'student_id.exists' => 'The selected student does not exist.',
            'course_section_id.required' => 'A course section must be selected for enrollment.',
            'course_section_id.exists' => 'The selected course section does not exist.',
            'status.in' => 'Enrollment status must be either enrolled or waitlisted.',
        ];
    }
}
