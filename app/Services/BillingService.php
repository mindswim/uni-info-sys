<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\InvoiceLineItem;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Term;
use App\Models\TuitionRate;
use Illuminate\Support\Facades\DB;

class BillingService
{
    /**
     * Generate invoice for a student's enrollments in a term
     */
    public function generateInvoiceForTerm(Student $student, Term $term): Invoice
    {
        return DB::transaction(function () use ($student, $term) {
            // Get all enrollments for this student in this term
            $enrollments = Enrollment::where('student_id', $student->id)
                ->whereHas('courseSection', function ($query) use ($term) {
                    $query->where('term_id', $term->id);
                })
                ->where('status', 'enrolled')
                ->with('courseSection.course')
                ->get();

            if ($enrollments->isEmpty()) {
                throw new \Exception('No enrollments found for this student in the specified term.');
            }

            // Create invoice
            $invoice = Invoice::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'student_id' => $student->id,
                'term_id' => $term->id,
                'status' => 'pending',
                'invoice_date' => now(),
                'due_date' => now()->addDays(30),
                'subtotal' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'paid_amount' => 0,
                'balance_due' => 0,
            ]);

            // Get tuition rate for student's program
            $program = $student->program;
            $studentType = $student->student_type ?? 'domestic';
            $enrollmentStatus = $enrollments->sum(function ($enrollment) {
                return $enrollment->courseSection->course->credits ?? 0;
            }) >= 12 ? 'full_time' : 'part_time';

            $tuitionRate = TuitionRate::where('program_id', $program->id)
                ->where('term_id', $term->id)
                ->where('student_type', $studentType)
                ->where('enrollment_status', $enrollmentStatus)
                ->where('is_active', true)
                ->current()
                ->first();

            if (!$tuitionRate) {
                // Fallback to program-level rate without term specificity
                $tuitionRate = TuitionRate::where('program_id', $program->id)
                    ->whereNull('term_id')
                    ->where('student_type', $studentType)
                    ->where('enrollment_status', $enrollmentStatus)
                    ->where('is_active', true)
                    ->current()
                    ->first();
            }

            if (!$tuitionRate) {
                throw new \Exception('No tuition rate found for this student and term.');
            }

            // Add tuition line items for each enrollment
            foreach ($enrollments as $enrollment) {
                $credits = $enrollment->courseSection->course->credits ?? 0;
                $tuitionAmount = $credits * $tuitionRate->tuition_per_credit;

                InvoiceLineItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'tuition',
                    'description' => "Tuition - {$enrollment->courseSection->course->code} {$enrollment->courseSection->course->name}",
                    'quantity' => $credits,
                    'unit_price' => $tuitionRate->tuition_per_credit,
                    'amount' => $tuitionAmount,
                    'enrollment_id' => $enrollment->id,
                ]);
            }

            // Add fee line items
            if ($tuitionRate->base_fee > 0) {
                InvoiceLineItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'fee',
                    'description' => 'Base Fee',
                    'quantity' => 1,
                    'unit_price' => $tuitionRate->base_fee,
                    'amount' => $tuitionRate->base_fee,
                ]);
            }

            if ($tuitionRate->technology_fee > 0) {
                InvoiceLineItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'fee',
                    'description' => 'Technology Fee',
                    'quantity' => 1,
                    'unit_price' => $tuitionRate->technology_fee,
                    'amount' => $tuitionRate->technology_fee,
                ]);
            }

            if ($tuitionRate->activity_fee > 0) {
                InvoiceLineItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'fee',
                    'description' => 'Activity Fee',
                    'quantity' => 1,
                    'unit_price' => $tuitionRate->activity_fee,
                    'amount' => $tuitionRate->activity_fee,
                ]);
            }

            if ($tuitionRate->health_fee > 0) {
                InvoiceLineItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'fee',
                    'description' => 'Health Fee',
                    'quantity' => 1,
                    'unit_price' => $tuitionRate->health_fee,
                    'amount' => $tuitionRate->health_fee,
                ]);
            }

            // Recalculate invoice totals
            $invoice->calculateTotal();
            $invoice->save();

            return $invoice->fresh(['lineItems', 'student', 'term']);
        });
    }

    /**
     * Process a payment for an invoice
     */
    public function processPayment(
        Invoice $invoice,
        float $amount,
        string $paymentMethod,
        ?string $transactionId = null,
        ?string $referenceNumber = null
    ): Payment {
        return DB::transaction(function () use ($invoice, $amount, $paymentMethod, $transactionId, $referenceNumber) {
            // Validate payment amount
            if ($amount <= 0) {
                throw new \Exception('Payment amount must be greater than zero.');
            }

            if ($amount > $invoice->balance_due) {
                throw new \Exception('Payment amount exceeds balance due.');
            }

            // Create payment record
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'student_id' => $invoice->student_id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
                'payment_date' => now(),
                'transaction_id' => $transactionId,
                'reference_number' => $referenceNumber,
            ]);

            // Update invoice
            $invoice->paid_amount += $amount;
            $invoice->balance_due = $invoice->total_amount - $invoice->paid_amount;

            // Update invoice status
            if ($invoice->balance_due <= 0) {
                $invoice->status = 'paid';
                $invoice->paid_date = now();
            } elseif ($invoice->paid_amount > 0) {
                $invoice->status = 'partially_paid';
            }

            $invoice->save();

            return $payment->fresh(['invoice', 'student']);
        });
    }

    /**
     * Refund a payment
     */
    public function refundPayment(Payment $payment, ?string $reason = null): Payment
    {
        return DB::transaction(function () use ($payment, $reason) {
            if ($payment->status !== 'completed') {
                throw new \Exception('Only completed payments can be refunded.');
            }

            // Update payment status
            $payment->status = 'refunded';
            $payment->notes = $reason ?? $payment->notes;
            $payment->save();

            // Update invoice
            $invoice = $payment->invoice;
            $invoice->paid_amount -= $payment->amount;
            $invoice->balance_due = $invoice->total_amount - $invoice->paid_amount;

            // Update invoice status
            if ($invoice->paid_amount <= 0) {
                $invoice->status = 'pending';
                $invoice->paid_date = null;
            } else {
                $invoice->status = 'partially_paid';
            }

            $invoice->save();

            return $payment->fresh(['invoice', 'student']);
        });
    }

    /**
     * Add a discount to an invoice
     */
    public function addDiscount(Invoice $invoice, float $amount, string $description): InvoiceLineItem
    {
        return DB::transaction(function () use ($invoice, $amount, $description) {
            if ($amount <= 0) {
                throw new \Exception('Discount amount must be greater than zero.');
            }

            $lineItem = InvoiceLineItem::create([
                'invoice_id' => $invoice->id,
                'item_type' => 'discount',
                'description' => $description,
                'quantity' => 1,
                'unit_price' => -$amount,
                'amount' => -$amount,
            ]);

            $invoice->discount_amount += $amount;
            $invoice->calculateTotal();
            $invoice->save();

            return $lineItem;
        });
    }

    /**
     * Add an adjustment to an invoice
     */
    public function addAdjustment(
        Invoice $invoice,
        float $amount,
        string $description,
        bool $isCredit = false
    ): InvoiceLineItem {
        return DB::transaction(function () use ($invoice, $amount, $description, $isCredit) {
            $finalAmount = $isCredit ? -abs($amount) : abs($amount);

            $lineItem = InvoiceLineItem::create([
                'invoice_id' => $invoice->id,
                'item_type' => 'adjustment',
                'description' => $description,
                'quantity' => 1,
                'unit_price' => $finalAmount,
                'amount' => $finalAmount,
            ]);

            $invoice->calculateTotal();
            $invoice->save();

            return $lineItem;
        });
    }

    /**
     * Generate unique invoice number
     */
    protected function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));

        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get student's outstanding balance across all invoices
     */
    public function getStudentBalance(Student $student): float
    {
        return Invoice::where('student_id', $student->id)
            ->unpaid()
            ->sum('balance_due');
    }

    /**
     * Get invoices summary for a student
     */
    public function getStudentInvoicesSummary(Student $student): array
    {
        $invoices = Invoice::where('student_id', $student->id)->get();

        return [
            'total_invoiced' => $invoices->sum('total_amount'),
            'total_paid' => $invoices->sum('paid_amount'),
            'total_balance' => $invoices->sum('balance_due'),
            'count_pending' => $invoices->where('status', 'pending')->count(),
            'count_partially_paid' => $invoices->where('status', 'partially_paid')->count(),
            'count_paid' => $invoices->where('status', 'paid')->count(),
            'count_overdue' => $invoices->filter->isOverdue()->count(),
        ];
    }
}
