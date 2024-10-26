<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'institution_name', 'qualification_type',
        'start_date', 'end_date', 'gpa', 'transcript_url', 'verified'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'verified' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
