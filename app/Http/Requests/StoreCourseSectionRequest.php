<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseSectionRequest extends FormRequest
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
            'course_id' => 'required|exists:courses,id',
            'term_id' => 'required|exists:terms,id',
            'instructor_id' => 'nullable|exists:staff,id',
            'room_id' => 'nullable|exists:rooms,id',
            'section_number' => 'required|string|max:10',
            'capacity' => 'required|integer|min:1|max:500',
            'schedule_days' => 'nullable|string|max:10',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Check for unique section number per course per term
            if ($this->course_id && $this->term_id && $this->section_number) {
                $exists = \App\Models\CourseSection::where('course_id', $this->course_id)
                    ->where('term_id', $this->term_id)
                    ->where('section_number', $this->section_number)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('section_number', 'This section number already exists for this course in this term.');
                }
            }
        });
    }
}
