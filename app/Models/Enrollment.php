<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Enrollment extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = ['student_id', 'course_section_id', 'status', 'grade', 'enrollment_date'];

    protected $casts = [
        'enrollment_date' => 'datetime',
    ];

    /**
     * Auditing configuration - only audit updates to grade and status
     */
    protected $auditableEvents = [
        'updated',
    ];

    protected $auditInclude = [
        'grade',
        'status', // Also audit status changes e.g., 'enrolled' -> 'completed'
    ];

    /**
     * Temporary property to store reason for change during audit
     */
    public $reasonForChange = null;

    /**
     * Generate tags for the audit record
     */
    public function generateTags(): array
    {
        $tags = [];
        
        if ($this->reasonForChange) {
            $tags[] = "reason:{$this->reasonForChange}";
        }
        
        return $tags;
    }

    public function student() { return $this->belongsTo(Student::class); }
    public function courseSection() { return $this->belongsTo(CourseSection::class); }
}
