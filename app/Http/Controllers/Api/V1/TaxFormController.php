<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TaxForm1098T;
use App\Services\TaxFormService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxFormController extends Controller
{
    public function __construct(
        private TaxFormService $service
    ) {}

    public function index(Student $student): JsonResponse
    {
        $forms = TaxForm1098T::where('student_id', $student->id)
            ->orderByDesc('tax_year')
            ->get();

        return response()->json(['data' => $forms]);
    }

    public function generate(Request $request, Student $student): JsonResponse
    {
        $request->validate([
            'year' => ['required', 'integer', 'min:2000', 'max:' . date('Y')],
        ]);

        $form = $this->service->calculate1098T($student, $request->year);

        return response()->json([
            'message' => '1098-T form generated successfully.',
            'data' => $form,
        ], 201);
    }

    public function download(TaxForm1098T $taxForm)
    {
        $pdf = $this->service->generatePDF($taxForm);

        return $pdf->download("1098T-{$taxForm->tax_year}-{$taxForm->student_id}.pdf");
    }
}
