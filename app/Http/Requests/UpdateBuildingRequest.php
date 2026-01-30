<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Update Building Request',
    description: 'Request body for updating a building. All fields are optional.',
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Science & Engineering Wing'),
        new OA\Property(property: 'address', type: 'string', maxLength: 255, example: '456 College Road'),
    ]
)]
class UpdateBuildingRequest extends FormRequest
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
        $buildingId = $this->route('building')->id;

        return [
            'name' => 'sometimes|required|string|max:255|unique:buildings,name,'.$buildingId,
            'address' => 'nullable|string|max:255',
        ];
    }
}
