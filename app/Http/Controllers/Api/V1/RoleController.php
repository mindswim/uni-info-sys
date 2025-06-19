<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Roles",
    description: "API endpoints for viewing system roles (read-only access for administrators)"
)]
class RoleController extends Controller
{
    /**
     * Display a listing of roles
     */
    #[OA\Get(
        path: "/api/v1/roles",
        summary: "Get list of all roles",
        description: "Retrieve a paginated list of all system roles. Only accessible by admin and staff users.",
        security: [["sanctum" => []]],
        tags: ["Roles"],
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
                name: "include_permissions",
                description: "Include permissions associated with each role",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean", default: false)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of roles retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(ref: "#/components/schemas/RoleResource")
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
     * Display a specific role
     */
    #[OA\Get(
        path: "/api/v1/roles/{role}",
        summary: "Get a specific role",
        description: "Retrieve details of a specific role by ID. Only accessible by admin and staff users.",
        security: [["sanctum" => []]],
        tags: ["Roles"],
        parameters: [
            new OA\Parameter(
                name: "role",
                description: "ID of the role",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "include_permissions",
                description: "Include permissions associated with this role",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean", default: false)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Role retrieved successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", ref: "#/components/schemas/RoleResource")
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
                description: "Role not found"
            )
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
}
