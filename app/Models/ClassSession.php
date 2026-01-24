<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_section_id',
        'session_number',
        'session_date',
        'start_time',
        'end_time',
        'title',
        'description',
        'status',
        'cancellation_reason',
        'location_override',
        'substitute_instructor_id',
    ];

    protected $casts = [
        'session_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    /**
     * Get the course section this session belongs to
     */
    public function courseSection(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class);
    }

    /**
     * Get the substitute instructor if one is assigned
     */
    public function substituteInstructor(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'substitute_instructor_id');
    }

    /**
     * Get attendance records for this session
     */
    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    /**
     * Get materials for this session
     */
    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class);
    }

    /**
     * Get the effective instructor (substitute or regular)
     */
    public function getEffectiveInstructorAttribute(): ?Staff
    {
        return $this->substituteInstructor ?? $this->courseSection->instructor;
    }

    /**
     * Get the effective location (override or regular room)
     */
    public function getEffectiveLocationAttribute(): ?string
    {
        if ($this->location_override) {
            return $this->location_override;
        }

        $room = $this->courseSection->room;
        if ($room) {
            return $room->building->code . ' ' . $room->room_number;
        }

        return null;
    }

    /**
     * Check if the session is scheduled
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if the session is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the session is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the session is in the past
     */
    public function isPast(): bool
    {
        return $this->session_date->isPast() ||
               ($this->session_date->isToday() && now()->format('H:i') > $this->end_time->format('H:i'));
    }

    /**
     * Check if the session is happening now
     */
    public function isNow(): bool
    {
        if (!$this->session_date->isToday()) {
            return false;
        }

        $now = now()->format('H:i');
        return $now >= $this->start_time->format('H:i') && $now <= $this->end_time->format('H:i');
    }

    /**
     * Scope to get sessions for a specific date
     */
    public function scopeForDate($query, string $date)
    {
        return $query->where('session_date', $date);
    }

    /**
     * Scope to get sessions for a date range
     */
    public function scopeBetweenDates($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('session_date', [$startDate, $endDate]);
    }

    /**
     * Scope to get sessions by status
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get upcoming sessions
     */
    public function scopeUpcoming($query)
    {
        return $query->where('session_date', '>=', now()->toDateString())
                     ->where('status', 'scheduled')
                     ->orderBy('session_date')
                     ->orderBy('start_time');
    }

    /**
     * Scope to get past sessions
     */
    public function scopePast($query)
    {
        return $query->where('session_date', '<', now()->toDateString())
                     ->orderBy('session_date', 'desc')
                     ->orderBy('start_time', 'desc');
    }
}
