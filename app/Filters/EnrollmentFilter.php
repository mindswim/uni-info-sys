<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class EnrollmentFilter
{
    /**
     * Apply filters to the enrollment query
     */
    public function apply(Builder $query, array $filters): Builder
    {
        // Filter by student ID
        if (! empty($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        // Filter by course section ID
        if (! empty($filters['course_section_id'])) {
            $query->where('course_section_id', $filters['course_section_id']);
        }

        // Filter by enrollment status
        if (! empty($filters['status'])) {
            $statuses = is_array($filters['status']) ? $filters['status'] : [$filters['status']];
            $query->whereIn('status', $statuses);
        }

        // Filter by term ID through course section relationship
        if (! empty($filters['term_id'])) {
            $query->whereHas('courseSection', function ($q) use ($filters) {
                $q->where('term_id', $filters['term_id']);
            });
        }

        // Filter by course ID through course section relationship
        if (! empty($filters['course_id'])) {
            $query->whereHas('courseSection', function ($q) use ($filters) {
                $q->where('course_id', $filters['course_id']);
            });
        }

        // Filter by department ID through course section -> course relationship
        if (! empty($filters['department_id'])) {
            $query->whereHas('courseSection.course', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        // Filter by instructor ID through course section relationship
        if (! empty($filters['instructor_id'])) {
            $query->whereHas('courseSection', function ($q) use ($filters) {
                $q->where('instructor_id', $filters['instructor_id']);
            });
        }

        return $query;
    }
}
