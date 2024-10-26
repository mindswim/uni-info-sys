<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'department', 'degree_level', 'duration',
        'description', 'requirements', 'capacity'
    ];

    public function programChoices()
    {
        return $this->hasMany(ProgramChoice::class);
    }
}
