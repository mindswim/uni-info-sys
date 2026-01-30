<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GraduationApplication extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_CLEARANCE_IN_PROGRESS = 'clearance_in_progress';
    const STATUS_CLEARED = 'cleared';
    const STATUS_APPROVED = 'approved';
    const STATUS_DENIED = 'denied';

    const CLEARANCE_DEPARTMENTS = ['academic', 'financial', 'library', 'registrar'];

    const CLEARANCE_PENDING = 'pending';
    const CLEARANCE_CLEARED = 'cleared';
    const CLEARANCE_HOLD = 'hold';

    protected $fillable = [
        'student_id',
        'program_id',
        'term_id',
        'status',
        'clearance_status',
        'degree_audit_snapshot',
        'application_date',
        'ceremony_date',
        'special_requests',
        'reviewer_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'application_date' => 'date',
        'ceremony_date' => 'date',
        'reviewed_at' => 'datetime',
        'clearance_status' => 'array',
        'degree_audit_snapshot' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isFullyCleared(): bool
    {
        $clearance = $this->clearance_status;
        if (!$clearance) {
            return false;
        }

        foreach (self::CLEARANCE_DEPARTMENTS as $dept) {
            if (!isset($clearance[$dept]) || $clearance[$dept]['status'] !== self::CLEARANCE_CLEARED) {
                return false;
            }
        }

        return true;
    }

    public function getClearanceSummary(): array
    {
        $clearance = $this->clearance_status ?? [];
        $cleared = 0;
        $pending = 0;
        $hold = 0;

        foreach (self::CLEARANCE_DEPARTMENTS as $dept) {
            $status = $clearance[$dept]['status'] ?? self::CLEARANCE_PENDING;
            match ($status) {
                self::CLEARANCE_CLEARED => $cleared++,
                self::CLEARANCE_HOLD => $hold++,
                default => $pending++,
            };
        }

        return [
            'total' => count(self::CLEARANCE_DEPARTMENTS),
            'cleared' => $cleared,
            'pending' => $pending,
            'hold' => $hold,
        ];
    }
}
