<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialAidPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'term_id',
        'status',
        'tuition_cost',
        'fees_cost',
        'room_board_cost',
        'books_supplies_cost',
        'transportation_cost',
        'personal_cost',
        'expected_family_contribution',
        'demonstrated_need',
        'total_grants',
        'total_scholarships',
        'total_loans',
        'total_work_study',
        'unmet_need',
        'offer_date',
        'response_deadline',
        'accepted_date',
        'notes',
    ];

    protected $casts = [
        'tuition_cost' => 'decimal:2',
        'fees_cost' => 'decimal:2',
        'room_board_cost' => 'decimal:2',
        'books_supplies_cost' => 'decimal:2',
        'transportation_cost' => 'decimal:2',
        'personal_cost' => 'decimal:2',
        'expected_family_contribution' => 'decimal:2',
        'demonstrated_need' => 'decimal:2',
        'total_grants' => 'decimal:2',
        'total_scholarships' => 'decimal:2',
        'total_loans' => 'decimal:2',
        'total_work_study' => 'decimal:2',
        'unmet_need' => 'decimal:2',
        'offer_date' => 'date',
        'response_deadline' => 'date',
        'accepted_date' => 'date',
    ];

    public const STATUSES = [
        'pending' => 'Pending',
        'offered' => 'Offered',
        'accepted' => 'Accepted',
        'declined' => 'Declined',
        'cancelled' => 'Cancelled',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function aidAwards(): HasMany
    {
        return $this->hasMany(AidAward::class);
    }

    public function getTotalCostOfAttendanceAttribute(): float
    {
        return $this->tuition_cost +
               $this->fees_cost +
               $this->room_board_cost +
               $this->books_supplies_cost +
               $this->transportation_cost +
               $this->personal_cost;
    }

    public function getTotalAidAttribute(): float
    {
        return $this->total_grants +
               $this->total_scholarships +
               $this->total_loans +
               $this->total_work_study;
    }

    public function getTotalGiftAidAttribute(): float
    {
        return $this->total_grants + $this->total_scholarships;
    }

    public function getNetCostAttribute(): float
    {
        return $this->total_cost_of_attendance - $this->total_gift_aid;
    }

    public function recalculateTotals(): void
    {
        $awards = $this->aidAwards()->where('status', '!=', 'cancelled')->get();

        $this->total_scholarships = $awards->whereIn('aid_type', ['scholarship', 'external', 'tuition_waiver'])->sum('amount');
        $this->total_grants = $awards->where('aid_type', 'grant')->sum('amount');
        $this->total_loans = $awards->whereIn('aid_type', ['loan_subsidized', 'loan_unsubsidized', 'loan_plus', 'loan_private'])->sum('amount');
        $this->total_work_study = $awards->where('aid_type', 'work_study')->sum('amount');

        $this->demonstrated_need = $this->total_cost_of_attendance - ($this->expected_family_contribution ?? 0);
        $this->unmet_need = max(0, $this->demonstrated_need - $this->total_aid);

        $this->save();
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeOffered($query)
    {
        return $query->where('status', 'offered');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
}
