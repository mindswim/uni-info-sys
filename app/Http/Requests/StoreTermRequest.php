<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreTermRequest',
    type: 'object',
    title: 'Store Term Request',
    description: 'Request body for creating a new academic term.',
    required: ['name', 'academic_year', 'semester', 'start_date', 'end_date'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Fall 2024'),
        new OA\Property(property: 'academic_year', type: 'integer', minimum: 2000, example: 2024),
        new OA\Property(property: 'semester', type: 'string', enum: ['Fall', 'Spring', 'Summer'], example: 'Fall'),
        new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2024-08-26'),
        new OA\Property(property: 'end_date', type: 'string', format: 'date', example: '2024-12-15'),
    ],
)]
class StoreTermRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'academic_year' => [
                'required',
                'integer',
                'min:2000',
                Rule::unique('terms')->where(function ($query) {
                    return $query->where('semester', $this->semester);
                }),
            ],
            'semester' => 'required|string|in:Fall,Spring,Summer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ];
    }
}
