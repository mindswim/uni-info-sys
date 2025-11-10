<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceLineItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'item_type',
        'description',
        'quantity',
        'unit_price',
        'amount',
        'enrollment_id',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the invoice that owns this line item
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the enrollment associated with this line item (if applicable)
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Calculate amount based on quantity and unit price
     */
    public function calculateAmount(): void
    {
        $this->amount = $this->quantity * $this->unit_price;
    }

    /**
     * Boot method to auto-calculate amount
     */
    protected static function booted(): void
    {
        static::saving(function (InvoiceLineItem $lineItem) {
            $lineItem->calculateAmount();
        });
    }
}
