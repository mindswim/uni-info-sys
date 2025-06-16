<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
