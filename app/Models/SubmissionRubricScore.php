<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubmissionRubricScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_submission_id',
        'rubric_criteria_id',
        'rubric_level_id',
        'points_awarded',
        'feedback',
    ];

    protected $casts = [
        'points_awarded' => 'decimal:2',
    ];

    public function submission()
    {
        return $this->belongsTo(AssignmentSubmission::class, 'assignment_submission_id');
    }

    public function criteria()
    {
        return $this->belongsTo(RubricCriteria::class, 'rubric_criteria_id');
    }

    public function level()
    {
        return $this->belongsTo(RubricLevel::class, 'rubric_level_id');
    }
}
