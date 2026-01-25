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
        // Academic Performance
        'gpa', 'semester_gpa',
        // Academic Standing
        'class_standing', 'enrollment_status', 'academic_status',
        // Program Information
        'major_program_id', 'minor_program_id',
        // Academic Timeline
        'admission_date', 'expected_graduation_date', 'total_credits_earned', 'credits_in_progress',
        // Financial Information
        'financial_hold', 'receives_financial_aid',
        // Academic History
        'high_school', 'high_school_graduation_year', 'sat_score', 'act_score',
        // Contact Enhancement
        'preferred_name', 'pronouns', 'parent_guardian_name', 'parent_guardian_phone',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'admission_date' => 'date',
        'expected_graduation_date' => 'date',
        'gpa' => 'decimal:2',
        'semester_gpa' => 'decimal:2',
        'financial_hold' => 'boolean',
        'receives_financial_aid' => 'boolean',
        'total_credits_earned' => 'integer',
        'credits_in_progress' => 'integer',
        'sat_score' => 'integer',
        'act_score' => 'integer',
        'high_school_graduation_year' => 'integer',
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

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function financialAidPackages()
    {
        return $this->hasMany(FinancialAidPackage::class);
    }

    public function currentFinancialAidPackage()
    {
        return $this->hasOne(FinancialAidPackage::class)->latestOfMany();
    }

    public function majorProgram()
    {
        return $this->belongsTo(Program::class, 'major_program_id');
    }

    public function minorProgram()
    {
        return $this->belongsTo(Program::class, 'minor_program_id');
    }

    // Academic Status Helper Methods
    public function isInGoodStanding()
    {
        return $this->academic_status === 'good_standing';
    }

    public function calculateClassStanding()
    {
        $credits = $this->total_credits_earned;

        if ($credits >= 90) return 'senior';
        if ($credits >= 60) return 'junior';
        if ($credits >= 30) return 'sophomore';
        return 'freshman';
    }

    public function isFullTime()
    {
        return $this->enrollment_status === 'full_time';
    }

    public function getAcademicStatusColorAttribute()
    {
        return match($this->academic_status) {
            'good_standing' => 'green',
            'academic_warning' => 'yellow',
            'academic_probation' => 'orange',
            'academic_suspension' => 'red',
            default => 'gray'
        };
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

    /**
     * Get academic standing based on GPA and credit hours
     * 
     * @return array
     */
    public function getAcademicStanding(): array
    {
        $service = app(\App\Services\StudentService::class);
        return $service->getAcademicStanding($this);
    }

    /**
     * Get total completed credit hours
     *
     * @return int
     */
    public function getTotalCompletedCredits(): int
    {
        $service = app(\App\Services\StudentService::class);
        return $service->getTotalCompletedCredits($this);
    }

    /**
     * Check degree progress for a specific program
     *
     * @param int $programId
     * @return array
     */
    public function checkDegreeProgress(int $programId): array
    {
        $service = app(\App\Services\StudentService::class);
        return $service->checkDegreeProgress($this, $programId);
    }

    /**
     * Validate prerequisites for a course
     *
     * @param \App\Models\Course $course
     * @return array
     */
    public function validatePrerequisites(\App\Models\Course $course): array
    {
        $service = app(\App\Services\StudentService::class);
        return $service->validatePrerequisites($this, $course);
    }
}
