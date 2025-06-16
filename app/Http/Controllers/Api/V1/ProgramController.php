<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use App\Http\Resources\ProgramResource;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Program::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return ProgramResource::collection($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:programs',
            'department_id' => 'required|exists:departments,id',
            'degree_level' => 'required|string|max:255',
            'duration' => 'required|integer',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'capacity' => 'required|integer',
        ]);

        $program = Program::create($validated);

        return new ProgramResource($program);
    }

    /**
     * Display the specified resource.
     */
    public function show(Program $program)
    {
        return new ProgramResource($program->load('department'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:programs,name,'.$program->id,
            'department_id' => 'sometimes|exists:departments,id',
            'degree_level' => 'sometimes|string|max:255',
            'duration' => 'sometimes|integer',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'capacity' => 'sometimes|integer',
        ]);

        $program->update($validated);

        return new ProgramResource($program);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Program $program)
    {
        $program->delete();

        return response()->noContent();
    }
}
