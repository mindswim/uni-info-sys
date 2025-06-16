<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'room_number' => 'required|string|max:50|unique:rooms,room_number,NULL,id,building_id,' . $this->building_id,
            'capacity' => 'required|integer|min:1|max:1000',
            'type' => 'required|in:classroom,lab,lecture_hall,office,other',
        ];
    }
}
