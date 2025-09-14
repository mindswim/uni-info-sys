<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'department_id', 
        'degree_level',
        'cip_code',
        'duration',
        'total_credit_hours',
        'description', 
        'requirements', 
        'capacity'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function programChoices()
    {
        return $this->hasMany(ProgramChoice::class);
    }

    public function degreeRequirements()
    {
        return $this->hasMany(DegreeRequirement::class);
    }

    // CIP Code helper methods based on research
    public function assignCIPCode(): string
    {
        $cipCodes = [
            'Bachelor of Computer Science' => '11.0701',
            'Master of Computer Science' => '11.0701',
            'Bachelor of Information Technology' => '11.0401', 
            'Bachelor of Software Engineering' => '14.0903',
            'Bachelor of Electrical Engineering' => '14.1001',
            'Master of Electrical Engineering' => '14.1001',
            'Bachelor of Mechanical Engineering' => '14.1901',
            'Bachelor of Civil Engineering' => '14.0801',
            'Bachelor of Mathematics' => '27.0101',
            'Master of Mathematics' => '27.0101',
            'Bachelor of Statistics' => '27.0501',
            'Bachelor of Physics' => '40.0801',
            'Bachelor of Chemistry' => '40.0501',
            'Bachelor of Biology' => '26.0101',
            'Bachelor of Business Administration' => '52.0201',
            'Master of Business Administration' => '52.0201',
            'Bachelor of Marketing' => '52.1401',
            'Bachelor of Finance' => '52.0801',
            'Bachelor of Accounting' => '52.0301',
            'Bachelor of Psychology' => '42.0101',
            'Bachelor of English' => '23.0101',
            'Bachelor of History' => '54.0101',
            'Bachelor of Political Science' => '45.1001',
            'Bachelor of Economics' => '45.0601'
        ];
        
        return $cipCodes[$this->name] ?? '00.0000';
    }

    public function getFormattedCipCodeAttribute(): string
    {
        return $this->cip_code ?: $this->assignCIPCode();
    }
}
