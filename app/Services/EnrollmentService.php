<?php

namespace App\Services;

use App\Exceptions\CourseSectionUnavailableException;
use App\Exceptions\DuplicateEnrollmentException;
use App\Exceptions\EnrollmentCapacityExceededException;
use App\Exceptions\StudentNotActiveException;
use App\Jobs\SendEnrollmentConfirmation;
use App\Jobs\ProcessWaitlistPromotion;
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

            // Check prerequisites
            $this->checkPrerequisites($studentId, $courseSectionId);

            // Check schedule conflicts
            $this->checkScheduleConflicts($studentId, $courseSectionId);

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
     * Withdraw a student from a course section
     *
     * @param Enrollment $enrollment
     * @return bool
     * @throws CourseSectionUnavailableException
     */
    public function withdrawStudent(Enrollment $enrollment): bool
    {
        return DB::transaction(function () use ($enrollment) {
            $courseSection = $enrollment->courseSection;
            
            // Check if withdrawal is within the add/drop deadline
            if ($courseSection->term && !$courseSection->term->isWithinAddDropPeriod()) {
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

        // Check if enrollment is within the add/drop deadline
        if ($courseSection->term && !$courseSection->term->isWithinAddDropPeriod()) {
            throw new CourseSectionUnavailableException('The add/drop deadline for this term has passed. Enrollment is no longer allowed.');
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

    /**
     * Check prerequisites for the student to enroll in the course section
     *
     * @param int $studentId
     * @param int $courseSectionId
     * @throws \App\Exceptions\PrerequisiteNotMetException
     */
    private function checkPrerequisites(int $studentId, int $courseSectionId): void
    {
        $courseSection = CourseSection::with('course.prerequisites')->find($courseSectionId);
        $student = Student::find($studentId);
        
        if (!$courseSection || !$student) {
            return; // Should have been caught by earlier validations
        }
        
        $course = $courseSection->course;
        $prerequisites = $course->prerequisites;
        
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
                
            if (!$hasPassed) {
                $unmetPrerequisites[] = $prerequisite->course_code . ' - ' . $prerequisite->title;
            }
        }
        
        if (!empty($unmetPrerequisites)) {
                         throw new \App\Exceptions\PrerequisiteNotMetException(
                 'Missing prerequisites: ' . implode(', ', $unmetPrerequisites)
             );
         }
     }

     /**
      * Check for schedule conflicts with existing enrollments
      *
      * @param int $studentId
      * @param int $courseSectionId
      * @throws \App\Exceptions\DuplicateEnrollmentException
      */
     private function checkScheduleConflicts(int $studentId, int $courseSectionId): void
     {
         $newSection = CourseSection::find($courseSectionId);
         
         if (!$newSection || !$newSection->start_time || !$newSection->end_time || !$newSection->schedule_days) {
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
             
             if (!$existingSection->start_time || !$existingSection->end_time || !$existingSection->schedule_days) {
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
}  