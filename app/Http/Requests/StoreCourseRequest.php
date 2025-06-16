<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'course_code' => 'required|string|max:20|unique:courses,course_code',
            'description' => 'nullable|string',
            'credits' => 'required|integer|min:0',
            'department_id' => 'required|exists:departments,id',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'integer|exists:courses,id',
        ];
    }
}
