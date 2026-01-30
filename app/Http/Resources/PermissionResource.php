<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'PermissionResource',
    title: 'Permission Resource',
    description: 'Permission resource representation',
    properties: [
        new OA\Property(
            property: 'id',
            type: 'integer',
            description: 'Unique identifier of the permission',
            example: 1
        ),
        new OA\Property(
            property: 'name',
            type: 'string',
            description: 'Name of the permission',
            example: 'view-students'
        ),
        new OA\Property(
            property: 'description',
            type: 'string',
            description: 'Description of the permission',
            example: 'Can view student information',
            nullable: true
        ),
        new OA\Property(
            property: 'created_at',
            type: 'string',
            format: 'date-time',
            description: 'When the permission was created',
            example: '2024-01-15T08:30:00Z'
        ),
        new OA\Property(
            property: 'updated_at',
            type: 'string',
            format: 'date-time',
            description: 'When the permission was last updated',
            example: '2024-01-15T08:30:00Z'
        ),
        new OA\Property(
            property: 'roles',
            type: 'array',
            description: 'Roles that have this permission',
            items: new OA\Items(ref: '#/components/schemas/RoleResource')
        ),
    ]
)]
class PermissionResource extends JsonResource
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
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
        ];
    }
}
