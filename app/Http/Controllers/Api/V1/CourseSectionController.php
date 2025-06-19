<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use App\Http\Resources\CourseSectionResource;
use App\Http\Requests\StoreCourseSectionRequest;
use App\Http\Requests\UpdateCourseSectionRequest;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Course Sections",
    description: "Endpoints for managing course sections."
)]
class CourseSectionController extends Controller
{
    #[OA\Get(
        path: "/api/v1/course-sections",
        summary: "List all course sections",
        tags: ["Course Sections"],
        parameters: [
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "course_id", in: "query", required: false, description: "Filter by course ID", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "term_id", in: "query", required: false, description: "Filter by term ID", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "instructor_id", in: "query", required: false, description: "Filter by instructor (staff) ID", schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "room_id", in: "query", required: false, description: "Filter by room ID", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "A paginated list of course sections.",
                content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/CourseSectionResource"))
            )
        ]
    )]
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

    #[OA\Post(
        path: "/api/v1/course-sections",
        summary: "Create a new course section",
        tags: ["Course Sections"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/StoreCourseSectionRequest")
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Course section created successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/CourseSectionResource")
            ),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(StoreCourseSectionRequest $request)
    {
        $section = CourseSection::create($request->validated());
        $section->load(['course', 'term', 'instructor.user', 'room.building']);
        return new CourseSectionResource($section);
    }

    #[OA\Get(
        path: "/api/v1/course-sections/{courseSection}",
        summary: "Get a single course section",
        tags: ["Course Sections"],
        parameters: [
            new OA\Parameter(name: "courseSection", in: "path", required: true, description: "ID of the course section", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "The requested course section.",
                content: new OA\JsonContent(ref: "#/components/schemas/CourseSectionResource")
            ),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(CourseSection $courseSection)
    {
        $courseSection->load(['course', 'term', 'instructor.user', 'room.building']);
        return new CourseSectionResource($courseSection);
    }

    #[OA\Put(
        path: "/api/v1/course-sections/{courseSection}",
        summary: "Update a course section",
        tags: ["Course Sections"],
        parameters: [
            new OA\Parameter(name: "courseSection", in: "path", required: true, description: "ID of the course section", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/UpdateCourseSectionRequest")
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Course section updated successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/CourseSectionResource")
            ),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function update(UpdateCourseSectionRequest $request, CourseSection $courseSection)
    {
        $courseSection->update($request->validated());
        $courseSection->load(['course', 'term', 'instructor.user', 'room.building']);
        return new CourseSectionResource($courseSection);
    }

    #[OA\Delete(
        path: "/api/v1/course-sections/{courseSection}",
        summary: "Delete a course section",
        tags: ["Course Sections"],
        parameters: [
            new OA\Parameter(name: "courseSection", in: "path", required: true, description: "ID of the course section", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Course section deleted successfully."),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(CourseSection $courseSection)
    {
        $courseSection->delete();
        return response()->noContent();
    }
}
