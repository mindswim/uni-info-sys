<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Models\AttendanceRecord;
use App\Models\CourseSection;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use HandlesCsvImportExport;

    /**
     * Display attendance records with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = AttendanceRecord::with(['student.user', 'courseSection.course', 'enrollment', 'recordedBy.user']);

        // Filter by course section
        if ($request->has('course_section_id')) {
            $query->forCourseSection($request->course_section_id);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->forStudent($request->student_id);
        }

        // Filter by date
        if ($request->has('attendance_date')) {
            $query->forDate($request->attendance_date);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('attendance_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('attendance_date', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->latest('attendance_date')->paginate($request->get('per_page', 50));

        return response()->json($records);
    }

    /**
     * Record attendance for a single student
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|integer|exists:enrollments,id',
            'attendance_date' => 'required|date',
            'status' => 'required|string|in:present,absent,late,excused',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i|after:check_in_time',
            'notes' => 'nullable|string|max:500',
        ]);

        $enrollment = Enrollment::with('courseSection')->findOrFail($validated['enrollment_id']);

        $validated['course_section_id'] = $enrollment->course_section_id;
        $validated['student_id'] = $enrollment->student_id;
        $validated['recorded_by'] = auth()->user()->staff_id ?? null;

        $attendance = AttendanceRecord::create($validated);

        return response()->json([
            'message' => 'Attendance recorded successfully.',
            'data' => $attendance->load(['student.user', 'courseSection.course'])
        ], 201);
    }

    /**
     * Bulk record attendance for multiple students
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_section_id' => 'required|integer|exists:course_sections,id',
            'attendance_date' => 'required|date',
            'records' => 'required|array|min:1',
            'records.*.enrollment_id' => 'required|integer|exists:enrollments,id',
            'records.*.status' => 'required|string|in:present,absent,late,excused',
            'records.*.notes' => 'nullable|string|max:500',
        ]);

        $createdRecords = [];
        $errors = [];

        foreach ($validated['records'] as $record) {
            try {
                $enrollment = Enrollment::findOrFail($record['enrollment_id']);

                $attendance = AttendanceRecord::updateOrCreate(
                    [
                        'enrollment_id' => $record['enrollment_id'],
                        'attendance_date' => $validated['attendance_date'],
                    ],
                    [
                        'course_section_id' => $validated['course_section_id'],
                        'student_id' => $enrollment->student_id,
                        'status' => $record['status'],
                        'notes' => $record['notes'] ?? null,
                        'recorded_by' => auth()->user()->staff_id ?? null,
                    ]
                );

                $createdRecords[] = $attendance;
            } catch (\Exception $e) {
                $errors[] = [
                    'enrollment_id' => $record['enrollment_id'],
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => count($createdRecords) . ' attendance records saved successfully.',
            'data' => [
                'created' => count($createdRecords),
                'failed' => count($errors),
                'errors' => $errors
            ]
        ], 201);
    }

    /**
     * Display the specified attendance record
     */
    public function show(AttendanceRecord $attendanceRecord): JsonResponse
    {
        $attendanceRecord->load(['student.user', 'courseSection.course', 'enrollment', 'recordedBy.user']);

        return response()->json([
            'data' => $attendanceRecord
        ]);
    }

    /**
     * Update the specified attendance record
     */
    public function update(Request $request, AttendanceRecord $attendanceRecord): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:present,absent,late,excused',
            'check_in_time' => 'nullable|date_format:H:i',
            'check_out_time' => 'nullable|date_format:H:i|after:check_in_time',
            'notes' => 'nullable|string|max:500',
        ]);

        $attendanceRecord->update($validated);

        return response()->json([
            'message' => 'Attendance record updated successfully.',
            'data' => $attendanceRecord->fresh(['student.user', 'courseSection.course'])
        ]);
    }

    /**
     * Remove the specified attendance record
     */
    public function destroy(AttendanceRecord $attendanceRecord): JsonResponse
    {
        $attendanceRecord->delete();

        return response()->json([
            'message' => 'Attendance record deleted successfully.'
        ]);
    }

    /**
     * Get attendance statistics for a course section
     */
    public function courseStatistics(Request $request, CourseSection $courseSection): JsonResponse
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = AttendanceRecord::forCourseSection($courseSection->id);

        if ($startDate) {
            $query->where('attendance_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('attendance_date', '<=', $endDate);
        }

        $records = $query->get();

        $statistics = [
            'total_records' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'late' => $records->where('status', 'late')->count(),
            'excused' => $records->where('status', 'excused')->count(),
            'attendance_rate' => $records->count() > 0
                ? round(($records->where('status', 'present')->count() / $records->count()) * 100, 2)
                : 0,
        ];

        return response()->json([
            'data' => $statistics
        ]);
    }

    /**
     * Get attendance report for a student
     */
    public function studentReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'term_id' => 'sometimes|integer|exists:terms,id',
        ]);

        $query = AttendanceRecord::forStudent($validated['student_id'])
            ->with(['courseSection.course', 'courseSection.term']);

        if (isset($validated['term_id'])) {
            $query->whereHas('courseSection', function ($q) use ($validated) {
                $q->where('term_id', $validated['term_id']);
            });
        }

        $records = $query->get();

        $statistics = [
            'total_records' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'late' => $records->where('status', 'late')->count(),
            'excused' => $records->where('status', 'excused')->count(),
            'attendance_rate' => $records->count() > 0
                ? round(($records->where('status', 'present')->count() / $records->count()) * 100, 2)
                : 0,
            'by_course' => $records->groupBy('course_section_id')->map(function ($courseRecords) {
                $first = $courseRecords->first();
                return [
                    'course' => $first->courseSection->course->code . ' - ' . $first->courseSection->course->name,
                    'present' => $courseRecords->where('status', 'present')->count(),
                    'total' => $courseRecords->count(),
                    'rate' => $courseRecords->count() > 0
                        ? round(($courseRecords->where('status', 'present')->count() / $courseRecords->count()) * 100, 2)
                        : 0,
                ];
            })->values(),
        ];

        return response()->json([
            'data' => $statistics
        ]);
    }

    // CSV Import/Export Methods

    protected function getEntityName(): string
    {
        return 'attendance';
    }

    protected function getImportJobClass(): string
    {
        return \App\Jobs\ProcessAttendanceImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return [
            'enrollment_id',
            'course_section_id',
            'student_id',
            'attendance_date',
            'status',
            'check_in_time',
            'check_out_time',
            'notes',
            'recorded_by',
        ];
    }

    protected function getExportData(Request $request): \Illuminate\Support\Collection
    {
        return AttendanceRecord::with(['student', 'courseSection', 'enrollment'])
            ->orderBy('attendance_date', 'desc')->get();
    }

    protected function transformToRow($attendance): array
    {
        return [
            'enrollment_id' => $attendance->enrollment_id,
            'course_section_id' => $attendance->course_section_id,
            'student_id' => $attendance->student_id,
            'attendance_date' => $attendance->attendance_date?->format('Y-m-d'),
            'status' => $attendance->status,
            'check_in_time' => $attendance->check_in_time,
            'check_out_time' => $attendance->check_out_time,
            'notes' => $attendance->notes,
            'recorded_by' => $attendance->recorded_by,
        ];
    }
}
