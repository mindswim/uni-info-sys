<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AidAward extends Model
{
    use HasFactory;

    protected $fillable = [
        'financial_aid_package_id',
        'scholarship_id',
        'aid_type',
        'name',
        'description',
        'amount',
        'disbursement_schedule',
        'status',
        'interest_rate',
        'origination_fee',
        'min_gpa_to_maintain',
        'min_credits_to_maintain',
        'conditions',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'interest_rate' => 'decimal:3',
        'origination_fee' => 'decimal:3',
        'min_gpa_to_maintain' => 'decimal:2',
    ];

    public const AID_TYPES = [
        'scholarship' => 'Institutional Scholarship',
        'grant' => 'Grant',
        'loan_subsidized' => 'Federal Direct Subsidized Loan',
        'loan_unsubsidized' => 'Federal Direct Unsubsidized Loan',
        'loan_plus' => 'Parent PLUS Loan',
        'loan_private' => 'Private Loan',
        'work_study' => 'Federal Work-Study',
        'external' => 'External Scholarship',
        'tuition_waiver' => 'Tuition Waiver',
        'other' => 'Other',
    ];

    public const STATUSES = [
        'offered' => 'Offered',
        'accepted' => 'Accepted',
        'declined' => 'Declined',
        'disbursed' => 'Disbursed',
        'cancelled' => 'Cancelled',
    ];

    public function financialAidPackage(): BelongsTo
    {
        return $this->belongsTo(FinancialAidPackage::class);
    }

    public function scholarship(): BelongsTo
    {
        return $this->belongsTo(Scholarship::class);
    }

    public function disbursements(): HasMany
    {
        return $this->hasMany(AidDisbursement::class);
    }

    public function isLoan(): bool
    {
        return in_array($this->aid_type, ['loan_subsidized', 'loan_unsubsidized', 'loan_plus', 'loan_private']);
    }

    public function isGiftAid(): bool
    {
        return in_array($this->aid_type, ['scholarship', 'grant', 'external', 'tuition_waiver']);
    }

    public function getNetLoanAmountAttribute(): ?float
    {
        if (! $this->isLoan()) {
            return null;
        }
        $fee = $this->origination_fee ? ($this->amount * $this->origination_fee / 100) : 0;

        return $this->amount - $fee;
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('aid_type', $type);
    }

    public function scopeLoans($query)
    {
        return $query->whereIn('aid_type', ['loan_subsidized', 'loan_unsubsidized', 'loan_plus', 'loan_private']);
    }

    public function scopeGiftAid($query)
    {
        return $query->whereIn('aid_type', ['scholarship', 'grant', 'external', 'tuition_waiver']);
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
}
