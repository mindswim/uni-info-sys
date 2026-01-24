<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Placeholder model for Phase 1.3 - Assignment Submissions
 * Full implementation will be added when submissions feature is built.
 */
class AssignmentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'enrollment_id',
        'submitted_at',
        'content',
        'file_path',
        'file_name',
        'status',
        'score',
        'feedback',
        'graded_at',
        'graded_by',
        'late_days',
        'late_penalty_applied',
        'final_score',
        'attempt_number',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'score' => 'decimal:2',
        'late_penalty_applied' => 'decimal:2',
        'final_score' => 'decimal:2',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'graded_by');
    }
}
