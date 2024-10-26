<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'academic_year', 'semester', 'status',
        'application_date', 'decision_date', 'decision_status', 'comments'
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
}
