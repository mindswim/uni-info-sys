<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Store Staff Request",
    description: "Request body for creating a new staff member.",
    required: ["user", "job_title", "department_id"],
    properties: [
        new OA\Property(property: "user", type: "object", required: ["name", "email", "password"], properties: [
            new OA\Property(property: "name", type: "string", maxLength: 255, example: "Dr. Jane Smith"),
            new OA\Property(property: "email", type: "string", format: "email", maxLength: 255, example: "jane.smith@university.edu"),
            new OA\Property(property: "password", type: "string", format: "password", minLength: 8, example: "password123"),
            new OA\Property(property: "password_confirmation", type: "string", format: "password", minLength: 8, example: "password123"),
        ]),
        new OA\Property(property: "job_title", type: "string", maxLength: 255, example: "Associate Professor"),
        new OA\Property(property: "bio", type: "string", example: "Specializes in artificial intelligence."),
        new OA\Property(property: "office_location", type: "string", maxLength: 255, example: "Tech Building, Room 305"),
        new OA\Property(property: "department_id", type: "integer", example: 1),
    ]
)]
class StoreStaffRequest extends FormRequest
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
            'user.name' => 'required|string|max:255',
            'user.email' => 'required|string|email|max:255|unique:users,email',
            'user.password' => 'required|string|min:8|confirmed',
            'job_title' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'office_location' => 'nullable|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ];
    }
}
