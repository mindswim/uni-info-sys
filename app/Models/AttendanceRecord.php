<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'course_section_id',
        'class_session_id',
        'student_id',
        'attendance_date',
        'status',
        'check_in_time',
        'check_out_time',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
    ];

    /**
     * Get the enrollment this attendance record belongs to
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Get the course section
     */
    public function courseSection(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class);
    }

    /**
     * Get the class session this attendance record belongs to
     */
    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    /**
     * Get the student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the staff member who recorded this attendance
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'recorded_by');
    }

    /**
     * Scope to get attendance for a specific date
     */
    public function scopeForDate($query, string $date)
    {
        return $query->where('attendance_date', $date);
    }

    /**
     * Scope to get attendance for a course section
     */
    public function scopeForCourseSection($query, int $courseSectionId)
    {
        return $query->where('course_section_id', $courseSectionId);
    }

    /**
     * Scope to get attendance for a student
     */
    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Check if student was present
     */
    public function isPresent(): bool
    {
        return $this->status === 'present';
    }

    /**
     * Check if student was absent
     */
    public function isAbsent(): bool
    {
        return $this->status === 'absent';
    }
}
