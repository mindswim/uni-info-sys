<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FinancialAidPackage;
use App\Models\Scholarship;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinancialAidController extends Controller
{
    /**
     * Get the current user's financial aid package
     */
    public function myPackage(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        $package = FinancialAidPackage::where('student_id', $student->id)
            ->with(['aidAwards.scholarship', 'aidAwards.disbursements', 'term'])
            ->latest()
            ->first();

        if (!$package) {
            return response()->json(['message' => 'No financial aid package found'], 404);
        }

        return response()->json([
            'data' => $this->formatPackage($package)
        ]);
    }

    /**
     * Get all financial aid packages for a student (admin view)
     */
    public function studentPackages(Student $student): JsonResponse
    {
        $packages = FinancialAidPackage::where('student_id', $student->id)
            ->with(['aidAwards.scholarship', 'aidAwards.disbursements', 'term'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $packages->map(fn($pkg) => $this->formatPackage($pkg))
        ]);
    }

    /**
     * Get all available scholarships
     */
    public function scholarships(): JsonResponse
    {
        $scholarships = Scholarship::where('is_active', true)
            ->withAvailableSlots()
            ->orderBy('amount', 'desc')
            ->get();

        return response()->json([
            'data' => $scholarships
        ]);
    }

    /**
     * Get a specific scholarship
     */
    public function scholarship(Scholarship $scholarship): JsonResponse
    {
        return response()->json([
            'data' => $scholarship->load(['department', 'program'])
        ]);
    }

    /**
     * Get financial aid summary statistics (admin)
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_packages' => FinancialAidPackage::count(),
            'packages_by_status' => FinancialAidPackage::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'total_scholarships' => Scholarship::where('is_active', true)->count(),
            'total_aid_awarded' => FinancialAidPackage::where('status', 'accepted')
                ->selectRaw('SUM(total_grants + total_scholarships + total_loans + total_work_study) as total')
                ->value('total') ?? 0,
            'average_package' => FinancialAidPackage::where('status', 'accepted')
                ->selectRaw('AVG(total_grants + total_scholarships + total_loans + total_work_study) as avg')
                ->value('avg') ?? 0,
        ];

        return response()->json(['data' => $stats]);
    }

    private function formatPackage(FinancialAidPackage $package): array
    {
        $awards = $package->aidAwards->map(function ($award) {
            return [
                'id' => $award->id,
                'aid_type' => $award->aid_type,
                'aid_type_label' => $award::AID_TYPES[$award->aid_type] ?? $award->aid_type,
                'name' => $award->name,
                'description' => $award->description,
                'amount' => (float) $award->amount,
                'status' => $award->status,
                'disbursement_schedule' => $award->disbursement_schedule,
                'interest_rate' => $award->interest_rate ? (float) $award->interest_rate : null,
                'origination_fee' => $award->origination_fee ? (float) $award->origination_fee : null,
                'net_amount' => $award->net_loan_amount,
                'min_gpa_to_maintain' => $award->min_gpa_to_maintain ? (float) $award->min_gpa_to_maintain : null,
                'min_credits_to_maintain' => $award->min_credits_to_maintain,
                'conditions' => $award->conditions,
                'is_loan' => $award->isLoan(),
                'is_gift_aid' => $award->isGiftAid(),
                'scholarship' => $award->scholarship ? [
                    'id' => $award->scholarship->id,
                    'name' => $award->scholarship->name,
                    'type' => $award->scholarship->type,
                ] : null,
                'disbursements' => $award->disbursements->map(fn($d) => [
                    'id' => $d->id,
                    'amount' => (float) $d->amount,
                    'scheduled_date' => $d->scheduled_date->format('Y-m-d'),
                    'disbursed_date' => $d->disbursed_date?->format('Y-m-d'),
                    'status' => $d->status,
                ]),
            ];
        });

        // Group awards by type
        $giftAid = $awards->filter(fn($a) => $a['is_gift_aid']);
        $loans = $awards->filter(fn($a) => $a['is_loan']);
        $workStudy = $awards->filter(fn($a) => $a['aid_type'] === 'work_study');
        $other = $awards->filter(fn($a) => !$a['is_gift_aid'] && !$a['is_loan'] && $a['aid_type'] !== 'work_study');

        return [
            'id' => $package->id,
            'term' => $package->term ? [
                'id' => $package->term->id,
                'name' => $package->term->name,
            ] : null,
            'status' => $package->status,
            'cost_of_attendance' => [
                'tuition' => (float) $package->tuition_cost,
                'fees' => (float) $package->fees_cost,
                'room_board' => (float) $package->room_board_cost,
                'books_supplies' => (float) $package->books_supplies_cost,
                'transportation' => (float) $package->transportation_cost,
                'personal' => (float) $package->personal_cost,
                'total' => (float) $package->total_cost_of_attendance,
            ],
            'financial_need' => [
                'expected_family_contribution' => $package->expected_family_contribution ? (float) $package->expected_family_contribution : null,
                'demonstrated_need' => $package->demonstrated_need ? (float) $package->demonstrated_need : null,
                'unmet_need' => (float) $package->unmet_need,
            ],
            'aid_totals' => [
                'grants' => (float) $package->total_grants,
                'scholarships' => (float) $package->total_scholarships,
                'loans' => (float) $package->total_loans,
                'work_study' => (float) $package->total_work_study,
                'total_gift_aid' => (float) $package->total_gift_aid,
                'total_aid' => (float) $package->total_aid,
                'net_cost' => (float) $package->net_cost,
            ],
            'awards' => [
                'gift_aid' => $giftAid->values(),
                'loans' => $loans->values(),
                'work_study' => $workStudy->values(),
                'other' => $other->values(),
            ],
            'dates' => [
                'offer_date' => $package->offer_date?->format('Y-m-d'),
                'response_deadline' => $package->response_deadline?->format('Y-m-d'),
                'accepted_date' => $package->accepted_date?->format('Y-m-d'),
            ],
            'notes' => $package->notes,
        ];
    }
}
