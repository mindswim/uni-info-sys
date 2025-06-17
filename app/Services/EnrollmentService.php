<?php

namespace App\Services;

use App\Exceptions\CourseSectionUnavailableException;
use App\Exceptions\DuplicateEnrollmentException;
use App\Exceptions\EnrollmentCapacityExceededException;
use App\Exceptions\StudentNotActiveException;
use App\Jobs\SendEnrollmentConfirmation;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnrollmentService
{
    /**
     * Enroll a student in a course section with business rule validation
     *
     * @param array $data
     * @return Enrollment
     * @throws StudentNotActiveException
     * @throws CourseSectionUnavailableException
     * @throws DuplicateEnrollmentException
     */
    public function enrollStudent(array $data): Enrollment
    {
        return DB::transaction(function () use ($data) {
            $studentId = $data['student_id'];
            $courseSectionId = $data['course_section_id'];
            $requestedStatus = $data['status'] ?? null;

            // Validate student is active
            $this->validateStudentActive($studentId);

            // Validate course section is available
            $this->validateCourseSectionAvailable($courseSectionId);

            // Check for duplicate enrollment
            $this->validateNoDuplicateEnrollment($studentId, $courseSectionId);

            // Determine enrollment status based on capacity
            $status = $this->determineEnrollmentStatus($courseSectionId, $requestedStatus);

            // Create the enrollment
            $enrollment = Enrollment::create([
                'student_id' => $studentId,
                'course_section_id' => $courseSectionId,
                'status' => $status,
            ]);

            Log::info('Enrollment created successfully', [
                'enrollment_id' => $enrollment->id,
                'student_id' => $studentId,
                'course_section_id' => $courseSectionId,
                'status' => $status,
            ]);

            // Dispatch notification job for enrollment confirmation
            $confirmationType = $status === 'waitlisted' ? 'waitlisted' : 'enrolled';
            SendEnrollmentConfirmation::dispatch($enrollment, $confirmationType);

            return $enrollment;
        });
    }

    /**
     * Promote the next student from waitlist to enrolled
     *
     * @param CourseSection $courseSection
     * @return Enrollment|null
     */
    public function promoteFromWaitlist(CourseSection $courseSection): ?Enrollment
    {
        return DB::transaction(function () use ($courseSection) {
            // Check if there's capacity
            $enrolledCount = $courseSection->enrollments()->where('status', 'enrolled')->count();

            if ($enrolledCount >= $courseSection->capacity) {
                Log::info('No capacity available for waitlist promotion', [
                    'course_section_id' => $courseSection->id,
                    'enrolled_count' => $enrolledCount,
                    'capacity' => $courseSection->capacity,
                ]);
                return null; // No capacity available
            }

            // Find the next waitlisted student (FIFO - first in, first out)
            $nextWaitlisted = $courseSection->enrollments()
                ->where('status', 'waitlisted')
                ->orderBy('created_at')
                ->first();

            if ($nextWaitlisted) {
                $nextWaitlisted->update(['status' => 'enrolled']);

                Log::info('Student promoted from waitlist', [
                    'enrollment_id' => $nextWaitlisted->id,
                    'student_id' => $nextWaitlisted->student_id,
                    'course_section_id' => $courseSection->id,
                ]);

                // Send notification to the student about waitlist promotion
                SendEnrollmentConfirmation::dispatch($nextWaitlisted, 'promoted');

                return $nextWaitlisted;
            }

            return null;
        });
    }

    /**
     * Validate that the student is active and can enroll
     *
     * @param int $studentId
     * @throws StudentNotActiveException
     */
    private function validateStudentActive(int $studentId): void
    {
        $student = Student::with('user')->find($studentId);

        if (!$student) {
            throw new StudentNotActiveException('The selected student does not exist.');
        }

        // Check if student's user account is active
        if (!$student->user || !$student->user->email_verified_at) {
            throw new StudentNotActiveException('The student account is not active or verified.');
        }
    }

    /**
     * Validate that the course section is available for enrollment
     *
     * @param int $courseSectionId
     * @throws CourseSectionUnavailableException
     */
    private function validateCourseSectionAvailable(int $courseSectionId): void
    {
        $courseSection = CourseSection::with('term')->find($courseSectionId);

        if (!$courseSection) {
            throw new CourseSectionUnavailableException('The selected course section does not exist.');
        }

        // Check if the term is current or future (basic enrollment timing)
        if ($courseSection->term && $courseSection->term->end_date < now()->toDateString()) {
            throw new CourseSectionUnavailableException('Cannot enroll in a course section from a past term.');
        }
    }

    /**
     * Validate that the student is not already enrolled in this course section
     *
     * @param int $studentId
     * @param int $courseSectionId
     * @throws DuplicateEnrollmentException
     */
    private function validateNoDuplicateEnrollment(int $studentId, int $courseSectionId): void
    {
        $existingEnrollment = Enrollment::where('student_id', $studentId)
            ->where('course_section_id', $courseSectionId)
            ->whereIn('status', ['enrolled', 'waitlisted'])
            ->first();

        if ($existingEnrollment) {
            throw new DuplicateEnrollmentException();
        }
    }

    /**
     * Determine enrollment status based on capacity and requested status
     *
     * @param int $courseSectionId
     * @param string|null $requestedStatus
     * @return string
     * @throws EnrollmentCapacityExceededException
     */
    private function determineEnrollmentStatus(int $courseSectionId, ?string $requestedStatus): string
    {
        $courseSection = CourseSection::withCount([
            'enrollments' => function ($query) {
                $query->where('status', 'enrolled');
            }
        ])->find($courseSectionId);

        $enrolledCount = $courseSection->enrollments_count;
        $capacity = $courseSection->capacity;
        $availableSpots = $capacity - $enrolledCount;

        // If no status provided, determine automatically
        if (!$requestedStatus) {
            if ($availableSpots > 0) {
                return 'enrolled';
            } else {
                return 'waitlisted';
            }
        }

        // If status is explicitly provided, validate it makes sense
        if ($requestedStatus === 'enrolled' && $availableSpots <= 0) {
            throw new EnrollmentCapacityExceededException(
                'Cannot enroll student directly - course section is at capacity. Student will be waitlisted.'
            );
        }

        return $requestedStatus;
    }
} 