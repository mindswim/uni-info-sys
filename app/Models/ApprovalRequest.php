<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalRequest extends Model
{
    use HasFactory;

    const TYPE_SECTION_OFFERING = 'section_offering';
    const TYPE_ENROLLMENT_OVERRIDE = 'enrollment_override';

    protected $fillable = [
        'type',
        'requestable_type',
        'requestable_id',
        'department_id',
        'requested_by',
        'status',
        'approved_by',
        'approved_at',
        'notes',
        'denial_reason',
        'metadata',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function requestable(): MorphTo
    {
        return $this->morphTo();
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'approved_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
