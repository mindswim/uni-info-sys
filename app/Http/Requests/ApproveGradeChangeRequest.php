<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveGradeChangeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled by policy
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'denial_reason' => ['required_if:action,deny', 'string', 'min:10', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'denial_reason.required_if' => 'A reason for denial is required',
            'denial_reason.min' => 'Denial reason must be at least 10 characters',
            'denial_reason.max' => 'Denial reason must not exceed 500 characters',
        ];
    }
}
