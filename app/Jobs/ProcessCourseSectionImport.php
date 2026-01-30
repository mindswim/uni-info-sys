<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Term;

class ProcessCourseSectionImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Course Sections';
    }

    protected function getRequiredHeaders(): array
    {
        return [
            'course_code',
            'term_code',
            'section_number',
            'capacity',
            'schedule_days',
            'start_time',
            'end_time',
        ];
    }

    protected function getOptionalHeaders(): array
    {
        return [
            'instructor_email',
            'room_code',
            'status',
        ];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'course_code' => 'required|string',
            'term_code' => 'required|string|exists:terms,code',
            'section_number' => 'required|string|max:10',
            'capacity' => 'required|integer|min:1',
            'schedule_days' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'instructor_email' => 'nullable|email|exists:users,email',
            'room_code' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive,Cancelled',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'course_code.required' => 'Course code is required',
            'term_code.required' => 'Term code is required',
            'term_code.exists' => 'Term does not exist',
            'section_number.required' => 'Section number is required',
            'capacity.required' => 'Capacity is required',
            'schedule_days.required' => 'Schedule days are required',
            'start_time.required' => 'Start time is required',
            'end_time.required' => 'End time is required',
            'end_time.after' => 'End time must be after start time',
            'instructor_email.exists' => 'Instructor email not found',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        // Find course
        $course = Course::where('course_code', $data['course_code'])->first();
        if (! $course) {
            throw new \Exception("Course '{$data['course_code']}' not found");
        }

        // Find term
        $term = Term::where('code', $data['term_code'])->first();
        if (! $term) {
            throw new \Exception("Term '{$data['term_code']}' not found");
        }

        // Find instructor if provided
        $instructorId = null;
        if (! empty($data['instructor_email'])) {
            $user = \App\Models\User::where('email', $data['instructor_email'])->first();
            if ($user) {
                $staff = Staff::where('user_id', $user->id)->first();
                if ($staff) {
                    $instructorId = $staff->id;
                }
            }
        }

        // Find room if provided
        $roomId = null;
        if (! empty($data['room_code'])) {
            // room_code format: "BUILDING-ROOM" e.g. "SCI-101"
            $parts = explode('-', $data['room_code']);
            if (count($parts) === 2) {
                $buildingCode = $parts[0];
                $roomNumber = $parts[1];

                $room = Room::whereHas('building', function ($query) use ($buildingCode) {
                    $query->where('code', $buildingCode);
                })->where('room_number', $roomNumber)->first();

                if ($room) {
                    $roomId = $room->id;
                }
            }
        }

        // Parse schedule days (comma-separated: "Monday,Wednesday,Friday")
        $scheduleDays = array_map('trim', explode(',', $data['schedule_days']));

        // Check if section already exists
        $existingSection = CourseSection::where('course_id', $course->id)
            ->where('term_id', $term->id)
            ->where('section_number', $data['section_number'])
            ->first();
        $isUpdate = $existingSection !== null;

        CourseSection::updateOrCreate(
            [
                'course_id' => $course->id,
                'term_id' => $term->id,
                'section_number' => $data['section_number'],
            ],
            [
                'instructor_id' => $instructorId,
                'room_id' => $roomId,
                'capacity' => $data['capacity'],
                'schedule_days' => $scheduleDays,
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'status' => $data['status'] ?? 'Active',
            ]
        );

        if ($isUpdate) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }

        $stats['successful']++;
    }
}
