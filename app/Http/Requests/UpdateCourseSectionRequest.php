<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseSectionRequest extends FormRequest
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
            'course_id' => 'sometimes|exists:courses,id',
            'term_id' => 'sometimes|exists:terms,id',
            'instructor_id' => 'sometimes|nullable|exists:staff,id',
            'room_id' => 'sometimes|nullable|exists:rooms,id',
            'section_number' => 'sometimes|string|max:10',
            'capacity' => 'sometimes|integer|min:1|max:500',
            'schedule_days' => 'sometimes|nullable|string|max:10',
            'start_time' => 'sometimes|nullable|date_format:H:i',
            'end_time' => 'sometimes|nullable|date_format:H:i|after:start_time',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $courseSection = $this->route('course_section');

            $courseId = $this->input('course_id', $courseSection->course_id);
            $termId = $this->input('term_id', $courseSection->term_id);
            $sectionNumber = $this->input('section_number', $courseSection->section_number);

            if ($this->hasAny(['course_id', 'term_id', 'section_number'])) {
                $exists = \App\Models\CourseSection::where('course_id', $courseId)
                    ->where('term_id', $termId)
                    ->where('section_number', $sectionNumber)
                    ->where('id', '!=', $courseSection->id)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('section_number', 'This section number already exists for this course in this term.');
                }
            }
        });
    }
}
