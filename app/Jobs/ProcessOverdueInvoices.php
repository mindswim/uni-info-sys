<?php

namespace App\Jobs;

use App\Models\Hold;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessOverdueInvoices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $overdueInvoices = Invoice::overdue()->with('student')->get();

        $holdCount = 0;
        $resolvedCount = 0;

        foreach ($overdueInvoices as $invoice) {
            // Update invoice status to overdue
            if ($invoice->status !== 'overdue') {
                $invoice->update(['status' => 'overdue']);
            }

            $student = $invoice->student;
            if (!$student) {
                continue;
            }

            // Check if student already has an active financial hold
            $existingHold = Hold::where('student_id', $student->id)
                ->where('type', Hold::TYPE_FINANCIAL)
                ->active()
                ->first();

            if (!$existingHold) {
                Hold::create([
                    'student_id' => $student->id,
                    'type' => Hold::TYPE_FINANCIAL,
                    'reason' => 'Overdue invoice #' . $invoice->invoice_number,
                    'description' => 'Automatically placed due to overdue balance of $' . number_format($invoice->balance_due, 2),
                    'severity' => Hold::SEVERITY_CRITICAL,
                    'prevents_registration' => true,
                    'prevents_transcript' => true,
                    'prevents_graduation' => true,
                    'placed_by' => null,
                    'department' => 'Financial Services',
                    'placed_at' => now(),
                ]);
                $holdCount++;
            }
        }

        // Resolve financial holds for students who have paid
        $activeFinancialHolds = Hold::where('type', Hold::TYPE_FINANCIAL)
            ->active()
            ->with('student')
            ->get();

        foreach ($activeFinancialHolds as $hold) {
            $hasOverdue = Invoice::where('student_id', $hold->student_id)
                ->overdue()
                ->exists();

            if (!$hasOverdue) {
                $hold->update([
                    'resolved_at' => now(),
                    'resolution_notes' => 'Automatically resolved - no overdue invoices remaining',
                ]);
                $resolvedCount++;
            }
        }

        Log::info('ProcessOverdueInvoices completed', [
            'overdue_invoices' => $overdueInvoices->count(),
            'holds_placed' => $holdCount,
            'holds_resolved' => $resolvedCount,
        ]);
    }
}
