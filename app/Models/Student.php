<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Student extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'user_id', 'student_number', 'first_name', 'last_name',
        'date_of_birth', 'gender', 'nationality', 'address',
        'city', 'state', 'postal_code', 'country', 'phone',
        'emergency_contact_name', 'emergency_contact_phone',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function academicRecords()
    {
        return $this->hasMany(AcademicRecord::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function admissionApplications()
    {
        return $this->hasMany(AdmissionApplication::class);
    }

    public function hasCompleteProfile(): bool
    {
        return !empty($this->address) &&
               !empty($this->phone) &&
               !empty($this->emergency_contact_name) &&
               !empty($this->emergency_contact_phone);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
