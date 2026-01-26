<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UserResource',
    title: 'User Resource',
    description: 'Represents a user in the system.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', description: 'The unique identifier for the user.', example: 1),
        new OA\Property(property: 'name', type: 'string', description: 'The name of the user.', example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', description: 'The email address of the user.', example: 'john.doe@example.com'),
        new OA\Property(
            property: 'roles',
            type: 'array',
            description: 'Roles assigned to the user',
            items: new OA\Items(ref: '#/components/schemas/RoleResource')
        ),
    ]
)]
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
