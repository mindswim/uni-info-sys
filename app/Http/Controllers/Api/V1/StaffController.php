<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use App\Http\Resources\StaffResource;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Staff",
    description: "Endpoints for managing staff members."
)]
class StaffController extends Controller
{
    #[OA\Get(
        path: "/api/v1/staff",
        summary: "List all staff members",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "department_id", in: "query", required: false, description: "Filter by department ID", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "position", in: "query", required: false, description: "Filter by job title", schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "A paginated list of staff members.",
                content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/StaffResource"))
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
        ]
    )]
    public function index(Request $request)
    {
        $this->authorize('viewAny', Staff::class);

        $query = Staff::with(['user', 'department']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        return StaffResource::collection($query->paginate(10));
    }

    #[OA\Post(
        path: "/api/v1/staff",
        summary: "Create a new staff member",
        tags: ["Staff"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/StoreStaffRequest")
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Staff member created successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/StaffResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(StoreStaffRequest $request)
    {
        $this->authorize('create', Staff::class);

        $validated = $request->validated();

        $staff = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['user']['name'],
                'email' => $validated['user']['email'],
                'password' => Hash::make($validated['user']['password']),
            ]);

            return Staff::create([
                'user_id' => $user->id,
                'department_id' => $validated['department_id'],
                'job_title' => $validated['job_title'],
                'bio' => $validated['bio'] ?? null,
                'office_location' => $validated['office_location'] ?? null,
            ]);
        });

        $staff->load(['user', 'department']);

        return new StaffResource($staff);
    }

    #[OA\Get(
        path: "/api/v1/staff/{staff}",
        summary: "Get a single staff member",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "staff", in: "path", required: true, description: "ID of the staff member", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "The requested staff member.",
                content: new OA\JsonContent(ref: "#/components/schemas/StaffResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(Staff $staff)
    {
        $this->authorize('view', $staff);

        $staff->load(['user', 'department']);
        return new StaffResource($staff);
    }

    #[OA\Put(
        path: "/api/v1/staff/{staff}",
        summary: "Update a staff member",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "staff", in: "path", required: true, description: "ID of the staff member", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/UpdateStaffRequest")
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Staff member updated successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/StaffResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        $this->authorize('update', $staff);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $staff) {
            if (isset($validated['user'])) {
                $staff->user->update($validated['user']);
            }
            
            $staff->update($validated);
        });

        $staff->load(['user', 'department']);
        return new StaffResource($staff);
    }

    #[OA\Delete(
        path: "/api/v1/staff/{staff}",
        summary: "Delete a staff member",
        tags: ["Staff"],
        parameters: [
            new OA\Parameter(name: "staff", in: "path", required: true, description: "ID of the staff member", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Staff member deleted successfully."),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(Staff $staff)
    {
        $this->authorize('delete', $staff);

        DB::transaction(function () use ($staff) {
            // Workaround for failing cascade delete in test environment
            $user = $staff->user;
            $staff->delete();
            if ($user) {
                $user->delete();
            }
        });

        return response()->noContent();
    }
}
