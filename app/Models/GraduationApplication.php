<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GraduationApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'program_id',
        'term_id',
        'status',
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
}
