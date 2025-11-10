<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\InvoiceLineItem;
use App\Models\Payment;
use App\Models\Program;
use App\Models\Student;
use App\Models\Term;
use App\Models\TuitionRate;
use App\Services\BillingService;
use Illuminate\Database\Seeder;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding billing data...');

        // Get all programs and terms
        $programs = Program::all();
        $terms = Term::all();

        if ($programs->isEmpty() || $terms->isEmpty()) {
            $this->command->warn('No programs or terms found. Run DemoSeeder first.');
            return;
        }

        // Create tuition rates for each program
        $this->command->info('Creating tuition rates...');
        foreach ($programs as $program) {
            foreach ($terms as $term) {
                // Domestic full-time
                TuitionRate::create([
                    'program_id' => $program->id,
                    'term_id' => $term->id,
                    'student_type' => 'domestic',
                    'enrollment_status' => 'full_time',
                    'tuition_per_credit' => 450.00,
                    'base_fee' => 200.00,
                    'technology_fee' => 100.00,
                    'activity_fee' => 50.00,
                    'health_fee' => 150.00,
                    'effective_date' => $term->start_date,
                    'end_date' => $term->end_date,
                    'is_active' => true,
                ]);

                // Domestic part-time
                TuitionRate::create([
                    'program_id' => $program->id,
                    'term_id' => $term->id,
                    'student_type' => 'domestic',
                    'enrollment_status' => 'part_time',
                    'tuition_per_credit' => 475.00,
                    'base_fee' => 150.00,
                    'technology_fee' => 100.00,
                    'activity_fee' => 50.00,
                    'health_fee' => 0.00,
                    'effective_date' => $term->start_date,
                    'end_date' => $term->end_date,
                    'is_active' => true,
                ]);

                // International full-time
                TuitionRate::create([
                    'program_id' => $program->id,
                    'term_id' => $term->id,
                    'student_type' => 'international',
                    'enrollment_status' => 'full_time',
                    'tuition_per_credit' => 950.00,
                    'base_fee' => 300.00,
                    'technology_fee' => 100.00,
                    'activity_fee' => 50.00,
                    'health_fee' => 250.00,
                    'effective_date' => $term->start_date,
                    'end_date' => $term->end_date,
                    'is_active' => true,
                ]);

                // International part-time
                TuitionRate::create([
                    'program_id' => $program->id,
                    'term_id' => $term->id,
                    'student_type' => 'international',
                    'enrollment_status' => 'part_time',
                    'tuition_per_credit' => 975.00,
                    'base_fee' => 250.00,
                    'technology_fee' => 100.00,
                    'activity_fee' => 50.00,
                    'health_fee' => 0.00,
                    'effective_date' => $term->start_date,
                    'end_date' => $term->end_date,
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('Created ' . TuitionRate::count() . ' tuition rates');

        // Generate invoices for students with enrollments
        $this->command->info('Generating invoices...');
        $billingService = app(BillingService::class);
        $studentsWithEnrollments = Student::whereHas('enrollments')->with('enrollments.courseSection')->get();

        $invoiceCount = 0;
        foreach ($studentsWithEnrollments as $student) {
            // Group enrollments by term
            $enrollmentsByTerm = $student->enrollments->groupBy('courseSection.term_id');

            foreach ($enrollmentsByTerm as $termId => $termEnrollments) {
                $term = Term::find($termId);
                if (!$term) continue;

                // Check if invoice already exists for this student/term
                $existingInvoice = Invoice::where('student_id', $student->id)
                    ->where('term_id', $term->id)
                    ->first();

                if ($existingInvoice) continue;

                try {
                    $billingService->generateInvoiceForTerm($student, $term);
                    $invoiceCount++;
                } catch (\Exception $e) {
                    $this->command->warn("Could not generate invoice for student {$student->id}: {$e->getMessage()}");
                }
            }
        }

        $this->command->info("Generated {$invoiceCount} invoices");

        // Create some payments for invoices
        $this->command->info('Creating sample payments...');
        $invoices = Invoice::where('status', 'pending')->take(5)->get();
        $paymentCount = 0;

        foreach ($invoices as $invoice) {
            try {
                // Pay 50% of the invoice
                $paymentAmount = $invoice->balance_due * 0.5;

                $billingService->processPayment(
                    $invoice,
                    $paymentAmount,
                    'credit_card',
                    'TXN-' . strtoupper(substr(md5(uniqid()), 0, 10)),
                    'DEMO-' . rand(1000, 9999)
                );

                $paymentCount++;
            } catch (\Exception $e) {
                $this->command->warn("Could not process payment for invoice {$invoice->id}: {$e->getMessage()}");
            }
        }

        $this->command->info("Created {$paymentCount} payments");

        $this->command->info('Billing data seeded successfully!');
        $this->command->info('Summary:');
        $this->command->info('- Tuition Rates: ' . TuitionRate::count());
        $this->command->info('- Invoices: ' . Invoice::count());
        $this->command->info('- Invoice Line Items: ' . InvoiceLineItem::count());
        $this->command->info('- Payments: ' . Payment::count());
    }
}
