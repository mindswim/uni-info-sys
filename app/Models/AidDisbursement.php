<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AidDisbursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'aid_award_id',
        'term_id',
        'amount',
        'scheduled_date',
        'disbursed_date',
        'status',
        'hold_reason',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'scheduled_date' => 'date',
        'disbursed_date' => 'date',
    ];

    public const STATUSES = [
        'scheduled' => 'Scheduled',
        'pending' => 'Pending',
        'disbursed' => 'Disbursed',
        'held' => 'Held',
        'cancelled' => 'Cancelled',
    ];

    public function aidAward(): BelongsTo
    {
        return $this->belongsTo(AidAward::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function isDisbursed(): bool
    {
        return $this->status === 'disbursed';
    }

    public function isHeld(): bool
    {
        return $this->status === 'held';
    }

    public function disburse(): void
    {
        $this->status = 'disbursed';
        $this->disbursed_date = now();
        $this->hold_reason = null;
        $this->save();
    }

    public function hold(string $reason): void
    {
        $this->status = 'held';
        $this->hold_reason = $reason;
        $this->save();
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDisbursed($query)
    {
        return $query->where('status', 'disbursed');
    }

    public function scopeHeld($query)
    {
        return $query->where('status', 'held');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['scheduled', 'pending'])
            ->where('scheduled_date', '>=', now());
    }
}
