<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Http\Resources\CourseResource;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Courses',
    description: 'Endpoints for managing courses and their prerequisites.'
)]
class CourseController extends Controller
{
    #[OA\Get(
        path: '/api/v1/courses',
        summary: 'List all courses',
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(
                name: 'page',
                in: 'query',
                required: false,
                description: 'Page number for pagination',
                schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)
            ),
            new OA\Parameter(
                name: 'department_id',
                in: 'query',
                required: false,
                description: 'Filter courses by department ID',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'A paginated list of courses.',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/CourseResource')
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
        ]
    )]
    public function index(Request $request)
    {
        $this->authorize('viewAny', Course::class);

        // Create cache key based on filters
        $cacheKey = 'courses.all';
        if ($request->has('department_id')) {
            $cacheKey = 'courses.department.' . $request->department_id;
        }

        $courses = Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Course::with(['department', 'prerequisites']);

            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            return $query->paginate(10);
        });

        return CourseResource::collection($courses);
    }

    #[OA\Post(
        path: '/api/v1/courses',
        summary: 'Create a new course',
        tags: ['Courses'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreCourseRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Course created successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/CourseResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCourseRequest $request)
    {
        $this->authorize('create', Course::class);

        $validated = $request->validated();
        
        $course = Course::create($validated);

        if (isset($validated['prerequisites'])) {
            $course->prerequisites()->sync($validated['prerequisites']);
        }
        
        $course->load(['department', 'prerequisites']);

        // Clear courses cache (all and department-specific)
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $validated['department_id']);

        return new CourseResource($course);
    }

    #[OA\Get(
        path: '/api/v1/courses/{course}',
        summary: 'Get a single course',
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(
                name: 'course',
                in: 'path',
                required: true,
                description: 'ID of the course',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'The requested course.',
                content: new OA\JsonContent(ref: '#/components/schemas/CourseResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function show(Course $course)
    {
        $this->authorize('view', $course);
        
        $course->load(['department', 'prerequisites']);
        
        return new CourseResource($course);
    }

    #[OA\Put(
        path: '/api/v1/courses/{course}',
        summary: 'Update a course',
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(
                name: 'course',
                in: 'path',
                required: true,
                description: 'ID of the course',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateCourseRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Course updated successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/CourseResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validated();
        
        $course->update($validated);

        if (isset($validated['prerequisites'])) {
            $course->prerequisites()->sync($validated['prerequisites']);
        }
        
        $course->load(['department', 'prerequisites']);

        // Clear courses cache
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $course->department_id);

        return new CourseResource($course);
    }

    #[OA\Delete(
        path: '/api/v1/courses/{course}',
        summary: 'Delete a course',
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(
                name: 'course',
                in: 'path',
                required: true,
                description: 'ID of the course',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Course deleted successfully.'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);
        
        // Clear courses cache
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $course->department_id);
        
        $course->delete();
        
        return response()->noContent();
    }
}
