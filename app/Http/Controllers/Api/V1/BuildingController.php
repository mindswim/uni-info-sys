<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Http\Resources\BuildingResource;
use App\Http\Requests\StoreBuildingRequest;
use App\Http\Requests\UpdateBuildingRequest;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Building::class);

        return BuildingResource::collection(Building::with('rooms')->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBuildingRequest $request)
    {
        $this->authorize('create', Building::class);

        $building = Building::create($request->validated());
        return new BuildingResource($building);
    }

    /**
     * Display the specified resource.
     */
    public function show(Building $building)
    {
        $this->authorize('view', $building);

        $building->load('rooms');
        return new BuildingResource($building);
    }

    /**
     * Update the specified resource in storage.
     * @hideFromAPIDocumentation
     */
    public function update(UpdateBuildingRequest $request, Building $building)
    {
        $this->authorize('update', $building);

        $building->update($request->validated());
        return new BuildingResource($building);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Building $building)
    {
        $this->authorize('delete', $building);

        $building->delete();
        return response()->noContent();
    }
}
