<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'RoleResource',
    title: 'Role Resource',
    description: 'Role resource representation',
    properties: [
        new OA\Property(
            property: 'id',
            type: 'integer',
            description: 'Unique identifier of the role',
            example: 1
        ),
        new OA\Property(
            property: 'name',
            type: 'string',
            description: 'Name of the role',
            example: 'admin'
        ),
        new OA\Property(
            property: 'description',
            type: 'string',
            description: 'Description of the role',
            example: 'Administrator with full system access',
            nullable: true
        ),
        new OA\Property(
            property: 'created_at',
            type: 'string',
            format: 'date-time',
            description: 'When the role was created',
            example: '2024-01-15T08:30:00Z'
        ),
        new OA\Property(
            property: 'updated_at',
            type: 'string',
            format: 'date-time',
            description: 'When the role was last updated',
            example: '2024-01-15T08:30:00Z'
        ),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            description: 'Permissions associated with this role',
            items: new OA\Items(ref: '#/components/schemas/PermissionResource')
        ),
    ]
)]
class RoleResource extends JsonResource
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
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
        ];
    }
}
