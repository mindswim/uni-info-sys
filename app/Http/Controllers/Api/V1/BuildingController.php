<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBuildingRequest;
use App\Http\Requests\UpdateBuildingRequest;
use App\Http\Resources\BuildingResource;
use App\Models\Building;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Building::query();

        // Include rooms count if requested
        if ($request->boolean('include_rooms_count')) {
            $query->withCount('rooms');
        }

        // Load rooms if requested
        if ($request->boolean('include_rooms')) {
            $query->with('rooms');
        }

        return BuildingResource::collection($query->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBuildingRequest $request)
    {
        $building = Building::create($request->validated());
        return new BuildingResource($building);
    }

    /**
     * Display the specified resource.
     */
    public function show(Building $building, Request $request)
    {
        if ($request->boolean('include_rooms')) {
            $building->load('rooms');
        }
        return new BuildingResource($building);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBuildingRequest $request, Building $building)
    {
        $building->update($request->validated());
        return new BuildingResource($building);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Building $building)
    {
        $building->delete();
        return response()->noContent();
    }
}
