<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationTimeTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'term_id',
        'priority_group',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public const PRIORITY_GROUPS = ['senior', 'junior', 'sophomore', 'freshman', 'honors', 'athletes', 'general'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function canRegisterNow(): bool
    {
        $now = now();

        return $now->gte($this->start_time) && $now->lte($this->end_time);
    }

    public function isUpcoming(): bool
    {
        return now()->lt($this->start_time);
    }

    public function isExpired(): bool
    {
        return now()->gt($this->end_time);
    }
}
