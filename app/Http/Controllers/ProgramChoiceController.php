<?php
namespace App\Http\Controllers;

use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProgramChoiceController extends Controller
{
    public function index(AdmissionApplication $application): JsonResponse
    {
        $programChoices = $application->programChoices()->with('program')->get();
        return response()->json($programChoices);
    }

    public function store(Request $request, AdmissionApplication $application): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'preference_order' => 'required|integer|min:1',
            'status' => 'required|string|in:pending,accepted,rejected',
        ]);

        // Check if preference order already exists
        if ($application->programChoices()->where('preference_order', $validated['preference_order'])->exists()) {
            return response()->json([
                'message' => 'Preference order already exists'
            ], 422);
        }

        $programChoice = $application->programChoices()->create($validated);
        return response()->json($programChoice, 201);
    }

    public function update(Request $request, AdmissionApplication $application, ProgramChoice $programChoice): JsonResponse
    {
        // Ensure the program choice belongs to the application
        if ($programChoice->application_id !== $application->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'preference_order' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string|in:pending,accepted,rejected',
        ]);

        if (isset($validated['preference_order'])) {
            // Check if new preference order already exists
            $exists = $application->programChoices()
                ->where('preference_order', $validated['preference_order'])
                ->where('id', '!=', $programChoice->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Preference order already exists'
                ], 422);
            }
        }

        $programChoice->update($validated);
        return response()->json($programChoice->fresh());
    }

    public function destroy(AdmissionApplication $application, ProgramChoice $programChoice): JsonResponse
    {
        // Ensure the program choice belongs to the application
        if ($programChoice->application_id !== $application->id) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $programChoice->delete();
        return response()->json(null, 204);
    }
}
