<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseSectionRequest;
use App\Http\Requests\UpdateCourseSectionRequest;
use App\Http\Resources\CourseSectionResource;
use App\Models\CourseSection;
use Illuminate\Http\Request;

class CourseSectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CourseSection::with(['course', 'term', 'instructor', 'room']);

        // Filter by term
        if ($request->has('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        // Filter by course
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        // Filter by instructor
        if ($request->has('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        // Filter by room
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        // Filter by schedule days
        if ($request->has('schedule_days')) {
            $query->where('schedule_days', $request->schedule_days);
        }

        // Include enrollment counts if requested
        if ($request->boolean('include_enrollment_counts')) {
            $query->withCount('enrollments');
        }

        return CourseSectionResource::collection($query->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseSectionRequest $request)
    {
        $courseSection = CourseSection::create($request->validated());
        $courseSection->load(['course', 'term', 'instructor', 'room']);
        return new CourseSectionResource($courseSection);
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseSection $courseSection, Request $request)
    {
        $relations = ['course', 'term', 'instructor', 'room'];

        if ($request->boolean('include_enrollment_counts')) {
            $courseSection->loadCount('enrollments');
        }

        $courseSection->load($relations);
        return new CourseSectionResource($courseSection);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseSectionRequest $request, CourseSection $courseSection)
    {
        $courseSection->update($request->validated());
        $courseSection->load(['course', 'term', 'instructor', 'room']);
        return new CourseSectionResource($courseSection);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CourseSection $courseSection)
    {
        $courseSection->delete();
        return response()->noContent();
    }
}
