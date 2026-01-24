<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\CourseSection;
use App\Models\Enrollment;

class GradebookService
{
    /**
     * Letter grade scale (can be configured per institution)
     */
    protected const GRADE_SCALE = [
        'A+' => ['min' => 97, 'points' => 4.0],
        'A'  => ['min' => 93, 'points' => 4.0],
        'A-' => ['min' => 90, 'points' => 3.7],
        'B+' => ['min' => 87, 'points' => 3.3],
        'B'  => ['min' => 83, 'points' => 3.0],
        'B-' => ['min' => 80, 'points' => 2.7],
        'C+' => ['min' => 77, 'points' => 2.3],
        'C'  => ['min' => 73, 'points' => 2.0],
        'C-' => ['min' => 70, 'points' => 1.7],
        'D+' => ['min' => 67, 'points' => 1.3],
        'D'  => ['min' => 63, 'points' => 1.0],
        'D-' => ['min' => 60, 'points' => 0.7],
        'F'  => ['min' => 0,  'points' => 0.0],
    ];

    /**
     * Get student's current grade in a course
     */
    public function calculateCurrentGrade(Enrollment $enrollment): array
    {
        $section = $enrollment->courseSection;
        $assignments = $section->assignments()->where('is_published', true)->get();

        if ($assignments->isEmpty()) {
            return [
                'percentage' => null,
                'letter_grade' => null,
                'grade_points' => null,
                'graded_count' => 0,
                'total_assignments' => 0,
                'message' => 'No assignments in this course yet.',
            ];
        }

        // Get all graded submissions for this enrollment
        $submissions = AssignmentSubmission::where('enrollment_id', $enrollment->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->where('status', 'graded')
            ->get()
            ->keyBy('assignment_id');

        if ($submissions->isEmpty()) {
            return [
                'percentage' => null,
                'letter_grade' => null,
                'grade_points' => null,
                'graded_count' => 0,
                'total_assignments' => $assignments->count(),
                'message' => 'No graded submissions yet.',
            ];
        }

        // Calculate grade based on whether assignments are weighted
        $hasWeights = $assignments->whereNotNull('weight')->isNotEmpty();

        if ($hasWeights) {
            $result = $this->calculateWeightedGrade($assignments, $submissions);
        } else {
            $result = $this->calculateUnweightedGrade($assignments, $submissions);
        }

        return array_merge($result, [
            'graded_count' => $submissions->count(),
            'total_assignments' => $assignments->count(),
        ]);
    }

    /**
     * Calculate weighted grade (when assignments have weight percentages)
     */
    protected function calculateWeightedGrade($assignments, $submissions): array
    {
        $earnedWeight = 0;
        $totalGradedWeight = 0;

        foreach ($assignments as $assignment) {
            $submission = $submissions->get($assignment->id);

            if ($submission && $submission->final_score !== null) {
                $weight = $assignment->weight ?? 0;
                $percentage = $assignment->max_points > 0
                    ? ($submission->final_score / $assignment->max_points) * 100
                    : 0;

                $earnedWeight += ($percentage * $weight) / 100;
                $totalGradedWeight += $weight;
            }
        }

        // Calculate percentage based on graded work only
        $percentage = $totalGradedWeight > 0
            ? ($earnedWeight / $totalGradedWeight) * 100
            : null;

        return $this->buildGradeResult($percentage, $totalGradedWeight);
    }

    /**
     * Calculate unweighted grade (all assignments equal)
     */
    protected function calculateUnweightedGrade($assignments, $submissions): array
    {
        $totalEarned = 0;
        $totalPossible = 0;

        foreach ($assignments as $assignment) {
            $submission = $submissions->get($assignment->id);

            if ($submission && $submission->final_score !== null) {
                $totalEarned += $submission->final_score;
                $totalPossible += $assignment->max_points;
            }
        }

        $percentage = $totalPossible > 0
            ? ($totalEarned / $totalPossible) * 100
            : null;

        return $this->buildGradeResult($percentage);
    }

    /**
     * Build grade result with letter grade
     */
    protected function buildGradeResult(?float $percentage, ?float $gradedWeight = null): array
    {
        if ($percentage === null) {
            return [
                'percentage' => null,
                'letter_grade' => null,
                'grade_points' => null,
            ];
        }

        $letterGrade = $this->percentageToLetterGrade($percentage);
        $gradePoints = self::GRADE_SCALE[$letterGrade]['points'] ?? 0;

        $result = [
            'percentage' => round($percentage, 2),
            'letter_grade' => $letterGrade,
            'grade_points' => $gradePoints,
        ];

        if ($gradedWeight !== null) {
            $result['graded_weight'] = round($gradedWeight, 2);
        }

        return $result;
    }

    /**
     * Convert percentage to letter grade
     */
    public function percentageToLetterGrade(float $percentage): string
    {
        foreach (self::GRADE_SCALE as $letter => $data) {
            if ($percentage >= $data['min']) {
                return $letter;
            }
        }
        return 'F';
    }

    /**
     * Get all grades for a student in a section (full gradebook view)
     */
    public function getStudentGradebook(Enrollment $enrollment): array
    {
        $section = $enrollment->courseSection;
        $assignments = $section->assignments()
            ->where('is_published', true)
            ->orderBy('due_date')
            ->get();

        $submissions = AssignmentSubmission::where('enrollment_id', $enrollment->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->get()
            ->keyBy('assignment_id');

        $items = $assignments->map(function ($assignment) use ($submissions) {
            $submission = $submissions->get($assignment->id);

            return [
                'assignment_id' => $assignment->id,
                'title' => $assignment->title,
                'type' => $assignment->type,
                'due_date' => $assignment->due_date->toIso8601String(),
                'max_points' => $assignment->max_points,
                'weight' => $assignment->weight,
                'status' => $submission ? $submission->status : 'not_started',
                'score' => $submission ? $submission->score : null,
                'final_score' => $submission ? $submission->final_score : null,
                'percentage' => $submission && $assignment->max_points > 0
                    ? round(($submission->final_score / $assignment->max_points) * 100, 2)
                    : null,
                'letter_grade' => $submission ? $submission->letter_grade : null,
                'late_days' => $submission ? $submission->late_days : 0,
                'late_penalty' => $submission ? $submission->late_penalty_applied : 0,
                'feedback' => $submission ? $submission->feedback : null,
                'graded_at' => $submission && $submission->graded_at
                    ? $submission->graded_at->toIso8601String()
                    : null,
            ];
        });

        $currentGrade = $this->calculateCurrentGrade($enrollment);

        return [
            'student' => [
                'id' => $enrollment->student->id,
                'name' => $enrollment->student->user->name ?? 'Unknown',
            ],
            'course' => [
                'id' => $section->course->id,
                'code' => $section->course->course_code,
                'title' => $section->course->title,
            ],
            'current_grade' => $currentGrade,
            'items' => $items,
        ];
    }

    /**
     * Get grade breakdown by assignment type/category
     */
    public function getGradesByCategory(Enrollment $enrollment): array
    {
        $section = $enrollment->courseSection;
        $assignments = $section->assignments()->where('is_published', true)->get();

        $submissions = AssignmentSubmission::where('enrollment_id', $enrollment->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->where('status', 'graded')
            ->get()
            ->keyBy('assignment_id');

        $categories = [];

        foreach ($assignments as $assignment) {
            $type = $assignment->type;
            if (!isset($categories[$type])) {
                $categories[$type] = [
                    'type' => $type,
                    'total_points' => 0,
                    'earned_points' => 0,
                    'total_weight' => 0,
                    'earned_weight' => 0,
                    'count' => 0,
                    'graded_count' => 0,
                ];
            }

            $categories[$type]['total_points'] += $assignment->max_points;
            $categories[$type]['total_weight'] += $assignment->weight ?? 0;
            $categories[$type]['count']++;

            $submission = $submissions->get($assignment->id);
            if ($submission) {
                $categories[$type]['earned_points'] += $submission->final_score ?? 0;
                $categories[$type]['graded_count']++;

                if ($assignment->weight && $assignment->max_points > 0) {
                    $percentage = ($submission->final_score / $assignment->max_points) * 100;
                    $categories[$type]['earned_weight'] += ($percentage * $assignment->weight) / 100;
                }
            }
        }

        // Calculate percentages for each category
        foreach ($categories as &$category) {
            $category['percentage'] = $category['total_points'] > 0
                ? round(($category['earned_points'] / $category['total_points']) * 100, 2)
                : null;
        }

        return array_values($categories);
    }

    /**
     * Calculate what grade student needs on remaining work to achieve target
     */
    public function calculateNeededScore(Enrollment $enrollment, string $targetGrade): ?array
    {
        $targetMin = self::GRADE_SCALE[$targetGrade]['min'] ?? null;

        if ($targetMin === null) {
            return null;
        }

        $section = $enrollment->courseSection;
        $assignments = $section->assignments()->where('is_published', true)->get();

        $submissions = AssignmentSubmission::where('enrollment_id', $enrollment->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->where('status', 'graded')
            ->get()
            ->keyBy('assignment_id');

        $hasWeights = $assignments->whereNotNull('weight')->isNotEmpty();

        if ($hasWeights) {
            return $this->calculateNeededWeighted($assignments, $submissions, $targetMin);
        } else {
            return $this->calculateNeededUnweighted($assignments, $submissions, $targetMin);
        }
    }

    /**
     * Calculate needed score for weighted assignments
     */
    protected function calculateNeededWeighted($assignments, $submissions, float $targetMin): array
    {
        $earnedWeight = 0;
        $gradedWeight = 0;
        $remainingWeight = 0;

        foreach ($assignments as $assignment) {
            $submission = $submissions->get($assignment->id);
            $weight = $assignment->weight ?? 0;

            if ($submission && $submission->final_score !== null) {
                $percentage = $assignment->max_points > 0
                    ? ($submission->final_score / $assignment->max_points) * 100
                    : 0;
                $earnedWeight += ($percentage * $weight) / 100;
                $gradedWeight += $weight;
            } else {
                $remainingWeight += $weight;
            }
        }

        if ($remainingWeight <= 0) {
            $currentPercentage = $gradedWeight > 0
                ? ($earnedWeight / $gradedWeight) * 100
                : 0;

            return [
                'achievable' => $currentPercentage >= $targetMin,
                'needed_percentage' => null,
                'message' => $currentPercentage >= $targetMin
                    ? "You've already achieved this grade!"
                    : "No remaining assignments. Current grade is final.",
            ];
        }

        // Calculate what percentage needed on remaining work
        $totalWeight = $gradedWeight + $remainingWeight;
        $neededTotal = ($targetMin / 100) * $totalWeight;
        $neededRemaining = $neededTotal - $earnedWeight;
        $neededPercentage = ($neededRemaining / $remainingWeight) * 100;

        return [
            'achievable' => $neededPercentage <= 100,
            'needed_percentage' => round(max(0, $neededPercentage), 2),
            'remaining_weight' => round($remainingWeight, 2),
            'current_earned' => round($earnedWeight, 2),
            'message' => $neededPercentage <= 100
                ? "You need {$neededPercentage}% on remaining work to achieve a {$targetMin}%."
                : "This grade is not achievable with the remaining assignments.",
        ];
    }

    /**
     * Calculate needed score for unweighted assignments
     */
    protected function calculateNeededUnweighted($assignments, $submissions, float $targetMin): array
    {
        $earnedPoints = 0;
        $gradedPoints = 0;
        $remainingPoints = 0;

        foreach ($assignments as $assignment) {
            $submission = $submissions->get($assignment->id);

            if ($submission && $submission->final_score !== null) {
                $earnedPoints += $submission->final_score;
                $gradedPoints += $assignment->max_points;
            } else {
                $remainingPoints += $assignment->max_points;
            }
        }

        if ($remainingPoints <= 0) {
            $currentPercentage = $gradedPoints > 0
                ? ($earnedPoints / $gradedPoints) * 100
                : 0;

            return [
                'achievable' => $currentPercentage >= $targetMin,
                'needed_percentage' => null,
                'message' => $currentPercentage >= $targetMin
                    ? "You've already achieved this grade!"
                    : "No remaining assignments. Current grade is final.",
            ];
        }

        $totalPoints = $gradedPoints + $remainingPoints;
        $neededTotal = ($targetMin / 100) * $totalPoints;
        $neededRemaining = $neededTotal - $earnedPoints;
        $neededPercentage = ($neededRemaining / $remainingPoints) * 100;

        return [
            'achievable' => $neededPercentage <= 100,
            'needed_percentage' => round(max(0, $neededPercentage), 2),
            'remaining_points' => $remainingPoints,
            'current_earned' => $earnedPoints,
            'message' => $neededPercentage <= 100
                ? "You need {$neededPercentage}% on remaining work to achieve a {$targetMin}%."
                : "This grade is not achievable with the remaining assignments.",
        ];
    }

    /**
     * Get class gradebook (all students in a section)
     */
    public function getClassGradebook(CourseSection $section): array
    {
        $enrollments = $section->enrollments()
            ->whereIn('status', ['enrolled', 'completed'])
            ->with(['student.user'])
            ->get();

        $assignments = $section->assignments()
            ->where('is_published', true)
            ->orderBy('due_date')
            ->get();

        $students = $enrollments->map(function ($enrollment) use ($assignments) {
            $submissions = AssignmentSubmission::where('enrollment_id', $enrollment->id)
                ->whereIn('assignment_id', $assignments->pluck('id'))
                ->get()
                ->keyBy('assignment_id');

            $assignmentGrades = $assignments->mapWithKeys(function ($assignment) use ($submissions) {
                $submission = $submissions->get($assignment->id);
                return [
                    $assignment->id => [
                        'score' => $submission ? $submission->final_score : null,
                        'status' => $submission ? $submission->status : 'not_started',
                    ],
                ];
            });

            $currentGrade = $this->calculateCurrentGrade($enrollment);

            return [
                'student_id' => $enrollment->student->id,
                'student_name' => $enrollment->student->user->name ?? 'Unknown',
                'enrollment_id' => $enrollment->id,
                'current_grade' => $currentGrade,
                'assignments' => $assignmentGrades,
            ];
        });

        return [
            'course_section' => [
                'id' => $section->id,
                'course_code' => $section->course->course_code,
                'course_title' => $section->course->title,
                'section_number' => $section->section_number,
            ],
            'assignments' => $assignments->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'type' => $a->type,
                'max_points' => $a->max_points,
                'weight' => $a->weight,
                'due_date' => $a->due_date->toIso8601String(),
            ]),
            'students' => $students,
            'statistics' => $this->calculateClassStatistics($students),
        ];
    }

    /**
     * Calculate class statistics
     */
    protected function calculateClassStatistics($students): array
    {
        $percentages = $students
            ->pluck('current_grade.percentage')
            ->filter()
            ->values();

        if ($percentages->isEmpty()) {
            return [
                'class_average' => null,
                'class_median' => null,
                'class_high' => null,
                'class_low' => null,
                'grade_distribution' => [],
            ];
        }

        $distribution = [];
        foreach (array_keys(self::GRADE_SCALE) as $letter) {
            $distribution[$letter] = 0;
        }

        foreach ($students as $student) {
            $letter = $student['current_grade']['letter_grade'] ?? null;
            if ($letter && isset($distribution[$letter])) {
                $distribution[$letter]++;
            }
        }

        return [
            'class_average' => round($percentages->avg(), 2),
            'class_median' => round($percentages->median(), 2),
            'class_high' => round($percentages->max(), 2),
            'class_low' => round($percentages->min(), 2),
            'grade_distribution' => $distribution,
        ];
    }

    /**
     * Finalize grades for a section (end of term)
     */
    public function finalizeGrades(CourseSection $section): array
    {
        $enrollments = $section->enrollments()
            ->where('status', 'enrolled')
            ->get();

        $results = [];

        foreach ($enrollments as $enrollment) {
            $currentGrade = $this->calculateCurrentGrade($enrollment);

            if ($currentGrade['letter_grade'] !== null) {
                // Update the enrollment with the final grade
                $enrollment->update([
                    'grade' => $currentGrade['letter_grade'],
                    'status' => 'completed',
                ]);

                $results[] = [
                    'enrollment_id' => $enrollment->id,
                    'student_id' => $enrollment->student_id,
                    'grade' => $currentGrade['letter_grade'],
                    'percentage' => $currentGrade['percentage'],
                    'success' => true,
                ];
            } else {
                $results[] = [
                    'enrollment_id' => $enrollment->id,
                    'student_id' => $enrollment->student_id,
                    'grade' => null,
                    'success' => false,
                    'error' => 'No graded work found.',
                ];
            }
        }

        return $results;
    }

    /**
     * Export gradebook as CSV-ready array
     */
    public function exportGradebook(CourseSection $section): array
    {
        $gradebook = $this->getClassGradebook($section);

        $headers = ['Student ID', 'Student Name'];
        foreach ($gradebook['assignments'] as $assignment) {
            $headers[] = $assignment['title'] . ' (' . $assignment['max_points'] . ' pts)';
        }
        $headers[] = 'Current %';
        $headers[] = 'Letter Grade';

        $rows = [];
        foreach ($gradebook['students'] as $student) {
            $row = [
                $student['student_id'],
                $student['student_name'],
            ];

            foreach ($gradebook['assignments'] as $assignment) {
                $score = $student['assignments'][$assignment['id']]['score'] ?? '';
                $row[] = $score !== null ? $score : '';
            }

            $row[] = $student['current_grade']['percentage'] ?? '';
            $row[] = $student['current_grade']['letter_grade'] ?? '';

            $rows[] = $row;
        }

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }
}
