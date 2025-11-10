<?php

namespace App\Jobs;

use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use App\Models\CourseSection;
use App\Models\Student;

/**
 * Process Attendance CSV Import
 *
 * Imports attendance records from CSV with the following columns:
 * - enrollment_id, course_section_id, student_id, attendance_date, status
 * - check_in_time, check_out_time, notes, recorded_by
 */
class ProcessAttendanceImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Attendance Records';
    }

    protected function getRequiredHeaders(): array
    {
        return [
            'enrollment_id',
            'course_section_id',
            'student_id',
            'attendance_date',
            'status',
        ];
    }

    protected function getOptionalHeaders(): array
    {
        return [
            'check_in_time',
            'check_out_time',
            'notes',
            'recorded_by',
        ];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'enrollment_id' => 'required|exists:enrollments,id',
            'course_section_id' => 'required|exists:course_sections,id',
            'student_id' => 'required|exists:students,id',
            'attendance_date' => 'required|date',
            'status' => 'required|in:present,absent,late,excused',
            'check_in_time' => 'nullable|date_format:H:i:s',
            'check_out_time' => 'nullable|date_format:H:i:s',
            'notes' => 'nullable|string',
            'recorded_by' => 'nullable|exists:staff,id',
        ];
    }

    protected function processRow(array $data): void
    {
        AttendanceRecord::updateOrCreate(
            [
                'enrollment_id' => $data['enrollment_id'],
                'attendance_date' => $data['attendance_date'],
            ],
            [
                'course_section_id' => $data['course_section_id'],
                'student_id' => $data['student_id'],
                'status' => $data['status'],
                'check_in_time' => $data['check_in_time'] ?? null,
                'check_out_time' => $data['check_out_time'] ?? null,
                'notes' => $data['notes'] ?? null,
                'recorded_by' => $data['recorded_by'] ?? null,
            ]
        );
    }
}
