<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProgramChoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $userRoles = $user->roles()->pluck('name')->toArray();
        $programChoice = $this->route('program_choice');

        // Admin/staff can update any program choice
        if (in_array('admin', $userRoles) || in_array('staff', $userRoles)) {
            return true;
        }

        // Students can only update their own program choices if the application is still a draft
        if (in_array('student', $userRoles)) {
            return $programChoice &&
                   $user->id === $programChoice->admissionApplication->student->user_id &&
                   $programChoice->admissionApplication->status === 'draft';
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
        $user = $this->user();
        $userRoles = $user->roles()->pluck('name')->toArray();
        $programChoice = $this->route('program_choice');

        $rules = [
            'preference_order' => [
                'sometimes',
                'integer',
                'min:1',
                'max:10',
                // Ensure preference order is unique within the application (excluding current choice)
                function ($attribute, $value, $fail) use ($programChoice) {
                    if ($programChoice && $programChoice->admissionApplication) {
                        $exists = $programChoice->admissionApplication->programChoices()
                            ->where('preference_order', $value)
                            ->where('id', '!=', $programChoice->id)
                            ->exists();
                        if ($exists) {
                            $fail('A program choice with this preference order already exists for this application.');
                        }
                    }
                },
            ],
        ];

        // Admin/staff can update status, students cannot
        if (in_array('admin', $userRoles) || in_array('staff', $userRoles)) {
            $rules['status'] = 'sometimes|string|in:pending,accepted,rejected';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'preference_order.integer' => 'The preference order must be a number.',
            'preference_order.min' => 'The preference order must be at least 1.',
            'preference_order.max' => 'The preference order cannot be greater than 10.',
            'status.in' => 'The status must be one of: pending, accepted, rejected.',
        ];
    }
}
