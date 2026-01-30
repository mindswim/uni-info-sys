<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'announceable_type',
        'announceable_id',
        'author_id',
        'title',
        'content',
        'priority',
        'is_published',
        'published_at',
        'expires_at',
        'is_pinned',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_pinned' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Valid priority levels
     */
    public const PRIORITIES = [
        'normal',
        'important',
        'urgent',
    ];

    /**
     * Valid target types (for validation)
     */
    public const TARGET_TYPES = [
        'course_section' => CourseSection::class,
        'department' => Department::class,
    ];

    /**
     * Get the target entity (CourseSection, Department, or null)
     */
    public function announceable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the author (staff member)
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'author_id');
    }

    /**
     * Check if the announcement is currently visible
     */
    public function isVisible(): bool
    {
        if (! $this->is_published) {
            return false;
        }

        if ($this->published_at && now()->lt($this->published_at)) {
            return false;
        }

        if ($this->expires_at && now()->gt($this->expires_at)) {
            return false;
        }

        return true;
    }

    /**
     * Check if the announcement has expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && now()->gt($this->expires_at);
    }

    /**
     * Check if this is a university-wide announcement
     */
    public function isUniversityWide(): bool
    {
        return $this->announceable_type === null && $this->announceable_id === null;
    }

    /**
     * Check if this is for a course section
     */
    public function isForCourseSection(): bool
    {
        return $this->announceable_type === CourseSection::class;
    }

    /**
     * Check if this is for a department
     */
    public function isForDepartment(): bool
    {
        return $this->announceable_type === Department::class;
    }

    /**
     * Get priority badge class (for UI)
     */
    public function getPriorityBadgeAttribute(): string
    {
        return match ($this->priority) {
            'urgent' => 'danger',
            'important' => 'warning',
            default => 'info',
        };
    }

    /**
     * Scope to get published and visible announcements
     */
    public function scopeVisible($query)
    {
        return $query->where('is_published', true)
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope to get university-wide announcements
     */
    public function scopeUniversityWide($query)
    {
        return $query->whereNull('announceable_type')
            ->whereNull('announceable_id');
    }

    /**
     * Scope to get announcements for a course section
     */
    public function scopeForCourseSection($query, int $sectionId)
    {
        return $query->where('announceable_type', CourseSection::class)
            ->where('announceable_id', $sectionId);
    }

    /**
     * Scope to get announcements for a department
     */
    public function scopeForDepartment($query, int $departmentId)
    {
        return $query->where('announceable_type', Department::class)
            ->where('announceable_id', $departmentId);
    }

    /**
     * Scope to get announcements by priority
     */
    public function scopeWithPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to get pinned announcements first
     */
    public function scopePinnedFirst($query)
    {
        return $query->orderByDesc('is_pinned');
    }

    /**
     * Scope to order by priority (urgent first)
     */
    public function scopeOrderByPriority($query)
    {
        return $query->orderByRaw("FIELD(priority, 'urgent', 'important', 'normal')");
    }

    /**
     * Scope to order by newest first
     */
    public function scopeLatest($query)
    {
        return $query->orderByDesc('published_at')
            ->orderByDesc('created_at');
    }

    /**
     * Standard ordering: pinned first, then by priority, then newest
     */
    public function scopeOrdered($query)
    {
        return $query->pinnedFirst()
            ->orderByPriority()
            ->latest();
    }
}
