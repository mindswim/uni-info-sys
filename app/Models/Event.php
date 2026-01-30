<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const TYPE_GENERAL = 'general';

    public const TYPE_ACADEMIC = 'academic';

    public const TYPE_DEADLINE = 'deadline';

    public const TYPE_MEETING = 'meeting';

    public const TYPE_CLASS = 'class';

    public const TYPE_EXAM = 'exam';

    public const TYPE_HOLIDAY = 'holiday';

    public const TYPE_ORIENTATION = 'orientation';

    public const TYPE_REGISTRATION = 'registration';

    public const TYPES = [
        self::TYPE_GENERAL => 'General',
        self::TYPE_ACADEMIC => 'Academic',
        self::TYPE_DEADLINE => 'Deadline',
        self::TYPE_MEETING => 'Meeting',
        self::TYPE_CLASS => 'Class',
        self::TYPE_EXAM => 'Exam',
        self::TYPE_HOLIDAY => 'Holiday',
        self::TYPE_ORIENTATION => 'Orientation',
        self::TYPE_REGISTRATION => 'Registration',
    ];

    public const VISIBILITY_PUBLIC = 'public';

    public const VISIBILITY_STUDENTS = 'students';

    public const VISIBILITY_STAFF = 'staff';

    public const VISIBILITY_PRIVATE = 'private';

    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'all_day',
        'location',
        'type',
        'color',
        'visibility',
        'created_by',
        'term_id',
        'course_section_id',
        'department_id',
        'recurrence_rule',
        'parent_event_id',
        'reminder_minutes',
        'reminder_sent',
        'is_cancelled',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'all_day' => 'boolean',
        'reminder_sent' => 'boolean',
        'is_cancelled' => 'boolean',
    ];

    // Relationships

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function parentEvent()
    {
        return $this->belongsTo(Event::class, 'parent_event_id');
    }

    public function childEvents()
    {
        return $this->hasMany(Event::class, 'parent_event_id');
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_user')
            ->withPivot('status', 'reminded')
            ->withTimestamps();
    }

    // Scopes

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('start_time', '>=', now())
            ->where('is_cancelled', false)
            ->orderBy('start_time');
    }

    public function scopeInRange(Builder $query, $start, $end): Builder
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->whereBetween('start_time', [$start, $end])
                ->orWhereBetween('end_time', [$start, $end])
                ->orWhere(function ($q2) use ($start, $end) {
                    $q2->where('start_time', '<=', $start)
                        ->where('end_time', '>=', $end);
                });
        });
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeVisible(Builder $query, ?User $user = null): Builder
    {
        if (! $user) {
            return $query->where('visibility', self::VISIBILITY_PUBLIC);
        }

        return $query->where(function ($q) use ($user) {
            $q->where('visibility', self::VISIBILITY_PUBLIC)
                ->orWhere('created_by', $user->id);

            $roles = $user->roles()->pluck('name')->map(fn ($r) => strtolower($r))->toArray();

            if (in_array('student', $roles)) {
                $q->orWhere('visibility', self::VISIBILITY_STUDENTS);
            }

            if (in_array('staff', $roles) || in_array('admin', $roles)) {
                $q->orWhere('visibility', self::VISIBILITY_STAFF);
            }

            // Also include events the user is attending
            $q->orWhereHas('attendees', function ($attendeeQuery) use ($user) {
                $attendeeQuery->where('user_id', $user->id);
            });
        });
    }

    public function scopeForStudent(Builder $query, Student $student): Builder
    {
        return $query->where(function ($q) use ($student) {
            // Public events
            $q->where('visibility', self::VISIBILITY_PUBLIC)
                ->orWhere('visibility', self::VISIBILITY_STUDENTS);

            // Events for enrolled course sections
            if ($student->enrollments()->exists()) {
                $enrolledSectionIds = $student->enrollments()
                    ->whereIn('status', ['enrolled', 'completed'])
                    ->pluck('course_section_id');

                $q->orWhereIn('course_section_id', $enrolledSectionIds);
            }

            // Events for student's department
            if ($student->majorProgram) {
                $q->orWhere('department_id', $student->majorProgram->department_id);
            }
        });
    }

    // Helpers

    public function isActive(): bool
    {
        return ! $this->is_cancelled;
    }

    public function isPast(): bool
    {
        return $this->end_time < now();
    }

    public function isOngoing(): bool
    {
        return $this->start_time <= now() && $this->end_time >= now();
    }

    public function getTypeLabel(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    public function getDuration(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    public function getDefaultColor(): string
    {
        $colors = [
            self::TYPE_GENERAL => '#6B7280',
            self::TYPE_ACADEMIC => '#3B82F6',
            self::TYPE_DEADLINE => '#EF4444',
            self::TYPE_MEETING => '#8B5CF6',
            self::TYPE_CLASS => '#10B981',
            self::TYPE_EXAM => '#F59E0B',
            self::TYPE_HOLIDAY => '#EC4899',
            self::TYPE_ORIENTATION => '#14B8A6',
            self::TYPE_REGISTRATION => '#6366F1',
        ];

        return $this->color ?? ($colors[$this->type] ?? '#6B7280');
    }
}
