<?php

namespace App\Services;

use App\Models\ClassSession;
use App\Models\CourseSection;
use App\Models\Term;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClassSessionService
{
    /**
     * Day name to Carbon day constant mapping
     */
    private const DAY_MAP = [
        'Monday' => Carbon::MONDAY,
        'Tuesday' => Carbon::TUESDAY,
        'Wednesday' => Carbon::WEDNESDAY,
        'Thursday' => Carbon::THURSDAY,
        'Friday' => Carbon::FRIDAY,
        'Saturday' => Carbon::SATURDAY,
        'Sunday' => Carbon::SUNDAY,
        // Short forms
        'Mon' => Carbon::MONDAY,
        'Tue' => Carbon::TUESDAY,
        'Wed' => Carbon::WEDNESDAY,
        'Thu' => Carbon::THURSDAY,
        'Fri' => Carbon::FRIDAY,
        'Sat' => Carbon::SATURDAY,
        'Sun' => Carbon::SUNDAY,
        // Single letter abbreviations
        'M' => Carbon::MONDAY,
        'T' => Carbon::TUESDAY,
        'W' => Carbon::WEDNESDAY,
        'R' => Carbon::THURSDAY,
        'F' => Carbon::FRIDAY,
        'S' => Carbon::SATURDAY,
        'U' => Carbon::SUNDAY,
    ];

    /**
     * Generate all class sessions for a course section based on its schedule
     *
     * @param  array  $excludeDates  Dates to skip (holidays, breaks)
     * @return Collection<ClassSession>
     */
    public function generateSessionsForSection(
        CourseSection $courseSection,
        array $excludeDates = []
    ): Collection {
        $courseSection->load('term', 'course');

        if (! $courseSection->term) {
            throw new \InvalidArgumentException('Course section must have an associated term.');
        }

        if (! $courseSection->schedule_days || ! $courseSection->start_time || ! $courseSection->end_time) {
            throw new \InvalidArgumentException('Course section must have complete schedule information.');
        }

        return DB::transaction(function () use ($courseSection, $excludeDates) {
            // Delete existing sessions for this section
            $courseSection->classSessions()->delete();

            $sessions = collect();
            $term = $courseSection->term;
            $scheduleDays = $this->normalizeScheduleDays($courseSection->schedule_days);

            if (empty($scheduleDays)) {
                return $sessions;
            }

            $currentDate = Carbon::parse($term->start_date);
            $endDate = Carbon::parse($term->end_date);
            $sessionNumber = 1;

            while ($currentDate->lte($endDate)) {
                // Check if current day matches schedule
                if (in_array($currentDate->dayOfWeek, $scheduleDays)) {
                    $dateString = $currentDate->toDateString();

                    // Skip excluded dates (holidays, breaks)
                    if (! in_array($dateString, $excludeDates)) {
                        $session = ClassSession::create([
                            'course_section_id' => $courseSection->id,
                            'session_number' => $sessionNumber,
                            'session_date' => $dateString,
                            'start_time' => $courseSection->start_time,
                            'end_time' => $courseSection->end_time,
                            'status' => 'scheduled',
                        ]);

                        $sessions->push($session);
                        $sessionNumber++;
                    }
                }

                $currentDate->addDay();
            }

            Log::info('Generated class sessions', [
                'course_section_id' => $courseSection->id,
                'course_code' => $courseSection->course->course_code ?? 'N/A',
                'term' => $term->name,
                'sessions_created' => $sessions->count(),
            ]);

            return $sessions;
        });
    }

    /**
     * Generate sessions for all course sections in a term
     *
     * @return array Summary of generation results
     */
    public function generateSessionsForTerm(Term $term, array $excludeDates = []): array
    {
        $sections = $term->courseSections()
            ->whereNotNull('schedule_days')
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->get();

        $results = [
            'total_sections' => $sections->count(),
            'sections_processed' => 0,
            'total_sessions_created' => 0,
            'errors' => [],
        ];

        foreach ($sections as $section) {
            try {
                $sessions = $this->generateSessionsForSection($section, $excludeDates);
                $results['sections_processed']++;
                $results['total_sessions_created'] += $sessions->count();
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'course_section_id' => $section->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Get all sessions for a specific date across all sections
     *
     * @return Collection<ClassSession>
     */
    public function getSessionsForDate(string $date): Collection
    {
        return ClassSession::with(['courseSection.course', 'courseSection.instructor.user', 'courseSection.room.building'])
            ->forDate($date)
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get a student's sessions for a specific date
     *
     * @return Collection<ClassSession>
     */
    public function getStudentSessionsForDate(int $studentId, string $date): Collection
    {
        return ClassSession::with(['courseSection.course', 'courseSection.instructor.user', 'courseSection.room.building'])
            ->forDate($date)
            ->whereHas('courseSection.enrollments', function ($query) use ($studentId) {
                $query->where('student_id', $studentId)
                    ->whereIn('status', ['enrolled', 'waitlisted']);
            })
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get an instructor's sessions for a specific date
     *
     * @return Collection<ClassSession>
     */
    public function getInstructorSessionsForDate(int $staffId, string $date): Collection
    {
        return ClassSession::with(['courseSection.course', 'courseSection.room.building'])
            ->forDate($date)
            ->where(function ($query) use ($staffId) {
                $query->whereHas('courseSection', function ($q) use ($staffId) {
                    $q->where('instructor_id', $staffId);
                })
                    ->orWhere('substitute_instructor_id', $staffId);
            })
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Mark a session as completed
     *
     * @param  string|null  $description  What was covered
     */
    public function markSessionComplete(ClassSession $session, ?string $description = null): ClassSession
    {
        $session->update([
            'status' => 'completed',
            'description' => $description ?? $session->description,
        ]);

        Log::info('Session marked as completed', [
            'session_id' => $session->id,
            'course_section_id' => $session->course_section_id,
            'session_date' => $session->session_date->toDateString(),
        ]);

        return $session->fresh();
    }

    /**
     * Cancel a session
     */
    public function cancelSession(ClassSession $session, string $reason): ClassSession
    {
        $session->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        Log::info('Session cancelled', [
            'session_id' => $session->id,
            'course_section_id' => $session->course_section_id,
            'session_date' => $session->session_date->toDateString(),
            'reason' => $reason,
        ]);

        return $session->fresh();
    }

    /**
     * Reschedule a session to a new date/time
     */
    public function rescheduleSession(
        ClassSession $session,
        string $newDate,
        ?string $newStartTime = null,
        ?string $newEndTime = null,
        ?string $newLocation = null
    ): ClassSession {
        $updates = [
            'session_date' => $newDate,
            'status' => 'scheduled',
            'cancellation_reason' => null,
        ];

        if ($newStartTime) {
            $updates['start_time'] = $newStartTime;
        }
        if ($newEndTime) {
            $updates['end_time'] = $newEndTime;
        }
        if ($newLocation) {
            $updates['location_override'] = $newLocation;
        }

        $session->update($updates);

        Log::info('Session rescheduled', [
            'session_id' => $session->id,
            'new_date' => $newDate,
            'new_time' => $newStartTime ?? $session->start_time,
        ]);

        return $session->fresh();
    }

    /**
     * Assign a substitute instructor to a session
     */
    public function assignSubstitute(ClassSession $session, int $substituteStaffId): ClassSession
    {
        $session->update([
            'substitute_instructor_id' => $substituteStaffId,
        ]);

        Log::info('Substitute instructor assigned', [
            'session_id' => $session->id,
            'substitute_staff_id' => $substituteStaffId,
        ]);

        return $session->fresh(['substituteInstructor.user']);
    }

    /**
     * Get session statistics for a course section
     */
    public function getSectionSessionStats(CourseSection $courseSection): array
    {
        $sessions = $courseSection->classSessions;

        return [
            'total_sessions' => $sessions->count(),
            'completed' => $sessions->where('status', 'completed')->count(),
            'scheduled' => $sessions->where('status', 'scheduled')->count(),
            'cancelled' => $sessions->where('status', 'cancelled')->count(),
            'completion_rate' => $sessions->count() > 0
                ? round(($sessions->where('status', 'completed')->count() / $sessions->count()) * 100, 2)
                : 0,
            'upcoming_count' => $sessions->where('status', 'scheduled')
                ->where('session_date', '>=', now()->toDateString())
                ->count(),
        ];
    }

    /**
     * Normalize schedule days to Carbon day constants
     *
     * @param  array|string  $scheduleDays
     * @return array Carbon day constants (0-6)
     */
    private function normalizeScheduleDays($scheduleDays): array
    {
        if (is_string($scheduleDays)) {
            $scheduleDays = json_decode($scheduleDays, true) ?? [$scheduleDays];
        }

        if (! is_array($scheduleDays)) {
            return [];
        }

        $normalized = [];
        foreach ($scheduleDays as $day) {
            $day = trim($day);
            if (isset(self::DAY_MAP[$day])) {
                $normalized[] = self::DAY_MAP[$day];
            } elseif (is_numeric($day) && $day >= 0 && $day <= 6) {
                $normalized[] = (int) $day;
            }
        }

        return array_unique($normalized);
    }
}
