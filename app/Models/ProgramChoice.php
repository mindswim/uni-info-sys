<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramChoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id', 'program_id', 'preference_order', 'status',
    ];

    public function admissionApplication()
    {
        return $this->belongsTo(AdmissionApplication::class, 'application_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
