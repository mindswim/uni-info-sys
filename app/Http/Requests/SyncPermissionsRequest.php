<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncPermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by the policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'permissions' => 'required|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'permissions.required' => 'The permissions array is required.',
            'permissions.array' => 'The permissions must be an array.',
            'permissions.*.integer' => 'Each permission ID must be an integer.',
            'permissions.*.exists' => 'One or more permission IDs do not exist.',
        ];
    }
}
