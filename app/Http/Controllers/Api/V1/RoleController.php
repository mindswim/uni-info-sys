<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\SyncPermissionsRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Roles',
    description: 'API endpoints for managing system roles (admin access required)'
)]
class RoleController extends Controller
{
    /**
     * Display a listing of roles
     */
    #[OA\Get(
        path: '/api/v1/roles',
        summary: 'Get list of all roles',
        description: 'Retrieve a paginated list of all system roles. Only accessible by users with roles.manage permission.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'page',
                description: 'Page number for pagination',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)
            ),
            new OA\Parameter(
                name: 'per_page',
                description: 'Number of items per page',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 15)
            ),
            new OA\Parameter(
                name: 'include_permissions',
                description: 'Include permissions associated with each role',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'boolean', default: false)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of roles retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(ref: '#/components/schemas/RoleResource')
                        ),
                        new OA\Property(
                            property: 'links',
                            type: 'object',
                            description: 'Pagination links'
                        ),
                        new OA\Property(
                            property: 'meta',
                            type: 'object',
                            description: 'Pagination metadata'
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - insufficient permissions'
            ),
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Role::class);

        $query = Role::query();

        // Include permissions if requested
        if ($request->boolean('include_permissions')) {
            $query->with('permissions');
        }

        // Order by name for consistent results
        $query->orderBy('name');

        $roles = $query->paginate($request->get('per_page', 15));

        return RoleResource::collection($roles);
    }

    /**
     * Store a newly created role
     */
    #[OA\Post(
        path: '/api/v1/roles',
        summary: 'Create a new role',
        description: 'Create a new system role. Only accessible by users with roles.manage permission.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Role data',
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255, description: 'Unique role name', example: 'Content Manager'),
                    new OA\Property(property: 'description', type: 'string', maxLength: 1000, description: 'Role description', example: 'Can manage content and moderate posts', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Role created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', ref: '#/components/schemas/RoleResource'),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - insufficient permissions'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            ),
        ]
    )]
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = Role::create($request->validated());

        return response()->json([
            'data' => new RoleResource($role),
        ], 201);
    }

    /**
     * Display a specific role
     */
    #[OA\Get(
        path: '/api/v1/roles/{role}',
        summary: 'Get a specific role',
        description: 'Retrieve details of a specific role by ID. Only accessible by users with roles.manage permission.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                description: 'ID of the role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'include_permissions',
                description: 'Include permissions associated with this role',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'boolean', default: false)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Role retrieved successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', ref: '#/components/schemas/RoleResource'),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - insufficient permissions'
            ),
            new OA\Response(
                response: 404,
                description: 'Role not found'
            ),
        ]
    )]
    public function show(Request $request, Role $role): JsonResponse
    {
        $this->authorize('view', $role);

        // Include permissions if requested
        if ($request->boolean('include_permissions')) {
            $role->load('permissions');
        }

        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }

    /**
     * Update a specific role
     */
    #[OA\Put(
        path: '/api/v1/roles/{role}',
        summary: 'Update a role',
        description: 'Update an existing role. Only accessible by users with roles.manage permission.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                description: 'ID of the role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Updated role data',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255, description: 'Unique role name', example: 'Content Manager'),
                    new OA\Property(property: 'description', type: 'string', maxLength: 1000, description: 'Role description', example: 'Can manage content and moderate posts', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Role updated successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', ref: '#/components/schemas/RoleResource'),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - insufficient permissions'
            ),
            new OA\Response(
                response: 404,
                description: 'Role not found'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            ),
        ]
    )]
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $role->update($request->validated());

        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }

    /**
     * Remove a specific role
     */
    #[OA\Delete(
        path: '/api/v1/roles/{role}',
        summary: 'Delete a role',
        description: 'Delete an existing role. Only accessible by users with roles.manage permission.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                description: 'ID of the role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 204,
                description: 'Role deleted successfully'
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - insufficient permissions'
            ),
            new OA\Response(
                response: 404,
                description: 'Role not found'
            ),
        ]
    )]
    public function destroy(Role $role): JsonResponse
    {
        $this->authorize('delete', $role);

        $role->delete();

        return response()->json(null, 204);
    }

    /**
     * Sync permissions to a role
     */
    #[OA\Post(
        path: '/api/v1/roles/{role}/permissions',
        summary: 'Sync permissions to a role',
        description: 'Synchronize the permissions assigned to a role. This will replace all existing permissions with the provided list. Only accessible by users with roles.manage permission.',
        security: [['sanctum' => []]],
        tags: ['Roles'],
        parameters: [
            new OA\Parameter(
                name: 'role',
                description: 'ID of the role',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: 'Array of permission IDs to assign to the role',
            content: new OA\JsonContent(
                required: ['permissions'],
                properties: [
                    new OA\Property(
                        property: 'permissions',
                        type: 'array',
                        description: 'Array of permission IDs',
                        items: new OA\Items(type: 'integer', example: 1)
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Permissions synced successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', ref: '#/components/schemas/RoleResource'),
                        new OA\Property(property: 'message', type: 'string', example: 'Permissions synced successfully'),
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthenticated'
            ),
            new OA\Response(
                response: 403,
                description: 'Forbidden - insufficient permissions'
            ),
            new OA\Response(
                response: 404,
                description: 'Role not found'
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error'
            ),
        ]
    )]
    public function syncPermissions(SyncPermissionsRequest $request, Role $role): JsonResponse
    {
        $this->authorize('syncPermissions', $role);

        $role->permissions()->sync($request->validated()['permissions']);
        $role->load('permissions');

        return response()->json([
            'data' => new RoleResource($role),
            'message' => 'Permissions synced successfully',
        ]);
    }
}
