<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hold extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'type',
        'reason',
        'description',
        'severity',
        'prevents_registration',
        'prevents_transcript',
        'prevents_graduation',
        'placed_by',
        'department',
        'placed_at',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
    ];

    protected $casts = [
        'prevents_registration' => 'boolean',
        'prevents_transcript' => 'boolean',
        'prevents_graduation' => 'boolean',
        'placed_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    // Hold types
    public const TYPE_REGISTRATION = 'registration';

    public const TYPE_FINANCIAL = 'financial';

    public const TYPE_ACADEMIC = 'academic';

    public const TYPE_ADMINISTRATIVE = 'administrative';

    public const TYPE_IMMUNIZATION = 'immunization';

    public const TYPE_LIBRARY = 'library';

    public const TYPE_PARKING = 'parking';

    public const TYPES = [
        self::TYPE_REGISTRATION,
        self::TYPE_FINANCIAL,
        self::TYPE_ACADEMIC,
        self::TYPE_ADMINISTRATIVE,
        self::TYPE_IMMUNIZATION,
        self::TYPE_LIBRARY,
        self::TYPE_PARKING,
    ];

    // Severity levels
    public const SEVERITY_INFO = 'info';

    public const SEVERITY_WARNING = 'warning';

    public const SEVERITY_CRITICAL = 'critical';

    public const SEVERITIES = [
        self::SEVERITY_INFO,
        self::SEVERITY_WARNING,
        self::SEVERITY_CRITICAL,
    ];

    /**
     * Relationships
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function placedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'placed_by');
    }

    public function resolvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->whereNull('resolved_at');
    }

    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopePreventsRegistration($query)
    {
        return $query->where('prevents_registration', true)->active();
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', self::SEVERITY_CRITICAL);
    }

    /**
     * Helpers
     */
    public function isActive(): bool
    {
        return is_null($this->resolved_at);
    }

    public function resolve(User $user, ?string $notes = null): void
    {
        $this->update([
            'resolved_at' => now(),
            'resolved_by' => $user->id,
            'resolution_notes' => $notes,
        ]);
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            self::TYPE_REGISTRATION => 'Registration Hold',
            self::TYPE_FINANCIAL => 'Financial Hold',
            self::TYPE_ACADEMIC => 'Academic Hold',
            self::TYPE_ADMINISTRATIVE => 'Administrative Hold',
            self::TYPE_IMMUNIZATION => 'Immunization Hold',
            self::TYPE_LIBRARY => 'Library Hold',
            self::TYPE_PARKING => 'Parking Hold',
            default => 'Hold',
        };
    }

    public function getSeverityColor(): string
    {
        return match ($this->severity) {
            self::SEVERITY_INFO => 'blue',
            self::SEVERITY_WARNING => 'amber',
            self::SEVERITY_CRITICAL => 'red',
            default => 'gray',
        };
    }
}
