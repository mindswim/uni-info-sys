<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RubricLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'rubric_criteria_id',
        'title',
        'description',
        'points',
        'sort_order',
    ];

    protected $casts = [
        'points' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function criteria()
    {
        return $this->belongsTo(RubricCriteria::class, 'rubric_criteria_id');
    }
}
