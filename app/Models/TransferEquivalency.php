<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransferEquivalency extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_institution',
        'external_course_code',
        'internal_course_id',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function internalCourse()
    {
        return $this->belongsTo(Course::class, 'internal_course_id');
    }

    public function approver()
    {
        return $this->belongsTo(Staff::class, 'approved_by');
    }
}
