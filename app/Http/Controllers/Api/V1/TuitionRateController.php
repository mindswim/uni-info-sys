<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTuitionRateRequest;
use App\Http\Requests\UpdateTuitionRateRequest;
use App\Http\Resources\TuitionRateResource;
use App\Models\TuitionRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TuitionRateController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', TuitionRate::class);

        $query = TuitionRate::with(['program', 'term']);

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }
        if ($request->filled('term_id')) {
            $query->where('term_id', $request->term_id);
        }
        if ($request->filled('student_type')) {
            $query->where('student_type', $request->student_type);
        }
        if ($request->filled('enrollment_status')) {
            $query->where('enrollment_status', $request->enrollment_status);
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        return TuitionRateResource::collection($query->paginate(25));
    }

    public function store(StoreTuitionRateRequest $request): JsonResponse
    {
        $this->authorize('create', TuitionRate::class);

        $rate = TuitionRate::create($request->validated());

        return response()->json([
            'message' => 'Tuition rate created.',
            'data' => new TuitionRateResource($rate->load(['program', 'term'])),
        ], 201);
    }

    public function show(TuitionRate $tuitionRate)
    {
        $this->authorize('view', $tuitionRate);

        return new TuitionRateResource($tuitionRate->load(['program', 'term']));
    }

    public function update(UpdateTuitionRateRequest $request, TuitionRate $tuitionRate): JsonResponse
    {
        $this->authorize('update', $tuitionRate);

        $tuitionRate->update($request->validated());

        return response()->json([
            'message' => 'Tuition rate updated.',
            'data' => new TuitionRateResource($tuitionRate->load(['program', 'term'])),
        ]);
    }

    public function destroy(TuitionRate $tuitionRate): JsonResponse
    {
        $this->authorize('delete', $tuitionRate);

        $tuitionRate->delete();

        return response()->json(null, 204);
    }
}
