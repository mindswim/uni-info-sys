<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Update Enrollment Request",
    description: "Request body for updating an enrollment. All fields are optional.",
    properties: [
        new OA\Property(property: "status", type: "string", enum: ["enrolled", "waitlisted", "completed", "withdrawn"], description: "The new status of the enrollment.", example: "completed"),
        new OA\Property(property: "grade", type: "string", maxLength: 5, nullable: true, description: "The grade received (required when status is 'completed').", example: "A"),
    ]
)]
class UpdateEnrollmentRequest extends FormRequest
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
        $enrollment = $this->route('enrollment');
        
        return [
            'status' => [
                'sometimes',
                'string',
                Rule::in(['enrolled', 'waitlisted', 'completed', 'withdrawn']),
                function ($attribute, $value, $fail) use ($enrollment) {
                    $this->validateStatusTransition($enrollment, $value, $fail);
                },
            ],
            'grade' => [
                'sometimes',
                'nullable',
                'string',
                'max:5',
                function ($attribute, $value, $fail) {
                    $this->validateGradeFormat($value, $fail);
                },
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $this->validateGradeAssignment($validator);
        });
    }

    /**
     * Validate status transitions are logical
     */
    private function validateStatusTransition($enrollment, $newStatus, $fail)
    {
        if (!$enrollment) {
            return; // Skip if enrollment not found
        }

        $currentStatus = $enrollment->status;
        $validTransitions = [
            'enrolled' => ['completed', 'withdrawn'],
            'waitlisted' => ['enrolled', 'withdrawn'],
            'completed' => [], // Cannot change from completed
            'withdrawn' => [], // Cannot change from withdrawn
        ];

        if (!isset($validTransitions[$currentStatus])) {
            $fail('Invalid current enrollment status.');
            return;
        }

        if (!in_array($newStatus, $validTransitions[$currentStatus])) {
            $fail("Cannot change enrollment status from '{$currentStatus}' to '{$newStatus}'.");
        }
    }

    /**
     * Validate grade format
     */
    private function validateGradeFormat($grade, $fail)
    {
        if ($grade === null) {
            return; // Null grades are allowed
        }

        // Define valid grade formats
        $validGrades = [
            // Letter grades
            'A+', 'A', 'A-',
            'B+', 'B', 'B-',
            'C+', 'C', 'C-',
            'D+', 'D', 'D-',
            'F',
            // Pass/Fail
            'P', 'NP',
            // Incomplete/Withdrawal
            'I', 'W',
            // Audit
            'AU',
        ];

        if (!in_array(strtoupper($grade), $validGrades)) {
            $fail('Invalid grade format. Valid grades are: ' . implode(', ', $validGrades));
        }
    }

    /**
     * Validate grade assignment rules
     */
    private function validateGradeAssignment($validator)
    {
        $enrollment = $this->route('enrollment');
        $grade = $this->input('grade');
        $status = $this->input('status');

        if (!$enrollment) {
            return; // Skip if enrollment not found
        }

        // Only allow grade assignment for completed enrollments
        if ($grade !== null) {
            $finalStatus = $status ?? $enrollment->status;
            
            if ($finalStatus !== 'completed') {
                $validator->errors()->add(
                    'grade',
                    'Grades can only be assigned to completed enrollments.'
                );
            }
        }

        // If setting status to completed, grade should be provided
        if ($status === 'completed' && $grade === null && $enrollment->grade === null) {
            $validator->errors()->add(
                'grade',
                'A grade must be provided when marking enrollment as completed.'
            );
        }
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Enrollment status must be one of: enrolled, waitlisted, completed, withdrawn.',
            'grade.max' => 'Grade must not exceed 5 characters.',
        ];
    }
}
