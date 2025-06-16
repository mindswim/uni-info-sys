<?php

namespace App\Http\Requests;

use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
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
                function ($attribute, $value, $fail) {
                    $this->validateStudentActive($value, $fail);
                },
            ],
            'course_section_id' => [
                'required',
                'integer',
                'exists:course_sections,id',
                function ($attribute, $value, $fail) {
                    $this->validateCourseSectionAvailable($value, $fail);
                },
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['enrolled', 'waitlisted']),
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            \Log::info('Before validation - input data:', $this->all());
            $this->validateNoDuplicateEnrollment($validator);
            $this->validateCapacityAndSetStatus($validator);
            \Log::info('After validation - input data:', $this->all());
        });
    }

    /**
     * Validate that the student is active and can enroll
     */
    private function validateStudentActive($studentId, $fail)
    {
        $student = Student::with('user')->find($studentId);
        
        if (!$student) {
            $fail('The selected student does not exist.');
            return;
        }

        // Check if student's user account is active
        if (!$student->user || !$student->user->email_verified_at) {
            $fail('The student account is not active or verified.');
        }
    }

    /**
     * Validate that the course section is available for enrollment
     */
    private function validateCourseSectionAvailable($courseSectionId, $fail)
    {
        $courseSection = CourseSection::with('term')->find($courseSectionId);
        
        if (!$courseSection) {
            $fail('The selected course section does not exist.');
            return;
        }

        // Check if the term is current or future (basic enrollment timing)
        if ($courseSection->term && $courseSection->term->end_date < now()->toDateString()) {
            $fail('Cannot enroll in a course section from a past term.');
        }
    }

    /**
     * Validate that the student is not already enrolled in this course section
     */
    private function validateNoDuplicateEnrollment($validator)
    {
        $studentId = $this->input('student_id');
        $courseSectionId = $this->input('course_section_id');

        if (!$studentId || !$courseSectionId) {
            return; // Skip if basic validation failed
        }

        $existingEnrollment = Enrollment::where('student_id', $studentId)
            ->where('course_section_id', $courseSectionId)
            ->whereIn('status', ['enrolled', 'waitlisted'])
            ->first();

        if ($existingEnrollment) {
            $validator->errors()->add(
                'course_section_id',
                'Student is already enrolled or waitlisted for this course section.'
            );
        }
    }

    /**
     * Validate capacity and automatically set status based on availability
     */
    private function validateCapacityAndSetStatus($validator)
    {
        $courseSectionId = $this->input('course_section_id');

        if (!$courseSectionId) {
            return; // Skip if basic validation failed
        }

        $courseSection = CourseSection::withCount([
            'enrollments' => function ($query) {
                $query->where('status', 'enrolled');
            }
        ])->find($courseSectionId);

        if (!$courseSection) {
            return; // Skip if course section doesn't exist
        }

        $enrolledCount = $courseSection->enrollments_count;
        $capacity = $courseSection->capacity;
        $availableSpots = $capacity - $enrolledCount;

        // If no status provided, determine automatically
        if (!$this->has('status')) {
            if ($availableSpots > 0) {
                $this->merge(['status' => 'enrolled']);
            } else {
                $this->merge(['status' => 'waitlisted']);
            }
        } else {
            // If status is explicitly provided, validate it makes sense
            $requestedStatus = $this->input('status');
            
            if ($requestedStatus === 'enrolled' && $availableSpots <= 0) {
                $validator->errors()->add(
                    'status',
                    'Cannot enroll student directly - course section is at capacity. Student will be waitlisted.'
                );
                // Override to waitlisted
                $this->merge(['status' => 'waitlisted']);
            }
        }
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
