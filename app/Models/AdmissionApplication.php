<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class AdmissionApplication extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    use SoftDeletes;

    protected $fillable = [
        'student_id', 'term_id', 'status',
        'application_date', 'decision_date', 'decision_status', 'comments',
    ];

    protected $casts = [
        'application_date' => 'datetime',
        'decision_date' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function programChoices()
    {
        return $this->hasMany(ProgramChoice::class, 'application_id');
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }
}
