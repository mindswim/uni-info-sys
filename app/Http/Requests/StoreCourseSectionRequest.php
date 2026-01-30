<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Store Course Section Request',
    description: 'Request body for creating a new course section.',
    required: ['course_id', 'term_id', 'instructor_id', 'room_id', 'capacity', 'schedule_days', 'start_time', 'end_time'],
    properties: [
        new OA\Property(property: 'course_id', type: 'integer', example: 1),
        new OA\Property(property: 'term_id', type: 'integer', example: 1),
        new OA\Property(property: 'instructor_id', type: 'integer', example: 1),
        new OA\Property(property: 'room_id', type: 'integer', example: 1),
        new OA\Property(property: 'capacity', type: 'integer', minimum: 1, example: 50),
        new OA\Property(
            property: 'schedule_days',
            type: 'array',
            items: new OA\Items(type: 'string', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            example: ['Monday', 'Wednesday']
        ),
        new OA\Property(property: 'start_time', type: 'string', format: 'time', example: '09:00'),
        new OA\Property(property: 'end_time', type: 'string', format: 'time', example: '10:30'),
    ]
)]
class StoreCourseSectionRequest extends FormRequest
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
            'course_id' => 'required|exists:courses,id',
            'term_id' => 'required|exists:terms,id',
            'instructor_id' => 'required|exists:staff,id',
            'room_id' => 'required|exists:rooms,id',
            'section_number' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'schedule_days' => 'required|array',
            'schedule_days.*' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ];
    }
}
