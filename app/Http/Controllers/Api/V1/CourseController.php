<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Http\Resources\CourseResource;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * @OA\Tag(name="Courses", description="Course management endpoints")
 */
class CourseController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/courses",
     *     summary="List all courses",
     *     description="Retrieve a paginated list of all courses with their departments and prerequisites",
     *     operationId="getCourses",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Parameter(
     *         name="department_id",
     *         in="query",
     *         description="Filter courses by department ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved courses",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="code", type="string", example="CS101"),
     *                     @OA\Property(property="name", type="string", example="Introduction to Computer Science"),
     *                     @OA\Property(property="description", type="string", example="Basic concepts of computer science"),
     *                     @OA\Property(property="credits", type="integer", example=3),
     *                     @OA\Property(property="department_id", type="integer", example=1),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(
     *                         property="department",
     *                         type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="name", type="string")
     *                     ),
     *                     @OA\Property(
     *                         property="prerequisites",
     *                         type="array",
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer"),
     *                             @OA\Property(property="code", type="string"),
     *                             @OA\Property(property="name", type="string")
     *                         )
     *                     )
     *                 )
     *             ),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/v1/courses",
     *     summary="Create a new course",
     *     description="Store a newly created course with optional prerequisites",
     *     operationId="createCourse",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Course data",
     *         @OA\JsonContent(
     *             required={"code", "name", "credits", "department_id"},
     *             @OA\Property(property="code", type="string", example="CS101", maxLength=10),
     *             @OA\Property(property="name", type="string", example="Introduction to Computer Science", maxLength=255),
     *             @OA\Property(property="description", type="string", example="Basic concepts of computer science"),
     *             @OA\Property(property="credits", type="integer", example=3, minimum=1, maximum=6),
     *             @OA\Property(property="department_id", type="integer", example=1, description="ID of the department this course belongs to"),
     *             @OA\Property(
     *                 property="prerequisites",
     *                 type="array",
     *                 description="Array of prerequisite course IDs",
     *                 @OA\Items(type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Course created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="code", type="string", example="CS101"),
     *                 @OA\Property(property="name", type="string", example="Introduction to Computer Science"),
     *                 @OA\Property(property="description", type="string", example="Basic concepts of computer science"),
     *                 @OA\Property(property="credits", type="integer", example=3),
     *                 @OA\Property(property="department_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="department",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/v1/courses/{id}",
     *     summary="Get a specific course",
     *     description="Display the specified course with its department and prerequisites",
     *     operationId="getCourse",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Course ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved course",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="code", type="string", example="CS101"),
     *                 @OA\Property(property="name", type="string", example="Introduction to Computer Science"),
     *                 @OA\Property(property="description", type="string", example="Basic concepts of computer science"),
     *                 @OA\Property(property="credits", type="integer", example=3),
     *                 @OA\Property(property="department_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="department",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="prerequisites",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="code", type="string"),
     *                         @OA\Property(property="name", type="string")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Course not found")
     * )
     */
    public function show(Course $course)
    {
        $this->authorize('view', $course);

        $course->load(['department', 'prerequisites']);
        return new CourseResource($course);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/courses/{id}",
     *     summary="Update a course",
     *     description="Update the specified course",
     *     operationId="updateCourse",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Course ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Course data to update",
     *         @OA\JsonContent(
     *             @OA\Property(property="code", type="string", example="CS101", maxLength=10),
     *             @OA\Property(property="name", type="string", example="Advanced Computer Science", maxLength=255),
     *             @OA\Property(property="description", type="string", example="Advanced concepts of computer science"),
     *             @OA\Property(property="credits", type="integer", example=4, minimum=1, maximum=6),
     *             @OA\Property(property="department_id", type="integer", example=1, description="ID of the department this course belongs to"),
     *             @OA\Property(
     *                 property="prerequisites",
     *                 type="array",
     *                 description="Array of prerequisite course IDs",
     *                 @OA\Items(type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Course updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="code", type="string", example="CS101"),
     *                 @OA\Property(property="name", type="string", example="Advanced Computer Science"),
     *                 @OA\Property(property="description", type="string", example="Advanced concepts of computer science"),
     *                 @OA\Property(property="credits", type="integer", example=4),
     *                 @OA\Property(property="department_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(
     *                     property="department",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Course not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validated();
        
        $oldDepartmentId = $course->department_id;
        $course->update($validated);

        if (isset($validated['prerequisites'])) {
            $course->prerequisites()->sync($validated['prerequisites']);
        }
        
        $course->load(['department', 'prerequisites']);

        // Clear courses cache (all and affected department-specific caches)
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $oldDepartmentId);
        if (isset($validated['department_id']) && $validated['department_id'] !== $oldDepartmentId) {
            Cache::forget('courses.department.' . $validated['department_id']);
        }

        return new CourseResource($course);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/courses/{id}",
     *     summary="Delete a course",
     *     description="Remove the specified course from storage",
     *     operationId="deleteCourse",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Course ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Course deleted successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Course not found")
     * )
     */
    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);

        $departmentId = $course->department_id;
        $course->delete();

        // Clear courses cache (all and department-specific)
        Cache::forget('courses.all');
        Cache::forget('courses.department.' . $departmentId);

        return response()->noContent();
    }
}
