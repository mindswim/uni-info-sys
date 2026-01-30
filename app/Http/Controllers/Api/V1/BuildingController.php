<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Http\Requests\StoreBuildingRequest;
use App\Http\Requests\UpdateBuildingRequest;
use App\Http\Resources\BuildingResource;
use App\Jobs\ProcessBuildingImport;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Buildings',
    description: 'Endpoints for managing university buildings.'
)]
class BuildingController extends Controller
{
    use HandlesCsvImportExport;

    #[OA\Get(
        path: '/api/v1/buildings',
        summary: 'List all buildings',
        tags: ['Buildings'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'A paginated list of buildings.',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/BuildingResource'))
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
        ]
    )]
    public function index()
    {
        $this->authorize('viewAny', Building::class);

        return BuildingResource::collection(Building::with('rooms')->paginate(10));
    }

    #[OA\Post(
        path: '/api/v1/buildings',
        summary: 'Create a new building',
        tags: ['Buildings'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreBuildingRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Building created successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/BuildingResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreBuildingRequest $request)
    {
        $this->authorize('create', Building::class);

        $building = Building::create($request->validated());

        return new BuildingResource($building);
    }

    #[OA\Get(
        path: '/api/v1/buildings/{building}',
        summary: 'Get a single building',
        tags: ['Buildings'],
        parameters: [
            new OA\Parameter(name: 'building', in: 'path', required: true, description: 'ID of the building', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'The requested building.',
                content: new OA\JsonContent(ref: '#/components/schemas/BuildingResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function show(Building $building)
    {
        $this->authorize('view', $building);

        $building->load('rooms');

        return new BuildingResource($building);
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: '/api/v1/buildings/{building}',
        summary: 'Update a building',
        tags: ['Buildings'],
        parameters: [
            new OA\Parameter(name: 'building', in: 'path', required: true, description: 'ID of the building', schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateBuildingRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Building updated successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/BuildingResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateBuildingRequest $request, Building $building)
    {
        $this->authorize('update', $building);

        $building->update($request->validated());

        return new BuildingResource($building);
    }

    #[OA\Delete(
        path: '/api/v1/buildings/{building}',
        summary: 'Delete a building',
        tags: ['Buildings'],
        parameters: [
            new OA\Parameter(name: 'building', in: 'path', required: true, description: 'ID of the building', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Building deleted successfully.'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function destroy(Building $building)
    {
        $this->authorize('delete', $building);

        $building->delete();

        return response()->noContent();
    }

    // CSV Import/Export Methods

    protected function getEntityName(): string
    {
        return 'buildings';
    }

    protected function getImportJobClass(): string
    {
        return ProcessBuildingImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return ['name', 'code', 'address', 'city', 'state', 'postal_code'];
    }

    protected function getSampleCsvData(): array
    {
        return ['Science Building', 'SCI', '123 Campus Dr', 'Boston', 'MA', '02115'];
    }

    protected function getExportData(Request $request): Collection
    {
        return Building::all();
    }

    protected function transformToRow($building): array
    {
        return [
            $building->name,
            $building->code,
            $building->address ?? '',
            $building->city ?? '',
            $building->state ?? '',
            $building->postal_code ?? '',
        ];
    }
}
