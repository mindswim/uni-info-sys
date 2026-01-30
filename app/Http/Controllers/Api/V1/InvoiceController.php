<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\Term;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    protected BillingService $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Display a listing of invoices
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['student.user', 'term', 'lineItems', 'payments']);

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by term
        if ($request->has('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by overdue
        if ($request->boolean('overdue')) {
            $query->overdue();
        }

        // Filter by unpaid
        if ($request->boolean('unpaid')) {
            $query->unpaid();
        }

        $invoices = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($invoices);
    }

    /**
     * Generate a new invoice for a student's term enrollments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'term_id' => 'required|integer|exists:terms,id',
        ]);

        try {
            $student = Student::findOrFail($validated['student_id']);
            $term = Term::findOrFail($validated['term_id']);

            $invoice = $this->billingService->generateInvoiceForTerm($student, $term);

            return response()->json([
                'message' => 'Invoice generated successfully.',
                'data' => $invoice,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate invoice.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified invoice
     */
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['student.user', 'term', 'lineItems', 'payments']);

        return response()->json([
            'data' => $invoice,
        ]);
    }

    /**
     * Update the specified invoice
     */
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:draft,pending,paid,partially_paid,overdue,cancelled',
            'due_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return response()->json([
            'message' => 'Invoice updated successfully.',
            'data' => $invoice->fresh(['student.user', 'term', 'lineItems', 'payments']),
        ]);
    }

    /**
     * Remove the specified invoice
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        if ($invoice->payments()->completed()->exists()) {
            return response()->json([
                'message' => 'Cannot delete invoice with completed payments.',
            ], 400);
        }

        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully.',
        ]);
    }

    /**
     * Add a discount to an invoice
     */
    public function addDiscount(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
        ]);

        try {
            $lineItem = $this->billingService->addDiscount(
                $invoice,
                $validated['amount'],
                $validated['description']
            );

            return response()->json([
                'message' => 'Discount added successfully.',
                'data' => $invoice->fresh(['lineItems']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add discount.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Add an adjustment to an invoice
     */
    public function addAdjustment(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'is_credit' => 'sometimes|boolean',
        ]);

        try {
            $lineItem = $this->billingService->addAdjustment(
                $invoice,
                $validated['amount'],
                $validated['description'],
                $validated['is_credit'] ?? false
            );

            return response()->json([
                'message' => 'Adjustment added successfully.',
                'data' => $invoice->fresh(['lineItems']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add adjustment.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get student's invoices summary
     */
    public function studentSummary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $summary = $this->billingService->getStudentInvoicesSummary($student);

        return response()->json([
            'data' => $summary,
        ]);
    }
}
