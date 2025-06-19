<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdmissionApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Get the admission application from route
        $admissionApplication = $this->route('admission_application');
        
        // Check if user can update this specific admission application
        return $this->user()->can('update', $admissionApplication);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $admissionApplication = $this->route('admission_application');
        $user = $this->user();
        
        $rules = [
            'term_id' => [
                'sometimes',
                'integer',
                'exists:terms,id'
            ],
            'comments' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000'
            ]
        ];

        // Only admin/staff can change status and decision-related fields
        $userRoles = $user->roles()->pluck('name')->toArray();
        
        if (in_array('admin', $userRoles) || in_array('staff', $userRoles)) {
            $rules['status'] = [
                'sometimes',
                'string',
                Rule::in(['draft', 'submitted', 'under_review', 'accepted', 'rejected'])
            ];
            $rules['decision_date'] = [
                'sometimes',
                'nullable',
                'date'
            ];
            $rules['decision_status'] = [
                'sometimes',
                'nullable',
                'string',
                'max:255'
            ];
        } else {
            // Students can only update status if application is still in draft
            if ($admissionApplication && $admissionApplication->status === 'draft') {
                $rules['status'] = [
                    'sometimes',
                    'string',
                    Rule::in(['draft', 'submitted'])
                ];
            }
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
            'term_id.exists' => 'The selected term does not exist.',
            'status.in' => 'Invalid status value.',
            'comments.max' => 'Comments cannot exceed 1000 characters.',
            'decision_date.date' => 'Decision date must be a valid date.',
            'decision_status.max' => 'Decision status cannot exceed 255 characters.'
        ];
    }
}
