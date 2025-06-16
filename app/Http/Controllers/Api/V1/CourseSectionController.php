<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use App\Http\Resources\CourseSectionResource;
use App\Http\Requests\StoreCourseSectionRequest;
use App\Http\Requests\UpdateCourseSectionRequest;
use Illuminate\Http\Request;

class CourseSectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CourseSection::with(['course', 'term', 'instructor.user', 'room.building']);

        $filters = ['course_id', 'term_id', 'instructor_id', 'room_id'];

        foreach($filters as $filter) {
            if ($request->has($filter)) {
                $query->where($filter, $request->$filter);
            }
        }
        
        return CourseSectionResource::collection($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseSectionRequest $request)
    {
        $section = CourseSection::create($request->validated());
        $section->load(['course', 'term', 'instructor.user', 'room.building']);
        return new CourseSectionResource($section);
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseSection $courseSection)
    {
        $courseSection->load(['course', 'term', 'instructor.user', 'room.building']);
        return new CourseSectionResource($courseSection);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseSectionRequest $request, CourseSection $courseSection)
    {
        $courseSection->update($request->validated());
        $courseSection->load(['course', 'term', 'instructor.user', 'room.building']);
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
