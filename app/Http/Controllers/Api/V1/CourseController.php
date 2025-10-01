<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSection;
use App\Http\Resources\CourseResource;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use OpenApi\Attributes as OA;
use Illuminate\Http\JsonResponse;

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

    #[OA\Post(
        path: '/api/v1/courses/{course}/restore',
        summary: 'Restore a soft-deleted course',
        description: 'Restore a soft-deleted course record. Requires admin permissions.',
        security: [['sanctum' => []]],
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(name: 'course', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Course restored successfully',
                content: new OA\JsonContent(ref: '#/components/schemas/CourseResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function restore($id): JsonResponse
    {
        $course = Course::withTrashed()->findOrFail($id);
        $this->authorize('restore', $course);
        
        $course->restore();
        
        // Clear courses cache
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $course->department_id);
        
        return response()->json([
            'message' => 'Course restored successfully',
            'data' => new CourseResource($course)
        ], 200);
    }

    #[OA\Delete(
        path: '/api/v1/courses/{course}/force',
        summary: 'Permanently delete a course',
        description: 'Permanently delete a course record. Requires admin permissions. This action cannot be undone.',
        security: [['sanctum' => []]],
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(name: 'course', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Course permanently deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function forceDelete($id): JsonResponse
    {
        $course = Course::withTrashed()->findOrFail($id);
        $this->authorize('forceDelete', $course);
        
        // Clear courses cache
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $course->department_id);
        
        $course->forceDelete();

        return response()->json(null, 204);
    }

    #[OA\Get(
        path: '/api/v1/course-catalog',
        summary: 'Get public course catalog with available sections',
        tags: ['Courses'],
        parameters: [
            new OA\Parameter(
                name: 'term_id',
                in: 'query',
                required: false,
                description: 'Filter by term ID (defaults to current term)',
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'department_id',
                in: 'query',
                required: false,
                description: 'Filter by department ID',
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'level',
                in: 'query',
                required: false,
                description: 'Filter by course level (undergraduate, graduate)',
                schema: new OA\Schema(type: 'string')
            ),
            new OA\Parameter(
                name: 'search',
                in: 'query',
                required: false,
                description: 'Search in course code, name, or description',
                schema: new OA\Schema(type: 'string')
            ),
            new OA\Parameter(
                name: 'page',
                in: 'query',
                required: false,
                description: 'Page number for pagination',
                schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Course catalog with available sections.',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/CourseResource')),
                        new OA\Property(property: 'meta', type: 'object'),
                        new OA\Property(property: 'links', type: 'object'),
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function catalog(Request $request): JsonResponse
    {
        $query = Course::with([
            'department',
            'prerequisites',
            'courseSections' => function ($query) use ($request) {
                $query->where('status', 'active')
                    ->with(['term', 'instructor.user', 'room.building']);

                if ($request->has('term_id')) {
                    $query->where('term_id', $request->term_id);
                } else {
                    // Get current term - you may need to adjust this logic
                    $query->whereHas('term', function ($q) {
                        $q->where('is_current', true);
                    });
                }
            }
        ]);

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by level
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Only show courses that have active sections
        $query->has('courseSections');

        $courses = $query->paginate(20);

        return response()->json([
            'data' => CourseResource::collection($courses),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
            'links' => [
                'first' => $courses->url(1),
                'last' => $courses->url($courses->lastPage()),
                'prev' => $courses->previousPageUrl(),
                'next' => $courses->nextPageUrl(),
            ]
        ], 200);
    }
}
