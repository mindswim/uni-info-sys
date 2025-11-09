<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmissionApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if user can create admission applications
        return $this->user()->can('create', \App\Models\AdmissionApplication::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => [
                'required',
                'integer',
                'exists:students,id',
                // Ensure user can only create applications for their own student record (unless admin/staff)
                function ($attribute, $value, $fail) {
                    $user = $this->user();
                    $userRoles = $user->roles()->pluck('name')->toArray();
                    
                    if (!in_array('admin', $userRoles) && !in_array('staff', $userRoles)) {
                        $userStudent = $user->student;
                        if (!$userStudent || $userStudent->id != $value) {
                            $fail('You can only create applications for your own student record.');
                        }
                    }
                }
            ],
            'term_id' => [
                'required',
                'integer',
                'exists:terms,id'
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'enrolled'])
            ],
            'application_date' => [
                'sometimes',
                'date'
            ],
            'comments' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000'
            ]
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
            'student_id.required' => 'Student ID is required.',
            'student_id.exists' => 'The selected student does not exist.',
            'term_id.required' => 'Term ID is required.',
            'term_id.exists' => 'The selected term does not exist.',
            'status.in' => 'Status must be one of: draft, submitted, under_review, accepted, rejected, waitlisted, enrolled.',
            'comments.max' => 'Comments cannot exceed 1000 characters.'
        ];
    }
}
