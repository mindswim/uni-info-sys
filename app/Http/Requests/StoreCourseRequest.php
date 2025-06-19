<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreCourseRequest',
    type: 'object',
    title: 'Store Course Request',
    description: 'Request body for creating a new course.',
    required: ['course_code', 'title', 'credits', 'department_id'],
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
