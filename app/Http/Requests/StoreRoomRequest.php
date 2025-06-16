<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
