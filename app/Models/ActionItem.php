<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'type',
        'title',
        'description',
        'status',
        'priority',
        'action_url',
        'action_label',
        'due_date',
        'completed_at',
        'is_system_generated',
        'source',
        'metadata',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'is_system_generated' => 'boolean',
        'metadata' => 'array',
    ];

    // Action item types
    public const TYPE_REGISTRATION = 'registration';

    public const TYPE_FINANCIAL_AID = 'financial_aid';

    public const TYPE_PAYMENT = 'payment';

    public const TYPE_DOCUMENT = 'document';

    public const TYPE_ADVISING = 'advising';

    public const TYPE_COURSE_EVAL = 'course_eval';

    public const TYPE_IMMUNIZATION = 'immunization';

    public const TYPE_ORIENTATION = 'orientation';

    public const TYPE_GRADUATION = 'graduation';

    public const TYPES = [
        self::TYPE_REGISTRATION,
        self::TYPE_FINANCIAL_AID,
        self::TYPE_PAYMENT,
        self::TYPE_DOCUMENT,
        self::TYPE_ADVISING,
        self::TYPE_COURSE_EVAL,
        self::TYPE_IMMUNIZATION,
        self::TYPE_ORIENTATION,
        self::TYPE_GRADUATION,
    ];

    // Status values
    public const STATUS_PENDING = 'pending';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_DISMISSED = 'dismissed';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
        self::STATUS_DISMISSED,
    ];

    // Priority levels
    public const PRIORITY_LOW = 'low';

    public const PRIORITY_NORMAL = 'normal';

    public const PRIORITY_HIGH = 'high';

    public const PRIORITY_URGENT = 'urgent';

    public const PRIORITIES = [
        self::PRIORITY_LOW,
        self::PRIORITY_NORMAL,
        self::PRIORITY_HIGH,
        self::PRIORITY_URGENT,
    ];

    /**
     * Relationships
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeIncomplete($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_IN_PROGRESS]);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOverdue($query)
    {
        return $query->incomplete()
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->startOfDay());
    }

    public function scopeDueSoon($query, int $days = 7)
    {
        return $query->incomplete()
            ->whereNotNull('due_date')
            ->where('due_date', '>=', now()->startOfDay())
            ->where('due_date', '<=', now()->addDays($days)->endOfDay());
    }

    public function scopeUrgent($query)
    {
        return $query->where('priority', self::PRIORITY_URGENT);
    }

    public function scopeOrderByPriority($query)
    {
        return $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')");
    }

    public function scopeOrderByDueDate($query)
    {
        return $query->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC');
    }

    /**
     * Helpers
     */
    public function isComplete(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast() && ! $this->isComplete();
    }

    public function isDueSoon(int $days = 7): bool
    {
        return $this->due_date &&
               $this->due_date->isFuture() &&
               $this->due_date->lte(now()->addDays($days)) &&
               ! $this->isComplete();
    }

    public function markComplete(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }

    public function dismiss(): void
    {
        $this->update([
            'status' => self::STATUS_DISMISSED,
        ]);
    }

    public function getTypeIcon(): string
    {
        return match ($this->type) {
            self::TYPE_REGISTRATION => 'clipboard-check',
            self::TYPE_FINANCIAL_AID => 'dollar-sign',
            self::TYPE_PAYMENT => 'credit-card',
            self::TYPE_DOCUMENT => 'file-text',
            self::TYPE_ADVISING => 'users',
            self::TYPE_COURSE_EVAL => 'star',
            self::TYPE_IMMUNIZATION => 'heart',
            self::TYPE_ORIENTATION => 'compass',
            self::TYPE_GRADUATION => 'graduation-cap',
            default => 'circle',
        };
    }

    public function getPriorityColor(): string
    {
        return match ($this->priority) {
            self::PRIORITY_LOW => 'gray',
            self::PRIORITY_NORMAL => 'blue',
            self::PRIORITY_HIGH => 'amber',
            self::PRIORITY_URGENT => 'red',
            default => 'gray',
        };
    }
}
