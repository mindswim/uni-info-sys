<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Store Enrollment Request",
    description: "Request body for enrolling a student in a course section.",
    required: ["student_id", "course_section_id"],
    properties: [
        new OA\Property(property: "student_id", type: "integer", description: "The ID of the student to enroll.", example: 1),
        new OA\Property(property: "course_section_id", type: "integer", description: "The ID of the course section to enroll in.", example: 1),
        new OA\Property(property: "status", type: "string", enum: ["enrolled", "waitlisted"], description: "Optional status, defaults to logic in EnrollmentService.", example: "enrolled"),
    ]
)]
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
