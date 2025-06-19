<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreProgramRequest',
    type: 'object',
    title: 'Store Program Request',
    description: 'Request body for creating a new program.',
    required: ['name', 'code', 'faculty_id', 'department_id', 'duration_years', 'level', 'status'],
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
class StoreProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Program::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:programs,code',
            'description' => 'nullable|string',
            'faculty_id' => 'required|exists:faculties,id',
            'department_id' => 'required|exists:departments,id',
            'duration_years' => 'required|integer|min:1',
            'level' => 'required|string|in:undergraduate,graduate,diploma,certificate',
            'status' => 'required|string|in:active,inactive,suspended',
        ];
    }
}
