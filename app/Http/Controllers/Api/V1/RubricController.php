<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssignmentSubmission;
use App\Models\Rubric;
use App\Models\Staff;
use App\Services\RubricGradingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RubricController extends Controller
{
    public function __construct(
        private RubricGradingService $gradingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Rubric::with('criteria.levels');

        if ($request->boolean('templates_only')) {
            $query->templates();
        }

        $rubrics = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $rubrics->items(),
            'meta' => [
                'current_page' => $rubrics->currentPage(),
                'last_page' => $rubrics->lastPage(),
                'per_page' => $rubrics->perPage(),
                'total' => $rubrics->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_points' => ['required', 'numeric', 'min:0'],
            'is_template' => ['boolean'],
            'criteria' => ['required', 'array', 'min:1'],
            'criteria.*.title' => ['required', 'string', 'max:255'],
            'criteria.*.description' => ['nullable', 'string'],
            'criteria.*.max_points' => ['required', 'numeric', 'min:0'],
            'criteria.*.sort_order' => ['integer'],
            'criteria.*.levels' => ['required', 'array', 'min:1'],
            'criteria.*.levels.*.title' => ['required', 'string', 'max:255'],
            'criteria.*.levels.*.description' => ['nullable', 'string'],
            'criteria.*.levels.*.points' => ['required', 'numeric', 'min:0'],
            'criteria.*.levels.*.sort_order' => ['integer'],
        ]);

        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();

        $rubric = Rubric::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'created_by' => $staff->id,
            'max_points' => $validated['max_points'],
            'is_template' => $validated['is_template'] ?? false,
        ]);

        foreach ($validated['criteria'] as $i => $criteriaData) {
            $criteria = $rubric->criteria()->create([
                'title' => $criteriaData['title'],
                'description' => $criteriaData['description'] ?? null,
                'max_points' => $criteriaData['max_points'],
                'sort_order' => $criteriaData['sort_order'] ?? $i,
            ]);

            foreach ($criteriaData['levels'] as $j => $levelData) {
                $criteria->levels()->create([
                    'title' => $levelData['title'],
                    'description' => $levelData['description'] ?? null,
                    'points' => $levelData['points'],
                    'sort_order' => $levelData['sort_order'] ?? $j,
                ]);
            }
        }

        return response()->json([
            'message' => 'Rubric created successfully.',
            'data' => $rubric->load('criteria.levels'),
        ], 201);
    }

    public function show(Rubric $rubric): JsonResponse
    {
        return response()->json([
            'data' => $rubric->load('criteria.levels'),
        ]);
    }

    public function update(Request $request, Rubric $rubric): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'max_points' => ['sometimes', 'numeric', 'min:0'],
            'is_template' => ['boolean'],
        ]);

        $rubric->update($validated);

        return response()->json([
            'message' => 'Rubric updated successfully.',
            'data' => $rubric->load('criteria.levels'),
        ]);
    }

    public function destroy(Rubric $rubric): JsonResponse
    {
        $rubric->delete();

        return response()->json(null, 204);
    }

    public function templates(): JsonResponse
    {
        $templates = Rubric::templates()->with('criteria.levels')->get();

        return response()->json(['data' => $templates]);
    }

    public function duplicate(Rubric $rubric): JsonResponse
    {
        $clone = $rubric->duplicate();

        return response()->json([
            'message' => 'Rubric duplicated successfully.',
            'data' => $clone,
        ], 201);
    }

    public function scoreSubmission(Request $request, AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        $validated = $request->validate([
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.rubric_criteria_id' => ['required', 'exists:rubric_criteria,id'],
            'scores.*.rubric_level_id' => ['nullable', 'exists:rubric_levels,id'],
            'scores.*.points_awarded' => ['required', 'numeric', 'min:0'],
            'scores.*.feedback' => ['nullable', 'string'],
        ]);

        $submission = $this->gradingService->scoreSubmission($assignmentSubmission, $validated['scores']);

        return response()->json([
            'message' => 'Submission scored successfully.',
            'data' => $submission,
        ]);
    }

    public function rubricResults(AssignmentSubmission $assignmentSubmission): JsonResponse
    {
        $results = $this->gradingService->getRubricResults($assignmentSubmission);

        return response()->json(['data' => $results]);
    }
}
