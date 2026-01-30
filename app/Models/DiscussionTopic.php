<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'course_section_id',
        'title',
        'created_by',
        'is_pinned',
        'is_locked',
        'is_anonymous',
        'reply_count',
        'last_reply_at',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
        'is_anonymous' => 'boolean',
        'reply_count' => 'integer',
        'last_reply_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeUnlocked($query)
    {
        return $query->where('is_locked', false);
    }

    public function scopeForSection($query, int $sectionId)
    {
        return $query->where('course_section_id', $sectionId);
    }
}
