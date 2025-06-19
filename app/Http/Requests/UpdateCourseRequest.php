<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UpdateCourseRequest',
    type: 'object',
    title: 'Update Course Request',
    description: 'Request body for updating an existing course. All fields are optional.',
    properties: [
        new OA\Property(property: 'course_code', type: 'string', maxLength: 20, example: 'CS101'),
        new OA\Property(property: 'title', type: 'string', maxLength: 255, example: 'Introduction to Computer Science'),
        new OA\Property(property: 'description', type: 'string', example: 'Basic concepts and principles of computer science.'),
        new OA\Property(property: 'credits', type: 'integer', minimum: 0, example: 3),
        new OA\Property(property: 'department_id', type: 'integer', example: 1),
        new OA\Property(
            property: 'prerequisites',
            type: 'array',
            items: new OA\Items(type: 'integer'),
            description: 'Array of prerequisite course IDs',
            example: [1, 2]
        ),
    ],
)]
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
