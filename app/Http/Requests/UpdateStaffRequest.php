<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Update Staff Request',
    description: 'Request body for updating an existing staff member. All fields are optional.',
    properties: [
        new OA\Property(property: 'user', type: 'object', properties: [
            new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Dr. Jane Smith'),
        ]),
        new OA\Property(property: 'job_title', type: 'string', maxLength: 255, example: 'Full Professor'),
        new OA\Property(property: 'bio', type: 'string', example: 'Specializes in artificial intelligence and machine learning.'),
        new OA\Property(property: 'office_location', type: 'string', maxLength: 255, example: 'Tech Building, Room 305A'),
        new OA\Property(property: 'department_id', type: 'integer', example: 1),
    ]
)]
class UpdateStaffRequest extends FormRequest
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
            'user.name' => 'sometimes|required|string|max:255',
            'job_title' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string',
            'office_location' => 'nullable|string|max:255',
            'department_id' => 'sometimes|required|exists:departments,id',
        ];
    }
}
