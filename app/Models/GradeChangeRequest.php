<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeChangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'old_grade',
        'new_grade',
        'reason',
        'requested_by',
        'status',
        'approved_by',
        'approved_at',
        'denial_reason',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * Get the enrollment that this grade change request is for
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Get the user who requested the grade change
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved/denied the grade change
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope to get pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get denied requests
     */
    public function scopeDenied($query)
    {
        return $query->where('status', 'denied');
    }
}
