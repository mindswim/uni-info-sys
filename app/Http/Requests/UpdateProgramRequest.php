<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UpdateProgramRequest',
    type: 'object',
    title: 'Update Program Request',
    description: 'Request body for updating an existing program. All fields are optional.',
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Bachelor of Science in Computer Science'),
        new OA\Property(property: 'code', type: 'string', maxLength: 50, example: 'BSc-CS'),
        new OA\Property(property: 'description', type: 'string', example: 'A comprehensive program covering the fundamentals of computer science.'),
        new OA\Property(property: 'faculty_id', type: 'integer', example: 1),
        new OA\Property(property: 'department_id', type: 'integer', example: 1),
        new OA\Property(property: 'duration_years', type: 'integer', minimum: 1, example: 4),
        new OA\Property(property: 'level', type: 'string', enum: ['undergraduate', 'graduate', 'diploma', 'certificate'], example: 'undergraduate'),
        new OA\Property(property: 'status', type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active'),
    ],
)]
class UpdateProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $program = $this->route('program');

        return $this->user()->can('update', $program);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $programId = $this->route('program')->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('programs')->ignore($programId),
            ],
            'description' => 'nullable|string',
            'faculty_id' => 'sometimes|required|exists:faculties,id',
            'department_id' => 'sometimes|required|exists:departments,id',
            'duration_years' => 'sometimes|required|integer|min:1',
            'level' => 'sometimes|required|string|in:undergraduate,graduate,diploma,certificate',
            'status' => 'sometimes|required|string|in:active,inactive,suspended',
        ];
    }
}
