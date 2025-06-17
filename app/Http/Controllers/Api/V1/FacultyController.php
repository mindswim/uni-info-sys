<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FacultyResource;
use App\Models\Faculty;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Faculties", description="Faculty management endpoints")
 */
class FacultyController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/faculties",
     *     summary="List all faculties",
     *     description="Retrieve a paginated list of all faculties with their departments",
     *     operationId="getFaculties",
     *     tags={"Faculties"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved faculties",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Faculty of Science"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(
     *                         property="departments",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer"),
     *                             @OA\Property(property="name", type="string")
     *                         )
     *                     )
     *                 )
     *             ),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index()
    {
        $this->authorize('viewAny', Faculty::class);

        return FacultyResource::collection(Faculty::with('departments')->paginate(10));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/faculties",
     *     summary="Create a new faculty",
     *     description="Store a newly created faculty",
     *     operationId="createFaculty",
     *     tags={"Faculties"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Faculty data",
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Faculty of Science", maxLength=255)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Faculty created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Faculty of Science"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('create', Faculty::class);

        $validated = $request->validate([
            'name' => 'required|string|unique:faculties|max:255'
        ]);
        
        $faculty = Faculty::create($validated);
        
        return new FacultyResource($faculty);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/faculties/{id}",
     *     summary="Get a specific faculty",
     *     description="Display the specified faculty with its departments",
     *     operationId="getFaculty",
     *     tags={"Faculties"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Faculty ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved faculty",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Faculty of Science"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="departments",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Faculty not found")
     * )
     */
    public function show(Faculty $faculty)
    {
        $this->authorize('view', $faculty);

        return new FacultyResource($faculty->load('departments'));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/faculties/{id}",
     *     summary="Update a faculty",
     *     description="Update the specified faculty",
     *     operationId="updateFaculty",
     *     tags={"Faculties"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Faculty ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Faculty data to update",
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Faculty of Applied Science", maxLength=255)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Faculty updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Faculty of Applied Science"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Faculty not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, Faculty $faculty)
    {
        $this->authorize('update', $faculty);

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:faculties,name,'.$faculty->id.'|max:255'
        ]);
        
        $faculty->update($validated);

        return new FacultyResource($faculty);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/faculties/{id}",
     *     summary="Delete a faculty",
     *     description="Remove the specified faculty from storage",
     *     operationId="deleteFaculty",
     *     tags={"Faculties"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Faculty ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Faculty deleted successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Faculty not found")
     * )
     */
    public function destroy(Faculty $faculty)
    {
        $this->authorize('delete', $faculty);

        $faculty->delete();

        return response()->noContent();
    }
}
