<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Store Building Request",
    description: "Request body for creating a new building.",
    required: ["name"],
    properties: [
        new OA\Property(property: "name", type: "string", maxLength: 255, example: "Science Wing"),
        new OA\Property(property: "address", type: "string", maxLength: 255, example: "456 College Rd"),
    ]
)]
class StoreBuildingRequest extends FormRequest
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
            'name' => 'required|string|max:255|unique:buildings,name',
            'address' => 'nullable|string|max:255',
        ];
    }
}
