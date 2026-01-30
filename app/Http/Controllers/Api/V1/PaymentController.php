<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\BillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected BillingService $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Display a listing of payments
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['invoice', 'student.user']);

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by invoice
        if ($request->has('invoice_id')) {
            $query->where('invoice_id', $request->invoice_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $payments = $query->latest('payment_date')->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    /**
     * Process a new payment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|integer|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,check,credit_card,debit_card,bank_transfer,online,financial_aid',
            'transaction_id' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
        ]);

        try {
            $invoice = Invoice::findOrFail($validated['invoice_id']);

            $payment = $this->billingService->processPayment(
                $invoice,
                $validated['amount'],
                $validated['payment_method'],
                $validated['transaction_id'] ?? null,
                $validated['reference_number'] ?? null
            );

            return response()->json([
                'message' => 'Payment processed successfully.',
                'data' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process payment.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified payment
     */
    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['invoice.lineItems', 'student.user']);

        return response()->json([
            'data' => $payment,
        ]);
    }

    /**
     * Update the specified payment
     */
    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,completed,failed,refunded,cancelled',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json([
            'message' => 'Payment updated successfully.',
            'data' => $payment->fresh(['invoice', 'student.user']),
        ]);
    }

    /**
     * Refund a payment
     */
    public function refund(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $refundedPayment = $this->billingService->refundPayment(
                $payment,
                $validated['reason'] ?? null
            );

            return response()->json([
                'message' => 'Payment refunded successfully.',
                'data' => $refundedPayment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to refund payment.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified payment (soft delete)
     */
    public function destroy(Payment $payment): JsonResponse
    {
        if ($payment->status === 'completed') {
            return response()->json([
                'message' => 'Cannot delete completed payment. Please refund instead.',
            ], 400);
        }

        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully.',
        ]);
    }
}
