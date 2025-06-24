<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Student extends Model implements Auditable
{
    use HasFactory;
    use SoftDeletes;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'user_id', 'student_number', 'first_name', 'last_name',
        'date_of_birth', 'gender', 'nationality', 'address',
        'city', 'state', 'postal_code', 'country', 'phone',
        'emergency_contact_name', 'emergency_contact_phone',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function academicRecords()
    {
        return $this->hasMany(AcademicRecord::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class)->where('is_active', true);
    }

    public function allDocuments()
    {
        return $this->hasMany(Document::class)->orderBy('version', 'desc');
    }

    public function admissionApplications()
    {
        return $this->hasMany(AdmissionApplication::class);
    }

    public function hasCompleteProfile(): bool
    {
        return !empty($this->address) &&
               !empty($this->phone) &&
               !empty($this->emergency_contact_name) &&
               !empty($this->emergency_contact_phone);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Calculate GPA based on completed enrollments
     *
     * @return float
     */
    public function calculateGPA(): float
    {
        $gradePoints = [
            'A+' => 4.0, 'A' => 4.0, 'A-' => 3.7,
            'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
            'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
            'D+' => 1.3, 'D' => 1.0, 'D-' => 0.7,
            'F' => 0.0
        ];

        $completedEnrollments = $this->enrollments()
            ->where('status', 'completed')
            ->whereNotNull('grade')
            ->whereIn('grade', array_keys($gradePoints))
            ->with('courseSection.course')
            ->get();

        if ($completedEnrollments->isEmpty()) {
            return 0.0;
        }

        $totalPoints = 0;
        $totalCredits = 0;

        foreach ($completedEnrollments as $enrollment) {
            $credits = $enrollment->courseSection->course->credits;
            $points = $gradePoints[$enrollment->grade] ?? 0;

            $totalPoints += ($points * $credits);
            $totalCredits += $credits;
        }

        return $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;
    }

    /**
     * Get current GPA (calculated)
     *
     * @return float
     */
    public function getCurrentGPAAttribute(): float
    {
        return $this->calculateGPA();
    }
}
