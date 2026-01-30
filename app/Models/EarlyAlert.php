<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EarlyAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_section_id',
        'raised_by',
        'alert_type',
        'severity',
        'description',
        'status',
        'resolved_by',
        'resolved_at',
        'resolution_notes',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public const ALERT_TYPES = [
        'poor_attendance',
        'failing_grade',
        'missing_assignments',
        'behavioral',
        'other',
    ];

    public const SEVERITIES = ['low', 'medium', 'high', 'critical'];

    public const STATUSES = ['open', 'acknowledged', 'in_progress', 'resolved', 'dismissed'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(Staff::class, 'raised_by');
    }

    public function resolvedBy()
    {
        return $this->belongsTo(Staff::class, 'resolved_by');
    }

    public function comments()
    {
        return $this->hasMany(EarlyAlertComment::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForAdvisor($query, int $staffId)
    {
        return $query->whereHas('student', function ($q) use ($staffId) {
            $q->where('advisor_id', $staffId);
        });
    }
}
