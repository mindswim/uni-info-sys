<?php

namespace App\Http\Requests;

use App\Models\CourseSection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
                'exists:students,id',
                Rule::unique('enrollments')->where(function ($query) {
                    return $query->where('course_section_id', $this->course_section_id);
                }),
            ],
            'course_section_id' => 'required|exists:course_sections,id',
            'status' => 'sometimes|required|string|in:enrolled,withdrawn,completed,waitlisted',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $courseSection = CourseSection::find($this->course_section_id);

            if ($courseSection && $courseSection->enrollments()->count() >= $courseSection->capacity) {
                $validator->errors()->add('course_section_id', 'This course section is already full.');
            }
        });
    }
}
