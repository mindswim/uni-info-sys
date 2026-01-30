<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EvaluationForm;
use Illuminate\Http\Request;

class EvaluationFormController extends Controller
{
    public function index()
    {
        $forms = EvaluationForm::with('questions')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json(['data' => $forms]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:rating_5,rating_10,text,yes_no',
            'questions.*.is_required' => 'boolean',
            'questions.*.sort_order' => 'integer',
        ]);

        $form = EvaluationForm::create([
            ...$request->only(['title', 'description', 'is_active', 'available_from', 'available_until']),
            'created_by' => $request->user()->id,
        ]);

        foreach ($request->questions as $index => $questionData) {
            $form->questions()->create([
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'is_required' => $questionData['is_required'] ?? true,
                'sort_order' => $questionData['sort_order'] ?? $index,
            ]);
        }

        return response()->json(['data' => $form->load('questions')], 201);
    }

    public function show(EvaluationForm $evaluationForm)
    {
        return response()->json(['data' => $evaluationForm->load('questions')]);
    }

    public function update(Request $request, EvaluationForm $evaluationForm)
    {
        $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
        ]);

        $evaluationForm->update($request->only(['title', 'description', 'is_active', 'available_from', 'available_until']));

        return response()->json(['data' => $evaluationForm->fresh()->load('questions')]);
    }

    public function destroy(EvaluationForm $evaluationForm)
    {
        $evaluationForm->delete();

        return response()->noContent();
    }
}
