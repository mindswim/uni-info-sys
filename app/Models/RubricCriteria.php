<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RubricCriteria extends Model
{
    use HasFactory;

    protected $table = 'rubric_criteria';

    protected $fillable = [
        'rubric_id',
        'title',
        'description',
        'max_points',
        'sort_order',
    ];

    protected $casts = [
        'max_points' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function rubric()
    {
        return $this->belongsTo(Rubric::class);
    }

    public function levels()
    {
        return $this->hasMany(RubricLevel::class)->orderBy('sort_order');
    }
}
