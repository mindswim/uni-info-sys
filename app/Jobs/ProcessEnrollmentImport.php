<?php

namespace App\Jobs;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\CourseSection;

/**
 * Process Enrollment CSV Import
 *
 * Imports enrollments from CSV with the following columns:
 * - student_id, course_section_id, enrollment_date, status, grade, grade_date
 */
class ProcessEnrollmentImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Enrollments';
    }

    protected function getRequiredHeaders(): array
    {
        return [
            'student_id',
            'course_section_id',
        ];
    }

    protected function getOptionalHeaders(): array
    {
        return [
            'enrollment_date',
            'status',
            'grade',
            'grade_date',
        ];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'course_section_id' => 'required|exists:course_sections,id',
            'enrollment_date' => 'nullable|date',
            'status' => 'nullable|in:enrolled,dropped,withdrawn,completed,waitlisted',
            'grade' => 'nullable|string|max:3',
            'grade_date' => 'nullable|date',
        ];
    }

    protected function processRow(array $data): void
    {
        Enrollment::updateOrCreate(
            [
                'student_id' => $data['student_id'],
                'course_section_id' => $data['course_section_id'],
            ],
            [
                'enrollment_date' => $data['enrollment_date'] ?? now(),
                'status' => $data['status'] ?? 'enrolled',
                'grade' => $data['grade'] ?? null,
                'grade_date' => $data['grade_date'] ?? null,
            ]
        );
    }
}
