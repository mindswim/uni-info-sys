<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'amount',
        'amount_type',
        'renewable',
        'max_semesters',
        'min_gpa_required',
        'min_sat_required',
        'min_act_required',
        'max_family_income',
        'available_slots',
        'slots_awarded',
        'department_id',
        'program_id',
        'is_active',
        'application_deadline',
        'eligibility_criteria',
        'required_documents',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'min_gpa_required' => 'decimal:2',
        'max_family_income' => 'decimal:2',
        'renewable' => 'boolean',
        'is_active' => 'boolean',
        'application_deadline' => 'date',
    ];

    public const TYPES = [
        'merit' => 'Merit-Based',
        'need' => 'Need-Based',
        'athletic' => 'Athletic',
        'departmental' => 'Departmental',
        'external' => 'External',
        'endowed' => 'Endowed',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function aidAwards(): HasMany
    {
        return $this->hasMany(AidAward::class);
    }

    public function hasAvailableSlots(): bool
    {
        if ($this->available_slots === null) {
            return true;
        }

        return $this->slots_awarded < $this->available_slots;
    }

    public function isEligible(Student $student): bool
    {
        if ($this->min_gpa_required && $student->gpa < $this->min_gpa_required) {
            return false;
        }
        if ($this->min_sat_required && $student->sat_score < $this->min_sat_required) {
            return false;
        }
        if ($this->min_act_required && $student->act_score < $this->min_act_required) {
            return false;
        }
        if ($this->department_id && $student->major_program?->department_id !== $this->department_id) {
            return false;
        }
        if ($this->program_id && $student->major_program_id !== $this->program_id) {
            return false;
        }

        return true;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeWithAvailableSlots($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('available_slots')
                ->orWhereColumn('slots_awarded', '<', 'available_slots');
        });
    }
}
