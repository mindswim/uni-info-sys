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
    required: ['name', 'department_id', 'degree_level', 'duration', 'description', 'requirements', 'capacity'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Bachelor of Science in Computer Science'),
        new OA\Property(property: 'department_id', type: 'integer', example: 1),
        new OA\Property(property: 'degree_level', type: 'string', maxLength: 255, example: 'Bachelors'),
        new OA\Property(property: 'duration', type: 'integer', example: 4),
        new OA\Property(property: 'description', type: 'string', example: 'A comprehensive program covering the fundamentals of computer science.'),
        new OA\Property(property: 'requirements', type: 'string', example: 'High school diploma with mathematics and science.'),
        new OA\Property(property: 'capacity', type: 'integer', example: 100),
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
            'department_id' => 'required|exists:departments,id',
            'degree_level' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'description' => 'required|string',
            'requirements' => 'required|string',
            'capacity' => 'required|integer|min:1',
        ];
    }
}
