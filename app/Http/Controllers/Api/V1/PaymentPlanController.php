<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Services\PaymentPlanService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PaymentPlanController extends Controller
{
    private PaymentPlanService $service;

    public function __construct(PaymentPlanService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $query = PaymentPlan::with(['student', 'invoice', 'installments']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        return response()->json(['data' => $query->paginate(15)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'number_of_installments' => 'required|integer|in:3,6,9,12',
            'start_date' => 'required|date|after_or_equal:today',
        ]);

        $invoice = Invoice::findOrFail($request->invoice_id);

        if ($invoice->balance_due <= 0) {
            return response()->json(['message' => 'Invoice has no outstanding balance.'], 422);
        }

        // Check if plan already exists
        $existing = PaymentPlan::where('invoice_id', $invoice->id)->active()->first();
        if ($existing) {
            return response()->json(['message' => 'An active payment plan already exists for this invoice.'], 422);
        }

        $plan = $this->service->createPlan(
            $invoice,
            $request->number_of_installments,
            Carbon::parse($request->start_date)
        );

        return response()->json(['data' => $plan], 201);
    }

    public function show(PaymentPlan $paymentPlan)
    {
        return response()->json([
            'data' => $paymentPlan->load(['student', 'invoice', 'installments']),
        ]);
    }

    public function payInstallment(Request $request, PaymentPlan $paymentPlan, PaymentPlanInstallment $installment)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($installment->status === 'paid') {
            return response()->json(['message' => 'This installment is already paid.'], 422);
        }

        $installment = $this->service->processPayment($installment, $request->amount);

        return response()->json(['data' => $installment->load('paymentPlan')]);
    }
}
