<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\TransferCredit;
use App\Models\TransferEquivalency;
use Illuminate\Support\Facades\DB;

class TransferCreditService
{
    public function evaluate(
        TransferCredit $transfer,
        ?int $courseId,
        ?float $credits,
        ?string $grade,
        Staff $staff,
        string $status = 'approved'
    ): TransferCredit {
        return DB::transaction(function () use ($transfer, $courseId, $credits, $grade, $staff, $status) {
            $transfer->update([
                'equivalent_course_id' => $courseId,
                'credits_awarded' => $credits,
                'grade_awarded' => $grade,
                'status' => $status,
                'evaluated_by' => $staff->id,
                'evaluated_at' => now(),
            ]);

            return $transfer;
        });
    }

    public function autoMatch(TransferCredit $transfer): ?TransferEquivalency
    {
        return TransferEquivalency::where('external_institution', $transfer->external_institution)
            ->where('external_course_code', $transfer->external_course_code)
            ->first();
    }
}
