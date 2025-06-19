<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UpdateTermRequest',
    type: 'object',
    title: 'Update Term Request',
    description: 'Request body for updating an existing academic term. All fields are optional.',
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Fall 2024'),
        new OA\Property(property: 'academic_year', type: 'integer', minimum: 2000, example: 2024),
        new OA\Property(property: 'semester', type: 'string', enum: ['Fall', 'Spring', 'Summer'], example: 'Fall'),
        new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2024-08-26'),
        new OA\Property(property: 'end_date', type: 'string', format: 'date', example: '2024-12-15'),
    ],
)]
class UpdateTermRequest extends FormRequest
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
        $termId = $this->route('term')->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'academic_year' => [
                'sometimes',
                'required',
                'integer',
                'min:2000',
                Rule::unique('terms')->where(function ($query) {
                    return $query->where('semester', $this->semester);
                })->ignore($termId),
            ],
            'semester' => 'sometimes|required|string|in:Fall,Spring,Summer',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ];
    }
}
