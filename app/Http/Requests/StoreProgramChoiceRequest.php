<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramChoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $userRoles = $user->roles()->pluck('name')->toArray();

        // Admin/staff can create program choices for any application
        if (in_array('admin', $userRoles) || in_array('staff', $userRoles)) {
            return true;
        }

        // Students can only create program choices for their own applications
        if (in_array('student', $userRoles)) {
            $application = $this->route('admission_application');

            return $application && $user->id === $application->student->user_id;
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $application = $this->route('admission_application');

        return [
            'program_id' => 'required|exists:programs,id',
            'preference_order' => [
                'required',
                'integer',
                'min:1',
                'max:10',
                // Ensure preference order is unique within the application
                function ($attribute, $value, $fail) use ($application) {
                    if ($application && $application->programChoices()->where('preference_order', $value)->exists()) {
                        $fail('A program choice with this preference order already exists for this application.');
                    }
                },
            ],
            'status' => 'sometimes|string|in:pending,accepted,rejected',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'program_id.required' => 'The program is required.',
            'program_id.exists' => 'The selected program does not exist.',
            'preference_order.required' => 'The preference order is required.',
            'preference_order.integer' => 'The preference order must be a number.',
            'preference_order.min' => 'The preference order must be at least 1.',
            'preference_order.max' => 'The preference order cannot be greater than 10.',
            'status.in' => 'The status must be one of: pending, accepted, rejected.',
        ];
    }
}
