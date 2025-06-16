<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'department_id', 'degree_level', 'duration',
        'description', 'requirements', 'capacity'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function programChoices()
    {
        return $this->hasMany(ProgramChoice::class);
    }
}
