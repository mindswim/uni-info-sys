<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'course_code',
        'course_number',
        'title',
        'description',
        'credits',
        'level',
        'prerequisites',
        'department_id',
    ];

    protected $casts = [
        'prerequisites' => 'array',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function prerequisiteCourses()
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'course_id', 'prerequisite_id');
    }

    public function isPrerequisiteFor()
    {
        return $this->belongsToMany(Course::class, 'course_prerequisites', 'prerequisite_id', 'course_id');
    }

    public function sections()
    {
        return $this->hasMany(CourseSection::class);
    }

    // Course numbering and level classification methods based on research
    public static function validateCourseCode(string $code): bool
    {
        // Format: DEPT ### [suffix] (e.g., CS 101, MATH 151H, EE 240AC)
        return preg_match('/^[A-Z]{2,5}\s[0-9]{1,4}[A-Z]*$/', $code);
    }

    public function getCourseLevel(): string
    {
        if ($this->level) {
            return $this->level;
        }

        // Extract numeric portion from course code
        if (preg_match('/([0-9]+)/', $this->course_code, $matches)) {
            $number = intval($matches[1]);

            if ($number < 100) {
                return 'lower_division';
            }
            if ($number < 200) {
                return 'upper_division';
            }
            if ($number < 300) {
                return 'graduate';
            }

            return 'advanced_graduate';
        }

        return 'lower_division';
    }

    public function extractCourseNumber(): string
    {
        if (preg_match('/([0-9]+[A-Z]*)/', $this->course_code, $matches)) {
            return $matches[1];
        }

        return '';
    }

    // Auto-populate course_number and level on save
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($course) {
            if (! $course->course_number) {
                $course->course_number = $course->extractCourseNumber();
            }

            if (! $course->level) {
                $course->level = $course->getCourseLevel();
            }
        });
    }
}
