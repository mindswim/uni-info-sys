<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTermRequest extends FormRequest
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
        $termId = $this->route('term')->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'academic_year' => [
                'sometimes',
                'required',
                'integer',
                'min:2000',
                Rule::unique('terms')->where(function ($query) {
                    return $query->where('semester', $this->semester);
                })->ignore($termId),
            ],
            'semester' => 'sometimes|required|string|in:Fall,Spring,Summer',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ];
    }
}
