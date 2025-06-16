<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::with('department.faculty')->paginate(10);

        return Inertia::render('Programs/Index', [
            'programs' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'degree_level' => 'required|string',
            'duration' => 'required|integer',
            'description' => 'required|string',
            'requirements' => 'required|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $program = Program::create($validated);

        return redirect()->route('programs.index')->with('success', 'Program created successfully.');
    }

    public function show(Program $program)
    {
        $program->load(['programChoices', 'department.faculty']);

        return Inertia::render('Programs/Show', [
            'program' => $program,
        ]);
    }

    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'department_id' => 'sometimes|exists:departments,id',
            'degree_level' => 'sometimes|string',
            'duration' => 'sometimes|integer',
            'description' => 'sometimes|string',
            'requirements' => 'sometimes|string',
            'capacity' => 'sometimes|integer|min:1',
        ]);

        $program->update($validated);

        return redirect()->route('programs.show', $program->id)->with('success', 'Program updated successfully.');
    }

    public function destroy(Program $program)
    {
        $program->delete();

        return redirect()->route('programs.index')->with('success', 'Program deleted successfully.');
    }
}