<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'name',
        'code',
        'chair_id',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function chair()
    {
        return $this->belongsTo(Staff::class, 'chair_id');
    }

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    public function courses()
    {
        return $this->hasManyThrough(Course::class, Program::class);
    }
}
