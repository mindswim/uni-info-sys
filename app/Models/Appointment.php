<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'advisor_id',
        'scheduled_at',
        'duration_minutes',
        'type',
        'status',
        'location',
        'meeting_link',
        'student_notes',
        'advisor_notes',
        'meeting_notes',
        'cancelled_at',
        'cancellation_reason',
        'cancelled_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'duration_minutes' => 'integer',
    ];

    // Relationships

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function advisor()
    {
        return $this->belongsTo(Staff::class, 'advisor_id');
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // Scopes

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('scheduled_at', '>=', now())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('scheduled_at');
    }

    public function scopePast(Builder $query): Builder
    {
        return $query->where('scheduled_at', '<', now())
            ->orWhereIn('status', ['completed', 'cancelled', 'no_show'])
            ->orderByDesc('scheduled_at');
    }

    public function scopeForStudent(Builder $query, int $studentId): Builder
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForAdvisor(Builder $query, int $advisorId): Builder
    {
        return $query->where('advisor_id', $advisorId);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    // Helper Methods

    public function isUpcoming(): bool
    {
        return $this->scheduled_at->isFuture() &&
            in_array($this->status, ['scheduled', 'confirmed']);
    }

    public function canBeCancelled(): bool
    {
        return $this->isUpcoming() &&
            $this->scheduled_at->diffInHours(now()) >= 24;
    }

    public function cancel(User $user, ?string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $user->id,
            'cancellation_reason' => $reason,
        ]);
    }

    public function complete(?string $notes = null): void
    {
        $data = ['status' => 'completed'];
        if ($notes) {
            $data['meeting_notes'] = $notes;
        }
        $this->update($data);
    }

    public function markNoShow(): void
    {
        $this->update(['status' => 'no_show']);
    }

    public function confirm(): void
    {
        $this->update(['status' => 'confirmed']);
    }

    public function getEndTimeAttribute(): \Carbon\Carbon
    {
        return $this->scheduled_at->addMinutes($this->duration_minutes);
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'advising' => 'Academic Advising',
            'registration' => 'Registration Assistance',
            'career' => 'Career Counseling',
            'academic' => 'Academic Support',
            'personal' => 'Personal Consultation',
            'other' => 'Other',
            default => ucfirst($this->type),
        };
    }

    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'scheduled' => 'Scheduled',
            'confirmed' => 'Confirmed',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'no_show' => 'No Show',
            default => ucfirst($this->status),
        };
    }
}
