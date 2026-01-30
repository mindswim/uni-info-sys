<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxForm1098T extends Model
{
    use HasFactory;

    protected $table = 'tax_forms_1098t';

    protected $fillable = [
        'student_id',
        'tax_year',
        'qualified_tuition',
        'scholarships_grants',
        'adjustments',
        'billing_method',
        'institution_ein',
        'institution_name',
        'institution_address',
        'student_ssn_last4',
        'generated_at',
        'status',
    ];

    protected $casts = [
        'qualified_tuition' => 'decimal:2',
        'scholarships_grants' => 'decimal:2',
        'adjustments' => 'decimal:2',
        'generated_at' => 'datetime',
        'tax_year' => 'integer',
        'student_ssn_last4' => 'encrypted',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function scopeForYear($query, int $year)
    {
        return $query->where('tax_year', $year);
    }

    public function scopeFinal($query)
    {
        return $query->where('status', 'final');
    }

    public function getNetAmountAttribute(): float
    {
        return $this->qualified_tuition - $this->scholarships_grants + $this->adjustments;
    }
}
