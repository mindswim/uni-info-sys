<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Term extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'academic_year', 'semester', 'start_date', 'end_date'];
    
    public function admissionApplications()
    {
        return $this->hasMany(AdmissionApplication::class);
    }
}
