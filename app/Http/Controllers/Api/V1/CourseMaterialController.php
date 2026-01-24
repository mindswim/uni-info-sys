<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\CourseMaterial;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseMaterialController extends Controller
{
    /**
     * Display a listing of materials with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = CourseMaterial::with(['courseSection.course', 'classSession']);

        // Filter by course section
        if ($request->has('course_section_id')) {
            $query->where('course_section_id', $request->course_section_id);
        }

        // Filter by class session
        if ($request->has('class_session_id')) {
            $query->forSession((int) $request->class_session_id);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter published only
        if ($request->boolean('published_only', true)) {
            $query->published();
        }

        // Filter available only (for students)
        if ($request->boolean('available_only')) {
            $query->available();
        }

        // Section-wide only (not linked to a session)
        if ($request->boolean('section_wide')) {
            $query->sectionWide();
        }

        $materials = $query->ordered()->paginate($request->get('per_page', 50));

        return response()->json($materials);
    }

    /**
     * Store a newly created material
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_section_id' => 'required|integer|exists:course_sections,id',
            'class_session_id' => 'nullable|integer|exists:class_sessions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:' . implode(',', CourseMaterial::TYPES),
            'content' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'file_name' => 'nullable|string|max:255',
            'file_size' => 'nullable|string|max:50',
            'mime_type' => 'nullable|string|max:100',
            'url' => 'nullable|url|max:500',
            'sort_order' => 'sometimes|integer|min:0',
            'is_published' => 'sometimes|boolean',
            'available_from' => 'nullable|date',
        ]);

        // Validate that session belongs to section if provided
        if (!empty($validated['class_session_id'])) {
            $session = ClassSession::find($validated['class_session_id']);
            if ($session && $session->course_section_id !== $validated['course_section_id']) {
                return response()->json([
                    'message' => 'Class session does not belong to the specified course section.',
                ], 422);
            }
        }

        $material = CourseMaterial::create($validated);

        return response()->json([
            'message' => 'Course material created successfully.',
            'data' => $material->fresh(['courseSection.course', 'classSession']),
        ], 201);
    }

    /**
     * Display the specified material
     */
    public function show(CourseMaterial $courseMaterial): JsonResponse
    {
        $courseMaterial->load(['courseSection.course', 'classSession']);

        $data = $courseMaterial->toArray();
        $data['is_available'] = $courseMaterial->isAvailable();
        $data['formatted_file_size'] = $courseMaterial->formatted_file_size;
        $data['is_link'] = $courseMaterial->isLink();
        $data['is_file'] = $courseMaterial->isFile();

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Update the specified material
     */
    public function update(Request $request, CourseMaterial $courseMaterial): JsonResponse
    {
        $validated = $request->validate([
            'class_session_id' => 'nullable|integer|exists:class_sessions,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|string|in:' . implode(',', CourseMaterial::TYPES),
            'content' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'file_name' => 'nullable|string|max:255',
            'file_size' => 'nullable|string|max:50',
            'mime_type' => 'nullable|string|max:100',
            'url' => 'nullable|url|max:500',
            'sort_order' => 'sometimes|integer|min:0',
            'is_published' => 'sometimes|boolean',
            'available_from' => 'nullable|date',
        ]);

        // Validate that session belongs to section if provided
        if (!empty($validated['class_session_id'])) {
            $session = ClassSession::find($validated['class_session_id']);
            if ($session && $session->course_section_id !== $courseMaterial->course_section_id) {
                return response()->json([
                    'message' => 'Class session does not belong to the course section.',
                ], 422);
            }
        }

        $courseMaterial->update($validated);

        return response()->json([
            'message' => 'Course material updated successfully.',
            'data' => $courseMaterial->fresh(['courseSection.course', 'classSession']),
        ]);
    }

    /**
     * Remove the specified material
     */
    public function destroy(CourseMaterial $courseMaterial): JsonResponse
    {
        $courseMaterial->delete();

        return response()->json([
            'message' => 'Course material deleted successfully.',
        ]);
    }

    /**
     * Get materials for a specific course section
     */
    public function byCourseSection(Request $request, CourseSection $courseSection): JsonResponse
    {
        $query = $courseSection->courseMaterials();

        // For students, only show available
        if ($request->boolean('student_view')) {
            $query->available();
        }

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->boolean('section_wide')) {
            $query->sectionWide();
        }

        $materials = $query->ordered()->get();

        // Group by type if requested
        if ($request->boolean('grouped')) {
            $grouped = $materials->groupBy('type');
            return response()->json([
                'data' => $grouped,
            ]);
        }

        return response()->json([
            'data' => $materials,
        ]);
    }

    /**
     * Get materials for a specific class session
     */
    public function byClassSession(ClassSession $classSession): JsonResponse
    {
        $materials = $classSession->materials()->available()->ordered()->get();

        return response()->json([
            'data' => $materials,
        ]);
    }

    /**
     * Get syllabus for a course section
     */
    public function syllabus(CourseSection $courseSection): JsonResponse
    {
        $syllabus = $courseSection->courseMaterials()
            ->ofType('syllabus')
            ->available()
            ->first();

        if (!$syllabus) {
            return response()->json([
                'message' => 'No syllabus found for this course section.',
                'data' => null,
            ]);
        }

        return response()->json([
            'data' => $syllabus,
        ]);
    }

    /**
     * Get current student's course materials
     */
    public function myMaterials(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get student's enrolled course sections
        $enrollments = Enrollment::where('student_id', $student->id)
            ->where('status', 'enrolled')
            ->with(['courseSection.courseMaterials' => function ($q) {
                $q->available()->ordered();
            }, 'courseSection.course'])
            ->get();

        $materials = $enrollments->flatMap(function ($enrollment) {
            return $enrollment->courseSection->courseMaterials->map(function ($material) use ($enrollment) {
                $data = $material->toArray();
                $data['course_code'] = $enrollment->courseSection->course->course_code;
                $data['course_title'] = $enrollment->courseSection->course->title;
                return $data;
            });
        });

        // Filter by type if requested
        if ($request->has('type')) {
            $materials = $materials->where('type', $request->type);
        }

        return response()->json([
            'data' => $materials->values(),
        ]);
    }

    /**
     * Get materials for a student's specific course
     */
    public function myCourseMaterials(Request $request, CourseSection $courseSection): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Verify enrollment
        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('course_section_id', $courseSection->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'Student is not enrolled in this course section.',
            ], 403);
        }

        $query = $courseSection->courseMaterials()->available()->ordered();

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $materials = $query->get();

        // Group by type if requested
        if ($request->boolean('grouped')) {
            return response()->json([
                'data' => $materials->groupBy('type'),
            ]);
        }

        return response()->json([
            'data' => $materials,
        ]);
    }

    /**
     * Publish a material
     */
    public function publish(CourseMaterial $courseMaterial): JsonResponse
    {
        $courseMaterial->update(['is_published' => true]);

        return response()->json([
            'message' => 'Course material published successfully.',
            'data' => $courseMaterial->fresh(),
        ]);
    }

    /**
     * Unpublish a material
     */
    public function unpublish(CourseMaterial $courseMaterial): JsonResponse
    {
        $courseMaterial->update(['is_published' => false]);

        return response()->json([
            'message' => 'Course material unpublished successfully.',
            'data' => $courseMaterial->fresh(),
        ]);
    }

    /**
     * Reorder materials
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'materials' => 'required|array',
            'materials.*.id' => 'required|integer|exists:course_materials,id',
            'materials.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['materials'] as $item) {
            CourseMaterial::where('id', $item['id'])->update([
                'sort_order' => $item['sort_order'],
            ]);
        }

        return response()->json([
            'message' => 'Materials reordered successfully.',
        ]);
    }

    /**
     * Get material types
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'data' => CourseMaterial::TYPES,
        ]);
    }
}
