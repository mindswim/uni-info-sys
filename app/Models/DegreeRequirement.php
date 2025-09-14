<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DegreeRequirement extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'program_id',
        'category', 
        'name',
        'description',
        'required_credit_hours',
        'min_courses',
        'max_courses',
        'min_gpa',
        'allowed_courses',
        'excluded_courses',
        'is_required',
        'sort_order'
    ];

    protected $casts = [
        'allowed_courses' => 'array',
        'excluded_courses' => 'array',
        'min_gpa' => 'decimal:2',
        'is_required' => 'boolean'
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    // Helper method to check if a course satisfies this requirement
    public function satisfiedByCourse(Course $course): bool
    {
        // Check if course is explicitly excluded
        if ($this->excluded_courses && in_array($course->id, $this->excluded_courses)) {
            return false;
        }

        // If specific courses are allowed, check if this course is in the list
        if ($this->allowed_courses && !empty($this->allowed_courses)) {
            return in_array($course->id, $this->allowed_courses);
        }

        // If no specific courses defined, any course in the same department could qualify
        // This would need more sophisticated matching logic in practice
        return true;
    }
}
