<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseSection extends Model
{
    use HasFactory;
    
    protected $fillable = ['course_id', 'term_id', 'instructor_id', 'room_id', 'section_number', 'capacity', 'schedule_days', 'start_time', 'end_time'];

    public function course() { return $this->belongsTo(Course::class); }
    public function term() { return $this->belongsTo(Term::class); }
    public function instructor() { return $this->belongsTo(Staff::class, 'instructor_id'); }
    public function room() { return $this->belongsTo(Room::class); }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
