<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rubric extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'created_by',
        'max_points',
        'is_template',
    ];

    protected $casts = [
        'max_points' => 'decimal:2',
        'is_template' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(Staff::class, 'created_by');
    }

    public function criteria()
    {
        return $this->hasMany(RubricCriteria::class)->orderBy('sort_order');
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function scopeTemplates($query)
    {
        return $query->where('is_template', true);
    }

    public function duplicate(): self
    {
        $clone = $this->replicate();
        $clone->title = $this->title . ' (Copy)';
        $clone->is_template = false;
        $clone->save();

        foreach ($this->criteria as $criteria) {
            $newCriteria = $criteria->replicate();
            $newCriteria->rubric_id = $clone->id;
            $newCriteria->save();

            foreach ($criteria->levels as $level) {
                $newLevel = $level->replicate();
                $newLevel->rubric_criteria_id = $newCriteria->id;
                $newLevel->save();
            }
        }

        return $clone->load('criteria.levels');
    }
}
