<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'invoice_id',
        'total_amount',
        'number_of_installments',
        'installment_amount',
        'start_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'total_amount' => 'decimal:2',
        'installment_amount' => 'decimal:2',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(PaymentPlanInstallment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'active')
            ->whereHas('installments', function ($q) {
                $q->where('status', 'overdue');
            });
    }

    public function generateInstallments(): void
    {
        $startDate = $this->start_date->copy();

        for ($i = 1; $i <= $this->number_of_installments; $i++) {
            $this->installments()->create([
                'installment_number' => $i,
                'due_date' => $startDate->copy()->addMonths($i - 1),
                'amount' => $this->installment_amount,
                'paid_amount' => 0,
                'status' => 'pending',
            ]);
        }
    }
}
