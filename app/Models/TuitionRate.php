<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TuitionRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'term_id',
        'student_type',
        'enrollment_status',
        'tuition_per_credit',
        'base_fee',
        'technology_fee',
        'activity_fee',
        'health_fee',
        'effective_date',
        'end_date',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'tuition_per_credit' => 'decimal:2',
        'base_fee' => 'decimal:2',
        'technology_fee' => 'decimal:2',
        'activity_fee' => 'decimal:2',
        'health_fee' => 'decimal:2',
        'effective_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the program that this tuition rate applies to
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the term that this tuition rate applies to
     */
    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    /**
     * Scope to get active rates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get current rates (effective today)
     */
    public function scopeCurrent($query)
    {
        $today = now()->toDateString();

        return $query->where('effective_date', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $today);
            });
    }
}
