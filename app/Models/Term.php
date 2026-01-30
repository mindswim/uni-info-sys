<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'academic_year', 'semester', 'start_date', 'end_date', 'add_drop_deadline', 'grade_deadline', 'is_current'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'add_drop_deadline' => 'datetime',
        'grade_deadline' => 'datetime',
    ];

    public function admissionApplications()
    {
        return $this->hasMany(AdmissionApplication::class);
    }

    public function courseSections()
    {
        return $this->hasMany(CourseSection::class);
    }

    /**
     * Check if enrollment/drop actions are allowed for this term
     */
    public function isWithinAddDropPeriod(): bool
    {
        if (! $this->add_drop_deadline) {
            return true; // No deadline set, allow enrollment
        }

        return now()->lt($this->add_drop_deadline);
    }
}
