<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Update Course Section Request",
    description: "Request body for updating a course section. All fields are optional.",
    properties: [
        new OA\Property(property: "course_id", type: "integer", example: 1),
        new OA\Property(property: "term_id", type: "integer", example: 1),
        new OA\Property(property: "instructor_id", type: "integer", example: 1),
        new OA\Property(property: "room_id", type: "integer", example: 1),
        new OA\Property(property: "capacity", type: "integer", minimum: 1, example: 55),
        new OA\Property(
            property: "schedule_days",
            type: "array",
            items: new OA\Items(type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
            example: ["Tuesday", "Thursday"]
        ),
        new OA\Property(property: "start_time", type: "string", format: "time", example: "13:00"),
        new OA\Property(property: "end_time", type: "string", format: "time", example: "14:30"),
    ]
)]
class UpdateCourseSectionRequest extends FormRequest
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
            'course_id' => 'sometimes|required|exists:courses,id',
            'term_id' => 'sometimes|required|exists:terms,id',
            'instructor_id' => 'sometimes|required|exists:staff,id',
            'room_id' => 'sometimes|required|exists:rooms,id',
            'capacity' => 'sometimes|required|integer|min:1',
            'schedule_days' => 'sometimes|required|array',
            'schedule_days.*' => 'sometimes|required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
        ];
    }
}
