<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDegreeRequirementRequest;
use App\Http\Requests\UpdateDegreeRequirementRequest;
use App\Http\Resources\DegreeRequirementResource;
use App\Models\DegreeRequirement;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class DegreeRequirementController extends Controller
{
    public function index(Program $program)
    {
        $this->authorize('viewAny', DegreeRequirement::class);

        $requirements = $program->degreeRequirements()
            ->orderBy('sort_order')
            ->orderBy('category')
            ->paginate(25);

        return DegreeRequirementResource::collection($requirements);
    }

    public function store(StoreDegreeRequirementRequest $request, Program $program): JsonResponse
    {
        $this->authorize('create', DegreeRequirement::class);

        $requirement = $program->degreeRequirements()->create($request->validated());

        return response()->json([
            'message' => 'Degree requirement created.',
            'data' => new DegreeRequirementResource($requirement),
        ], 201);
    }

    public function show(DegreeRequirement $degreeRequirement)
    {
        $this->authorize('view', $degreeRequirement);

        $degreeRequirement->load('program');

        return new DegreeRequirementResource($degreeRequirement);
    }

    public function update(UpdateDegreeRequirementRequest $request, DegreeRequirement $degreeRequirement): JsonResponse
    {
        $this->authorize('update', $degreeRequirement);

        $degreeRequirement->update($request->validated());

        return response()->json([
            'message' => 'Degree requirement updated.',
            'data' => new DegreeRequirementResource($degreeRequirement),
        ]);
    }

    public function destroy(DegreeRequirement $degreeRequirement): JsonResponse
    {
        $this->authorize('delete', $degreeRequirement);

        $degreeRequirement->delete();

        return response()->json(null, 204);
    }
}
