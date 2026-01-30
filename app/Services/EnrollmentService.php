<?php

namespace App\Services;

use App\Exceptions\CourseSectionUnavailableException;
use App\Exceptions\CreditLimitExceededException;
use App\Exceptions\DuplicateEnrollmentException;
use App\Exceptions\EnrollmentCapacityExceededException;
use App\Exceptions\RegistrationHoldException;
use App\Exceptions\RegistrationNotOpenException;
use App\Exceptions\RepeatCourseException;
use App\Exceptions\StudentNotActiveException;
use App\Jobs\ProcessWaitlistPromotion;
use App\Jobs\SendEnrollmentConfirmation;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\EnrollmentApproval;
use App\Models\RegistrationTimeTicket;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnrollmentService
{
    /**
     * Enroll a student in a course section with business rule validation
     *
     * @throws RegistrationHoldException
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

            // Check registration time ticket
            $this->validateRegistrationTimeTicket($studentId, $courseSectionId);

            // Check for registration holds before anything else
            $this->validateNoRegistrationHold($studentId);

            // Validate student is active
            $this->validateStudentActive($studentId);

            // Check if advisor approval is required
            if ($this->requiresAdvisorApproval($studentId, $courseSectionId)) {
                return $this->createPendingApproval($studentId, $courseSectionId);
            }

            // Validate course section is available
            $this->validateCourseSectionAvailable($courseSectionId);

            // Check for duplicate enrollment
            $this->validateNoDuplicateEnrollment($studentId, $courseSectionId);

            // Check repeat course policy
            $this->checkRepeatCoursePolicy($studentId, $courseSectionId);

            // Check prerequisites
            $this->checkPrerequisites($studentId, $courseSectionId);

            // Check schedule conflicts
            $this->checkScheduleConflicts($studentId, $courseSectionId);

            // Check credit hour limit
            $this->checkCreditHourLimit($studentId, $courseSectionId);

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
     * Withdraw a student from a course section
     *
     * @throws CourseSectionUnavailableException
     */
    public function withdrawStudent(Enrollment $enrollment): bool
    {
        return DB::transaction(function () use ($enrollment) {
            $courseSection = $enrollment->courseSection;

            // Check if withdrawal is within the add/drop deadline
            if ($courseSection->term && ! $courseSection->term->isWithinAddDropPeriod()) {
                throw new CourseSectionUnavailableException('The add/drop deadline for this term has passed. Withdrawal is no longer allowed.');
            }

            $wasEnrolled = $enrollment->status === 'enrolled';

            // Update enrollment status to withdrawn
            $enrollment->update(['status' => 'withdrawn']);

            Log::info('Student withdrawn from course section', [
                'enrollment_id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'course_section_id' => $courseSection->id,
                'was_enrolled' => $wasEnrolled,
            ]);

            // If student was enrolled (not waitlisted), try to promote someone from waitlist
            if ($wasEnrolled) {
                ProcessWaitlistPromotion::dispatch($courseSection);

                Log::info('Waitlist promotion job dispatched', [
                    'course_section_id' => $courseSection->id,
                ]);
            }

            return true;
        });
    }

    /**
     * Validate that the student has no active registration holds
     *
     * @throws RegistrationHoldException
     */
    private function validateNoRegistrationHold(int $studentId): void
    {
        $student = Student::with(['activeHolds' => function ($query) {
            $query->where('prevents_registration', true);
        }])->find($studentId);

        if (! $student) {
            return; // Will be caught by validateStudentActive
        }

        $registrationHolds = $student->activeHolds;

        if ($registrationHolds->isNotEmpty()) {
            $holdDetails = $registrationHolds->map(fn ($hold) => [
                'id' => $hold->id,
                'type' => $hold->type,
                'reason' => $hold->reason,
                'placed_at' => $hold->placed_at?->toIso8601String() ?? $hold->created_at->toIso8601String(),
            ])->all();

            throw new RegistrationHoldException(
                'Cannot enroll: student has '.$registrationHolds->count().' active registration hold(s). Resolve holds before registering.',
                $holdDetails
            );
        }
    }

    /**
     * Validate that the student is active and can enroll
     *
     * @throws StudentNotActiveException
     */
    private function validateStudentActive(int $studentId): void
    {
        $student = Student::with('user')->find($studentId);

        if (! $student) {
            throw new StudentNotActiveException('The selected student does not exist.');
        }

        // Check if student's user account is active
        if (! $student->user || ! $student->user->email_verified_at) {
            throw new StudentNotActiveException('The student account is not active or verified.');
        }
    }

    /**
     * Validate that the course section is available for enrollment
     *
     * @throws CourseSectionUnavailableException
     */
    private function validateCourseSectionAvailable(int $courseSectionId): void
    {
        $courseSection = CourseSection::with('term')->find($courseSectionId);

        if (! $courseSection) {
            throw new CourseSectionUnavailableException('The selected course section does not exist.');
        }

        // Check if the term is current or future (basic enrollment timing)
        if ($courseSection->term && $courseSection->term->end_date < now()->toDateString()) {
            throw new CourseSectionUnavailableException('Cannot enroll in a course section from a past term.');
        }

        // Check if enrollment is within the add/drop deadline
        if ($courseSection->term && ! $courseSection->term->isWithinAddDropPeriod()) {
            throw new CourseSectionUnavailableException('The add/drop deadline for this term has passed. Enrollment is no longer allowed.');
        }
    }

    /**
     * Validate that the student is not already enrolled in this course section
     *
     * @throws DuplicateEnrollmentException
     */
    private function validateNoDuplicateEnrollment(int $studentId, int $courseSectionId): void
    {
        $existingEnrollment = Enrollment::where('student_id', $studentId)
            ->where('course_section_id', $courseSectionId)
            ->whereIn('status', ['enrolled', 'waitlisted'])
            ->first();

        if ($existingEnrollment) {
            throw new DuplicateEnrollmentException;
        }
    }

    /**
     * Determine enrollment status based on capacity and requested status
     *
     * @throws EnrollmentCapacityExceededException
     */
    private function determineEnrollmentStatus(int $courseSectionId, ?string $requestedStatus): string
    {
        $courseSection = CourseSection::withCount([
            'enrollments' => function ($query) {
                $query->where('status', 'enrolled');
            },
        ])->find($courseSectionId);

        $enrolledCount = $courseSection->enrollments_count;
        $capacity = $courseSection->capacity;
        $availableSpots = $capacity - $enrolledCount;

        // If no status provided, determine automatically
        if (! $requestedStatus) {
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

    /**
     * Check prerequisites for the student to enroll in the course section
     *
     * @throws \App\Exceptions\PrerequisiteNotMetException
     */
    private function checkPrerequisites(int $studentId, int $courseSectionId): void
    {
        $courseSection = CourseSection::with('course.prerequisiteCourses')->find($courseSectionId);
        $student = Student::find($studentId);

        if (! $courseSection || ! $student) {
            return; // Should have been caught by earlier validations
        }

        $course = $courseSection->course;
        $prerequisites = $course->prerequisiteCourses;

        if ($prerequisites->isEmpty()) {
            return; // No prerequisites required
        }

        $unmetPrerequisites = [];

        foreach ($prerequisites as $prerequisite) {
            // Check if student has passed this prerequisite course
            $hasPassed = $student->enrollments()
                ->whereHas('courseSection.course', function ($query) use ($prerequisite) {
                    $query->where('id', $prerequisite->id);
                })
                ->where('status', 'completed')
                ->where('grade', 'NOT LIKE', 'F')
                ->where('grade', 'NOT LIKE', 'W')
                ->whereNotNull('grade')
                ->exists();

            if (! $hasPassed) {
                $unmetPrerequisites[] = $prerequisite->course_code.' - '.$prerequisite->title;
            }
        }

        if (! empty($unmetPrerequisites)) {
            throw new \App\Exceptions\PrerequisiteNotMetException(
                'Missing prerequisites: '.implode(', ', $unmetPrerequisites)
            );
        }
    }

    /**
     * Check for schedule conflicts with existing enrollments
     *
     * @throws \App\Exceptions\DuplicateEnrollmentException
     */
    private function checkScheduleConflicts(int $studentId, int $courseSectionId): void
    {
        $newSection = CourseSection::find($courseSectionId);

        if (! $newSection || ! $newSection->start_time || ! $newSection->end_time || ! $newSection->schedule_days) {
            return; // Can't check conflicts without complete schedule info
        }

        // Get student's active enrollments in the same term
        $conflictingEnrollments = Enrollment::where('student_id', $studentId)
            ->whereIn('status', ['enrolled', 'waitlisted'])
            ->whereHas('courseSection', function ($query) use ($newSection) {
                $query->where('term_id', $newSection->term_id);
            })
            ->with('courseSection.course')
            ->get();

        foreach ($conflictingEnrollments as $enrollment) {
            $existingSection = $enrollment->courseSection;

            if (! $existingSection->start_time || ! $existingSection->end_time || ! $existingSection->schedule_days) {
                continue; // Skip sections without complete schedule info
            }

            // Check if days overlap
            $newDays = is_array($newSection->schedule_days) ? $newSection->schedule_days : [$newSection->schedule_days];
            $existingDays = is_array($existingSection->schedule_days) ? $existingSection->schedule_days : [$existingSection->schedule_days];

            $daysOverlap = array_intersect($newDays, $existingDays);

            if (empty($daysOverlap)) {
                continue; // No day overlap, no conflict
            }

            // Check if times overlap
            $newStart = strtotime($newSection->start_time);
            $newEnd = strtotime($newSection->end_time);
            $existingStart = strtotime($existingSection->start_time);
            $existingEnd = strtotime($existingSection->end_time);

            // Times overlap if: new_start < existing_end AND new_end > existing_start
            if ($newStart < $existingEnd && $newEnd > $existingStart) {
                throw new \App\Exceptions\DuplicateEnrollmentException(
                    sprintf(
                        'Schedule conflict with %s (%s) on %s from %s to %s',
                        $existingSection->course->course_code,
                        $existingSection->course->title,
                        implode(', ', $daysOverlap),
                        date('g:i A', $existingStart),
                        date('g:i A', $existingEnd)
                    )
                );
            }
        }
    }

    /**
     * Check credit hour limit for the term
     *
     * @throws CreditLimitExceededException
     */
    private function checkCreditHourLimit(int $studentId, int $courseSectionId): void
    {
        $courseSection = CourseSection::with('course')->find($courseSectionId);

        if (! $courseSection || ! $courseSection->course) {
            return;
        }

        $attemptedCredits = $courseSection->course->credits ?? 0;
        if ($attemptedCredits <= 0) {
            return;
        }

        // Sum credits for enrolled + waitlisted enrollments in the same term
        $enrollments = Enrollment::where('student_id', $studentId)
            ->whereIn('status', ['enrolled', 'waitlisted'])
            ->whereHas('courseSection', function ($query) use ($courseSection) {
                $query->where('term_id', $courseSection->term_id);
            })
            ->with('courseSection.course')
            ->get();

        $currentCredits = $enrollments->sum(function ($enrollment) {
            return $enrollment->courseSection?->course?->credits ?? 0;
        });

        // Default max 18 credits per term; could be made configurable via system settings
        $maxCredits = 18;

        if (($currentCredits + $attemptedCredits) > $maxCredits) {
            throw new CreditLimitExceededException(
                (int) $currentCredits,
                $attemptedCredits,
                $maxCredits
            );
        }
    }

    /**
     * Validate registration time ticket allows enrollment now
     */
    private function validateRegistrationTimeTicket(int $studentId, int $courseSectionId): void
    {
        $courseSection = CourseSection::find($courseSectionId);
        if (! $courseSection || ! $courseSection->term_id) {
            return;
        }

        $ticket = RegistrationTimeTicket::where('student_id', $studentId)
            ->where('term_id', $courseSection->term_id)
            ->first();

        // If no ticket exists, allow enrollment (tickets are optional)
        if (! $ticket) {
            return;
        }

        if (! $ticket->canRegisterNow()) {
            throw new RegistrationNotOpenException(
                $ticket->start_time->format('M j, Y g:i A')
            );
        }
    }

    /**
     * Check if the student requires advisor approval for registration
     */
    private function requiresAdvisorApproval(int $studentId, int $courseSectionId): bool
    {
        $student = Student::find($studentId);

        return $student && $student->requires_advisor_approval && $student->advisor_id;
    }

    /**
     * Create a pending enrollment approval instead of direct enrollment
     */
    private function createPendingApproval(int $studentId, int $courseSectionId): Enrollment
    {
        $student = Student::find($studentId);

        EnrollmentApproval::create([
            'student_id' => $studentId,
            'advisor_id' => $student->advisor_id,
            'course_section_id' => $courseSectionId,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        // Return a temporary enrollment object with pending_approval status
        // The actual enrollment is created when the advisor approves
        $enrollment = new Enrollment([
            'student_id' => $studentId,
            'course_section_id' => $courseSectionId,
            'status' => 'pending_approval',
        ]);
        $enrollment->id = 0; // Sentinel value indicating no real enrollment yet

        Log::info('Enrollment requires advisor approval', [
            'student_id' => $studentId,
            'course_section_id' => $courseSectionId,
        ]);

        return $enrollment;
    }

    /**
     * Enroll a student from an approved enrollment approval
     */
    public function enrollFromApproval(EnrollmentApproval $approval): Enrollment
    {
        // Bypass the advisor approval check by calling the core enrollment logic
        return DB::transaction(function () use ($approval) {
            $studentId = $approval->student_id;
            $courseSectionId = $approval->course_section_id;

            $this->validateNoRegistrationHold($studentId);
            $this->validateStudentActive($studentId);
            $this->validateCourseSectionAvailable($courseSectionId);
            $this->validateNoDuplicateEnrollment($studentId, $courseSectionId);
            $this->checkRepeatCoursePolicy($studentId, $courseSectionId);
            $this->checkPrerequisites($studentId, $courseSectionId);
            $this->checkScheduleConflicts($studentId, $courseSectionId);
            $this->checkCreditHourLimit($studentId, $courseSectionId);

            $status = $this->determineEnrollmentStatus($courseSectionId, null);

            $enrollment = Enrollment::create([
                'student_id' => $studentId,
                'course_section_id' => $courseSectionId,
                'status' => $status,
            ]);

            $confirmationType = $status === 'waitlisted' ? 'waitlisted' : 'enrolled';
            SendEnrollmentConfirmation::dispatch($enrollment, $confirmationType);

            return $enrollment;
        });
    }

    /**
     * Check repeat course policy - prevent re-enrollment if student already passed
     *
     * @throws RepeatCourseException
     */
    private function checkRepeatCoursePolicy(int $studentId, int $courseSectionId): void
    {
        $courseSection = CourseSection::with('course')->find($courseSectionId);

        if (! $courseSection || ! $courseSection->course) {
            return;
        }

        $courseId = $courseSection->course->id;
        $failingGrades = ['F', 'W', 'D', 'D-'];

        // Find completed enrollments for the same course
        $completedEnrollment = Enrollment::where('student_id', $studentId)
            ->where('status', 'completed')
            ->whereNotNull('grade')
            ->whereNotIn('grade', $failingGrades)
            ->whereHas('courseSection', function ($query) use ($courseId) {
                $query->where('course_id', $courseId);
            })
            ->first();

        if ($completedEnrollment) {
            throw new RepeatCourseException(
                $courseSection->course->course_code,
                $completedEnrollment->grade
            );
        }
    }
}
