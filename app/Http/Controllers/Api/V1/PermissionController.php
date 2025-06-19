<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Permissions",
    description: "API endpoints for viewing system permissions (read-only access for administrators)"
)]
class PermissionController extends Controller
{
    /**
     * Display a listing of permissions
     */
    #[OA\Get(
        path: "/api/v1/permissions",
        summary: "Get list of all permissions",
        description: "Retrieve a paginated list of all system permissions. Only accessible by admin and staff users.",
        security: [["sanctum" => []]],
        tags: ["Permissions"],
        parameters: [
            new OA\Parameter(
                name: "page",
                description: "Page number for pagination",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer", minimum: 1, default: 1)
            ),
            new OA\Parameter(
                name: "per_page",
                description: "Number of items per page",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer", minimum: 1, maximum: 100, default: 15)
            ),
            new OA\Parameter(
                name: "include_roles",
                description: "Include roles associated with each permission",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean", default: false)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of permissions retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(ref: "#/components/schemas/PermissionResource")
                        ),
                        new OA\Property(
                            property: "links",
                            type: "object",
                            description: "Pagination links"
                        ),
                        new OA\Property(
                            property: "meta",
                            type: "object",
                            description: "Pagination metadata"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated"
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions"
            )
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Permission::class);

        $query = Permission::query();

        // Include roles if requested
        if ($request->boolean('include_roles')) {
            $query->with('roles');
        }

        // Order by name for consistent results
        $query->orderBy('name');

        $permissions = $query->paginate($request->get('per_page', 15));

        return PermissionResource::collection($permissions);
    }

    /**
     * Display a specific permission
     */
    #[OA\Get(
        path: "/api/v1/permissions/{permission}",
        summary: "Get a specific permission",
        description: "Retrieve details of a specific permission by ID. Only accessible by admin and staff users.",
        security: [["sanctum" => []]],
        tags: ["Permissions"],
        parameters: [
            new OA\Parameter(
                name: "permission",
                description: "ID of the permission",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "include_roles",
                description: "Include roles associated with this permission",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean", default: false)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Permission retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/PermissionResource")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Unauthenticated"
            ),
            new OA\Response(
                response: 403,
                description: "Forbidden - insufficient permissions"
            ),
            new OA\Response(
                response: 404,
                description: "Permission not found"
            )
        ]
    )]
    public function show(Request $request, Permission $permission): JsonResponse
    {
        $this->authorize('view', $permission);

        // Include roles if requested
        if ($request->boolean('include_roles')) {
            $permission->load('roles');
        }

        return response()->json([
            'data' => new PermissionResource($permission),
        ]);
    }
}
