<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class CourseSection extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;
    
    protected $fillable = ['course_id', 'term_id', 'instructor_id', 'room_id', 'section_number', 'capacity', 'schedule_days', 'start_time', 'end_time', 'status'];

    protected $casts = [
        'schedule_days' => 'array',
    ];

    public function course() { return $this->belongsTo(Course::class); }
    public function term() { return $this->belongsTo(Term::class); }
    public function instructor() { return $this->belongsTo(Staff::class, 'instructor_id'); }
    public function room() { return $this->belongsTo(Room::class); }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function classSessions()
    {
        return $this->hasMany(ClassSession::class);
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
}
