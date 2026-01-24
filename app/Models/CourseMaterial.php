<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_section_id',
        'class_session_id',
        'title',
        'description',
        'type',
        'content',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'url',
        'sort_order',
        'is_published',
        'available_from',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'available_from' => 'datetime',
    ];

    /**
     * Valid material types
     */
    public const TYPES = [
        'syllabus',
        'reading',
        'lecture_notes',
        'video',
        'link',
        'file',
        'other',
    ];

    /**
     * Get the course section this material belongs to
     */
    public function courseSection(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class);
    }

    /**
     * Get the class session this material is associated with (if any)
     */
    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    /**
     * Check if the material is available
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
     * Check if this is an external link
     */
    public function isLink(): bool
    {
        return $this->type === 'link' || !empty($this->url);
    }

    /**
     * Check if this is a file upload
     */
    public function isFile(): bool
    {
        return !empty($this->file_path);
    }

    /**
     * Check if this has inline content
     */
    public function hasContent(): bool
    {
        return !empty($this->content);
    }

    /**
     * Get human-readable file size
     */
    public function getFormattedFileSizeAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $bytes = (int) $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Scope to get published materials
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get available materials
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
     * Scope to get materials by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get section-wide materials (not linked to a specific session)
     */
    public function scopeSectionWide($query)
    {
        return $query->whereNull('class_session_id');
    }

    /**
     * Scope to get materials for a specific session
     */
    public function scopeForSession($query, int $sessionId)
    {
        return $query->where('class_session_id', $sessionId);
    }

    /**
     * Scope to order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }
}
