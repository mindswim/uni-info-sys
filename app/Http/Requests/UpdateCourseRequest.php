<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
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
        $courseId = $this->route('course');

        return [
            'title' => 'sometimes|required|string|max:255',
            'course_code' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('courses')->ignore($courseId),
            ],
            'description' => 'nullable|string',
            'credits' => 'sometimes|required|integer|min:0',
            'department_id' => 'sometimes|required|exists:departments,id',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'integer|exists:courses,id',
        ];
    }
}
