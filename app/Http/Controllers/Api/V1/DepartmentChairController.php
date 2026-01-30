<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Term;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentChairController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();
        $department = Department::where('chair_id', $staff->id)->firstOrFail();

        $currentTerm = Term::where('is_current', true)->first();

        $facultyCount = Staff::where('department_id', $department->id)->count();

        $sectionCount = 0;
        $totalEnrolled = 0;

        if ($currentTerm) {
            $sectionIds = CourseSection::whereHas('course.program', function ($q) use ($department) {
                $q->where('department_id', $department->id);
            })->where('term_id', $currentTerm->id)->pluck('id');

            $sectionCount = $sectionIds->count();
            $totalEnrolled = Enrollment::whereIn('course_section_id', $sectionIds)
                ->where('status', 'enrolled')
                ->count();
        }

        return response()->json([
            'data' => [
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'code' => $department->code,
                ],
                'current_term' => $currentTerm?->name,
                'faculty_count' => $facultyCount,
                'section_count' => $sectionCount,
                'total_enrolled' => $totalEnrolled,
            ],
        ]);
    }

    public function facultyList(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();
        $department = Department::where('chair_id', $staff->id)->firstOrFail();

        $faculty = Staff::where('department_id', $department->id)
            ->with(['user', 'courseSections' => function ($q) {
                $q->whereHas('term', function ($tq) {
                    $tq->where('is_current', true);
                });
            }])
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->user->name,
                    'email' => $s->user->email,
                    'job_title' => $s->job_title,
                    'current_sections' => $s->courseSections->count(),
                    'advisee_count' => $s->advisees()->count(),
                ];
            });

        return response()->json(['data' => $faculty]);
    }

    public function sectionOverview(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();
        $department = Department::where('chair_id', $staff->id)->firstOrFail();
        $currentTerm = Term::where('is_current', true)->first();

        if (!$currentTerm) {
            return response()->json(['data' => []]);
        }

        $sections = CourseSection::whereHas('course.program', function ($q) use ($department) {
            $q->where('department_id', $department->id);
        })
            ->where('term_id', $currentTerm->id)
            ->with(['course', 'instructor.user'])
            ->withCount(['enrollments' => function ($q) {
                $q->where('status', 'enrolled');
            }])
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'course_code' => $section->course->course_code,
                    'course_name' => $section->course->name,
                    'section_number' => $section->section_number,
                    'instructor' => $section->instructor?->user?->name ?? 'TBA',
                    'enrolled_count' => $section->enrollments_count,
                    'capacity' => $section->capacity,
                ];
            });

        return response()->json(['data' => $sections]);
    }

    public function gradeDistribution(Request $request): JsonResponse
    {
        $staff = Staff::where('user_id', $request->user()->id)->firstOrFail();
        $department = Department::where('chair_id', $staff->id)->firstOrFail();
        $currentTerm = Term::where('is_current', true)->first();

        if (!$currentTerm) {
            return response()->json(['data' => []]);
        }

        $sectionIds = CourseSection::whereHas('course.program', function ($q) use ($department) {
            $q->where('department_id', $department->id);
        })->where('term_id', $currentTerm->id)->pluck('id');

        $distribution = Enrollment::whereIn('course_section_id', $sectionIds)
            ->whereNotNull('grade')
            ->selectRaw('grade, COUNT(*) as count')
            ->groupBy('grade')
            ->orderBy('grade')
            ->pluck('count', 'grade');

        return response()->json(['data' => $distribution]);
    }
}
