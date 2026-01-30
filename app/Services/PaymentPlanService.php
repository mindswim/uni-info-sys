<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentPlanService
{
    public function createPlan(Invoice $invoice, int $installments, Carbon $startDate): PaymentPlan
    {
        return DB::transaction(function () use ($invoice, $installments, $startDate) {
            $totalAmount = $invoice->balance_due;
            $installmentAmount = round($totalAmount / $installments, 2);

            // Adjust last installment for rounding differences
            $lastInstallmentAmount = $totalAmount - ($installmentAmount * ($installments - 1));

            $plan = PaymentPlan::create([
                'student_id' => $invoice->student_id,
                'invoice_id' => $invoice->id,
                'total_amount' => $totalAmount,
                'number_of_installments' => $installments,
                'installment_amount' => $installmentAmount,
                'start_date' => $startDate,
                'status' => 'active',
            ]);

            for ($i = 1; $i <= $installments; $i++) {
                $plan->installments()->create([
                    'installment_number' => $i,
                    'due_date' => $startDate->copy()->addMonths($i - 1),
                    'amount' => $i === $installments ? $lastInstallmentAmount : $installmentAmount,
                    'paid_amount' => 0,
                    'status' => 'pending',
                ]);
            }

            return $plan->load('installments');
        });
    }

    public function processPayment(PaymentPlanInstallment $installment, float $amount): PaymentPlanInstallment
    {
        return DB::transaction(function () use ($installment, $amount) {
            $newPaidAmount = $installment->paid_amount + $amount;
            $installment->update([
                'paid_amount' => $newPaidAmount,
                'status' => $newPaidAmount >= $installment->amount ? 'paid' : 'pending',
                'paid_date' => $newPaidAmount >= $installment->amount ? now() : null,
            ]);

            // Check if all installments are paid
            $plan = $installment->paymentPlan;
            $allPaid = $plan->installments()->where('status', '!=', 'paid')->count() === 0;

            if ($allPaid) {
                $plan->update(['status' => 'completed']);
            }

            return $installment->fresh();
        });
    }
}
