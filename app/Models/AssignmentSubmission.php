<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    /**
     * Valid submission statuses
     */
    public const STATUSES = [
        'not_started',
        'in_progress',
        'submitted',
        'late',
        'graded',
        'returned',
    ];

    /**
     * Get the assignment this submission is for
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the enrollment (student + course section)
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Get the grader (staff member)
     */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'graded_by');
    }

    public function rubricScores()
    {
        return $this->hasMany(SubmissionRubricScore::class);
    }

    /**
     * Get the student through enrollment
     */
    public function getStudentAttribute(): ?Student
    {
        return $this->enrollment?->student;
    }

    /**
     * Check if the submission is submitted
     */
    public function isSubmitted(): bool
    {
        return in_array($this->status, ['submitted', 'late', 'graded']);
    }

    /**
     * Check if the submission is graded
     */
    public function isGraded(): bool
    {
        return $this->status === 'graded';
    }

    /**
     * Check if the submission was late
     */
    public function isLate(): bool
    {
        return $this->late_days > 0;
    }

    /**
     * Check if the submission is pending grading
     */
    public function isPendingGrading(): bool
    {
        return in_array($this->status, ['submitted', 'late']);
    }

    /**
     * Check if the submission passed
     */
    public function isPassing(): bool
    {
        if (!$this->isGraded() || $this->final_score === null) {
            return false;
        }

        $passingScore = $this->assignment->passing_score;
        if ($passingScore === null) {
            return true; // No passing score defined
        }

        return $this->final_score >= $passingScore;
    }

    /**
     * Get the percentage score
     */
    public function getPercentageAttribute(): ?float
    {
        if ($this->final_score === null || $this->assignment->max_points == 0) {
            return null;
        }

        return round(($this->final_score / $this->assignment->max_points) * 100, 2);
    }

    /**
     * Get the letter grade based on percentage
     */
    public function getLetterGradeAttribute(): ?string
    {
        $percentage = $this->percentage;
        if ($percentage === null) {
            return null;
        }

        return match (true) {
            $percentage >= 97 => 'A+',
            $percentage >= 93 => 'A',
            $percentage >= 90 => 'A-',
            $percentage >= 87 => 'B+',
            $percentage >= 83 => 'B',
            $percentage >= 80 => 'B-',
            $percentage >= 77 => 'C+',
            $percentage >= 73 => 'C',
            $percentage >= 70 => 'C-',
            $percentage >= 67 => 'D+',
            $percentage >= 63 => 'D',
            $percentage >= 60 => 'D-',
            default => 'F',
        };
    }

    /**
     * Scope to get submissions by status
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get graded submissions
     */
    public function scopeGraded($query)
    {
        return $query->where('status', 'graded');
    }

    /**
     * Scope to get pending grading
     */
    public function scopePendingGrading($query)
    {
        return $query->whereIn('status', ['submitted', 'late']);
    }

    /**
     * Scope to get submitted (including late)
     */
    public function scopeSubmitted($query)
    {
        return $query->whereIn('status', ['submitted', 'late', 'graded']);
    }

    /**
     * Scope to get late submissions
     */
    public function scopeLate($query)
    {
        return $query->where('late_days', '>', 0);
    }

    /**
     * Scope for a specific student
     */
    public function scopeForStudent($query, int $studentId)
    {
        return $query->whereHas('enrollment', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        });
    }

    /**
     * Scope for a specific assignment
     */
    public function scopeForAssignment($query, int $assignmentId)
    {
        return $query->where('assignment_id', $assignmentId);
    }
}
