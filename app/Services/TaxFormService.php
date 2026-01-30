<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\TaxForm1098T;
use Barryvdh\DomPDF\Facade\Pdf;

class TaxFormService
{
    public function calculate1098T(Student $student, int $year): TaxForm1098T
    {
        $startDate = "{$year}-01-01";
        $endDate = "{$year}-12-31";

        $qualifiedTuition = Invoice::where('student_id', $student->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        $scholarships = 0;
        if (method_exists($student, 'financialAidPackages')) {
            $scholarships = $student->financialAidPackages()
                ->whereHas('aidAwards', function ($q) use ($year) {
                    $q->whereYear('created_at', $year);
                })
                ->get()
                ->flatMap->aidAwards
                ->sum('amount') ?? 0;
        }

        return TaxForm1098T::updateOrCreate(
            ['student_id' => $student->id, 'tax_year' => $year],
            [
                'qualified_tuition' => $qualifiedTuition,
                'scholarships_grants' => $scholarships,
                'adjustments' => 0,
                'billing_method' => 'amounts_billed',
                'institution_ein' => '12-3456789',
                'institution_name' => config('app.name', 'University'),
                'institution_address' => '123 University Ave, College Town, ST 12345',
                'student_ssn_last4' => '0000',
                'generated_at' => now(),
                'status' => 'draft',
            ]
        );
    }

    public function generatePDF(TaxForm1098T $form): \Barryvdh\DomPDF\PDF
    {
        $form->load('student.user');

        return Pdf::loadView('tax.1098t', ['form' => $form]);
    }
}
