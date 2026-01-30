<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'department_id',
        'job_title',
        'bio',
        'office_location',
        'phone',
        'specialization',
        'education',
        'office_hours',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function courseSections()
    {
        return $this->hasMany(CourseSection::class, 'instructor_id');
    }

    public function advisees()
    {
        return $this->hasMany(Student::class, 'advisor_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'advisor_id');
    }

    public function upcomingAppointments()
    {
        return $this->hasMany(Appointment::class, 'advisor_id')->upcoming();
    }

    public function officeHourSlots()
    {
        return $this->hasMany(OfficeHourSlot::class);
    }

    public function chairedDepartment()
    {
        return $this->hasOne(Department::class, 'chair_id');
    }
}
