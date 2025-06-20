<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "StoreStudentRequest",
    title: "Store Student Request",
    required: ["user_id", "first_name", "last_name", "date_of_birth", "gender", "nationality", "address", "city", "state", "postal_code", "country", "phone", "emergency_contact_name", "emergency_contact_phone"],
    properties: [
        new OA\Property(property: "user_id", type: "integer", description: "The ID of the associated user.", example: 1),
        new OA\Property(property: "first_name", type: "string", example: "John"),
        new OA\Property(property: "last_name", type: "string", example: "Doe"),
        new OA\Property(property: "date_of_birth", type: "string", format: "date", example: "2005-01-15"),
        new OA\Property(property: "gender", type: "string", example: "Male"),
        new OA\Property(property: "nationality", type: "string", example: "American"),
        new OA\Property(property: "address", type: "string", example: "123 Main St"),
        new OA\Property(property: "city", type: "string", example: "Anytown"),
        new OA\Property(property: "state", type: "string", example: "CA"),
        new OA\Property(property: "postal_code", type: "string", example: "12345"),
        new OA\Property(property: "country", type: "string", example: "USA"),
        new OA\Property(property: "phone", type: "string", example: "555-1234"),
        new OA\Property(property: "emergency_contact_name", type: "string", example: "Jane Doe"),
        new OA\Property(property: "emergency_contact_phone", type: "string", example: "555-5678"),
    ]
)]
class StoreStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Set to true if any authenticated user can create a student profile.
        // You can add more specific logic here later (e.g., check for roles).
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
            'user_id' => 'required|exists:users,id|unique:students',
            'student_number' => 'required|unique:students',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string',
            'nationality' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'required|string',
            'phone' => 'required|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_phone' => 'required|string',
        ];
    }
}
