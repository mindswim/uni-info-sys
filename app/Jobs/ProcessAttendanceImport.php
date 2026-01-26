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

    protected function getValidationMessages(): array
    {
        return [
            'enrollment_id.required' => 'Enrollment ID is required',
            'enrollment_id.exists' => 'Enrollment ID does not exist',
            'course_section_id.required' => 'Course section ID is required',
            'course_section_id.exists' => 'Course section ID does not exist',
            'student_id.required' => 'Student ID is required',
            'student_id.exists' => 'Student ID does not exist',
            'attendance_date.required' => 'Attendance date is required',
            'attendance_date.date' => 'Attendance date must be a valid date',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be one of: present, absent, late, excused',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $existingRecord = AttendanceRecord::where('enrollment_id', $data['enrollment_id'])
            ->where('attendance_date', $data['attendance_date'])
            ->first();

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

        if ($existingRecord) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }
        $stats['successful']++;
    }
}
