<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Update Room Request',
    description: 'Request body for updating a room. All fields are optional.',
    properties: [
        new OA\Property(property: 'building_id', type: 'integer', description: 'The ID of the building this room belongs to.', example: 1),
        new OA\Property(property: 'room_number', type: 'string', maxLength: 20, example: '201B'),
        new OA\Property(property: 'capacity', type: 'integer', minimum: 1, example: 55),
        new OA\Property(property: 'type', type: 'string', enum: ['lecture_hall', 'laboratory', 'seminar_room', 'office'], example: 'laboratory'),
    ]
)]
class UpdateRoomRequest extends FormRequest
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
        $roomId = $this->route('room')->id;

        return [
            'building_id' => 'sometimes|required|exists:buildings,id',
            'room_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('rooms')->where(function ($query) {
                    return $query->where('building_id', $this->building_id ?? $this->route('room')->building_id);
                })->ignore($roomId),
            ],
            'capacity' => 'sometimes|required|integer|min:1',
            'type' => 'sometimes|required|string|in:lecture_hall,laboratory,seminar_room,office',
        ];
    }
}
