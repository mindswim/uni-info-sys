<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Store Room Request",
    description: "Request body for creating a new room.",
    required: ["building_id", "room_number", "capacity", "type"],
    properties: [
        new OA\Property(property: "building_id", type: "integer", description: "The ID of the building this room belongs to.", example: 1),
        new OA\Property(property: "room_number", type: "string", maxLength: 20, example: "201A"),
        new OA\Property(property: "capacity", type: "integer", minimum: 1, example: 50),
        new OA\Property(property: "type", type: "string", enum: ["lecture_hall", "laboratory", "seminar_room", "office"], example: "seminar_room"),
    ]
)]
class StoreRoomRequest extends FormRequest
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
            'building_id' => 'required|exists:buildings,id',
            'room_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('rooms')->where(function ($query) {
                    return $query->where('building_id', $this->building_id);
                }),
            ],
            'capacity' => 'required|integer|min:1',
            'type' => 'required|string|in:lecture_hall,laboratory,seminar_room,office',
        ];
    }
}
