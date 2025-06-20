<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Store Enrollment Swap Request",
    description: "Request body for swapping a student from one course section to another.",
    required: ["from_enrollment_id", "to_course_section_id"],
    properties: [
        new OA\Property(property: "from_enrollment_id", type: "integer", description: "The ID of the enrollment to withdraw from.", example: 1),
        new OA\Property(property: "to_course_section_id", type: "integer", description: "The ID of the course section to enroll in.", example: 2),
    ]
)]
class StoreEnrollmentSwapRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by the controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'from_enrollment_id' => [
                'required',
                'integer',
                'exists:enrollments,id',
            ],
            'to_course_section_id' => [
                'required',
                'integer',
                'exists:course_sections,id',
                'different:from_enrollment.course_section_id', // Can't swap to same section
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $this->validateSwapConstraints($validator);
        });
    }

    /**
     * Validate additional swap constraints
     */
    private function validateSwapConstraints($validator)
    {
        $fromEnrollmentId = $this->input('from_enrollment_id');
        $toCourseSection = $this->input('to_course_section_id');

        if (!$fromEnrollmentId || !$toCourseSection) {
            return; // Basic validation will handle this
        }

        // Check if trying to swap to the same course section
        $fromEnrollment = \App\Models\Enrollment::find($fromEnrollmentId);
        if ($fromEnrollment && $fromEnrollment->course_section_id == $toCourseSection) {
            $validator->errors()->add(
                'to_course_section_id',
                'Cannot swap to the same course section.'
            );
        }

        // Check if enrollment is in a swappable status
        if ($fromEnrollment && !in_array($fromEnrollment->status, ['enrolled', 'waitlisted'])) {
            $validator->errors()->add(
                'from_enrollment_id',
                'Can only swap from enrolled or waitlisted enrollments.'
            );
        }
    }

    public function messages(): array
    {
        return [
            'from_enrollment_id.required' => 'The enrollment to swap from is required.',
            'from_enrollment_id.exists' => 'The selected enrollment does not exist.',
            'to_course_section_id.required' => 'The target course section is required.',
            'to_course_section_id.exists' => 'The selected course section does not exist.',
        ];
    }
}
