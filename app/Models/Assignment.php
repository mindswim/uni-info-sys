<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_section_id',
        'title',
        'description',
        'type',
        'due_date',
        'available_from',
        'max_points',
        'weight',
        'passing_score',
        'allows_late',
        'late_penalty_per_day',
        'max_late_days',
        'instructions_file',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'available_from' => 'datetime',
        'max_points' => 'decimal:2',
        'weight' => 'decimal:2',
        'passing_score' => 'decimal:2',
        'late_penalty_per_day' => 'decimal:2',
        'allows_late' => 'boolean',
        'is_published' => 'boolean',
    ];

    /**
     * Valid assignment types
     */
    public const TYPES = [
        'homework',
        'quiz',
        'exam',
        'midterm',
        'final',
        'project',
        'paper',
        'presentation',
        'lab',
        'participation',
        'other',
    ];

    /**
     * Get the course section this assignment belongs to
     */
    public function courseSection(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class);
    }

    /**
     * Get all submissions for this assignment
     * Note: AssignmentSubmission model will be created in Phase 1.3
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(\App\Models\AssignmentSubmission::class);
    }

    /**
     * Check if the assignment is available to students
     */
    public function isAvailable(): bool
    {
        if (!$this->is_published) {
            return false;
        }

        if ($this->available_from && now()->lt($this->available_from)) {
            return false;
        }

        return true;
    }

    /**
     * Check if the assignment is past due
     */
    public function isPastDue(): bool
    {
        return now()->gt($this->due_date);
    }

    /**
     * Check if late submissions are still accepted
     */
    public function acceptsLateSubmissions(): bool
    {
        if (!$this->allows_late) {
            return false;
        }

        if ($this->max_late_days === null) {
            return true; // Unlimited late days
        }

        $daysPastDue = $this->getDaysLate();
        return $daysPastDue <= $this->max_late_days;
    }

    /**
     * Calculate the number of days late for a given date
     */
    public function getDaysLate(?\DateTime $submittedAt = null): int
    {
        $submittedAt = $submittedAt ?? now();

        if ($submittedAt <= $this->due_date) {
            return 0;
        }

        return (int) $this->due_date->diffInDays($submittedAt);
    }

    /**
     * Calculate late penalty for a given number of days late
     */
    public function calculateLatePenalty(int $daysLate): float
    {
        if ($daysLate <= 0 || !$this->allows_late) {
            return 0;
        }

        $penalty = $daysLate * $this->late_penalty_per_day;

        // Cap at 100% penalty
        return min($penalty, 100);
    }

    /**
     * Calculate the final score after late penalty
     */
    public function calculateFinalScore(float $rawScore, int $daysLate): float
    {
        if ($daysLate <= 0) {
            return $rawScore;
        }

        $penaltyPercent = $this->calculateLatePenalty($daysLate);
        $penaltyAmount = ($rawScore * $penaltyPercent) / 100;

        return max(0, $rawScore - $penaltyAmount);
    }

    /**
     * Get time remaining until due date
     */
    public function getTimeRemainingAttribute(): ?string
    {
        if ($this->isPastDue()) {
            return null;
        }

        return now()->diffForHumans($this->due_date, ['parts' => 2]);
    }

    /**
     * Get submission count
     */
    public function getSubmissionCountAttribute(): int
    {
        return $this->submissions()->count();
    }

    /**
     * Get graded submission count
     */
    public function getGradedCountAttribute(): int
    {
        return $this->submissions()->where('status', 'graded')->count();
    }

    /**
     * Scope to get published assignments
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get available assignments (published and available_from passed)
     */
    public function scopeAvailable($query)
    {
        return $query->published()
            ->where(function ($q) {
                $q->whereNull('available_from')
                  ->orWhere('available_from', '<=', now());
            });
    }

    /**
     * Scope to get assignments due soon (within days)
     */
    public function scopeDueSoon($query, int $days = 7)
    {
        return $query->where('due_date', '>=', now())
                     ->where('due_date', '<=', now()->addDays($days));
    }

    /**
     * Scope to get past due assignments
     */
    public function scopePastDue($query)
    {
        return $query->where('due_date', '<', now());
    }

    /**
     * Scope to get assignments by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to order by due date
     */
    public function scopeOrderByDueDate($query, string $direction = 'asc')
    {
        return $query->orderBy('due_date', $direction);
    }

    /**
     * Scope to order by sort order then due date
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('due_date');
    }
}
