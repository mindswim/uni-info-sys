<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'student_id', 'document_type', 'file_path', 'original_filename', 
        'mime_type', 'file_size', 'status', 'version', 'is_active', 'uploaded_at'
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scope to get only active documents
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get all versions of a document type for a student
     */
    public function scopeForStudentAndType($query, $studentId, $documentType)
    {
        return $query->where('student_id', $studentId)
                    ->where('document_type', $documentType);
    }

    /**
     * Get the next version number for a student and document type
     */
    public static function getNextVersionNumber($studentId, $documentType): int
    {
        $maxVersion = static::query()->forStudentAndType($studentId, $documentType)->max('version');
        return ($maxVersion ?? 0) + 1;
    }

    /**
     * Deactivate all previous versions of this document type for the student
     */
    public static function deactivatePreviousVersions($studentId, $documentType): void
    {
        static::query()->forStudentAndType($studentId, $documentType)
              ->update(['is_active' => false]);
    }
}
