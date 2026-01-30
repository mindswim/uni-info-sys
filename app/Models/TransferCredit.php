<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferCredit extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'external_institution',
        'external_course_code',
        'external_course_name',
        'external_credits',
        'equivalent_course_id',
        'credits_awarded',
        'grade_awarded',
        'status',
        'evaluated_by',
        'evaluated_at',
        'notes',
    ];

    protected $casts = [
        'external_credits' => 'decimal:2',
        'credits_awarded' => 'decimal:2',
        'evaluated_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function equivalentCourse()
    {
        return $this->belongsTo(Course::class, 'equivalent_course_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(Staff::class, 'evaluated_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }
}
