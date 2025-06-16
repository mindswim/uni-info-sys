<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
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
            'user.name' => 'sometimes|required|string|max:255',
            'job_title' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string',
            'office_location' => 'nullable|string|max:255',
            'department_id' => 'sometimes|required|exists:departments,id',
        ];
    }
}
