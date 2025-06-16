<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        $buildingId = $this->input('building_id', $this->route('room')->building_id);

        return [
            'building_id' => 'sometimes|exists:buildings,id',
            'room_number' => 'sometimes|string|max:50|unique:rooms,room_number,' . $roomId . ',id,building_id,' . $buildingId,
            'capacity' => 'sometimes|integer|min:1|max:1000',
            'type' => 'sometimes|in:classroom,lab,lecture_hall,office,other',
        ];
    }
}
