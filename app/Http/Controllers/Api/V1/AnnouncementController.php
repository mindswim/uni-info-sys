<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Staff;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with(['author.user', 'announceable']);

        // Filter by target type
        if ($request->has('target_type')) {
            if ($request->target_type === 'university') {
                $query->universityWide();
            } elseif ($request->target_type === 'course_section' && $request->has('target_id')) {
                $query->forCourseSection((int) $request->target_id);
            } elseif ($request->target_type === 'department' && $request->has('target_id')) {
                $query->forDepartment((int) $request->target_id);
            }
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->withPriority($request->priority);
        }

        // Filter visible only
        if ($request->boolean('visible_only', true)) {
            $query->visible();
        }

        // Filter by author
        if ($request->has('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        $announcements = $query->ordered()->paginate($request->get('per_page', 50));

        return response()->json($announcements);
    }

    /**
     * Store a newly created announcement
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_type' => 'nullable|string|in:course_section,department',
            'target_id' => 'nullable|integer|required_with:target_type',
            'author_id' => 'required|integer|exists:staff,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'sometimes|string|in:'.implode(',', Announcement::PRIORITIES),
            'is_published' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'is_pinned' => 'sometimes|boolean',
        ]);

        // Validate target exists
        if (! empty($validated['target_type'])) {
            $targetClass = Announcement::TARGET_TYPES[$validated['target_type']] ?? null;
            if ($targetClass && ! $targetClass::find($validated['target_id'])) {
                return response()->json([
                    'message' => 'Target not found.',
                ], 422);
            }
        }

        // Map to model fields
        $announcementData = [
            'author_id' => $validated['author_id'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'priority' => $validated['priority'] ?? 'normal',
            'is_published' => $validated['is_published'] ?? true,
            'published_at' => $validated['published_at'] ?? now(),
            'expires_at' => $validated['expires_at'] ?? null,
            'is_pinned' => $validated['is_pinned'] ?? false,
        ];

        // Set polymorphic relationship
        if (! empty($validated['target_type'])) {
            $announcementData['announceable_type'] = Announcement::TARGET_TYPES[$validated['target_type']];
            $announcementData['announceable_id'] = $validated['target_id'];
        }

        $announcement = Announcement::create($announcementData);

        return response()->json([
            'message' => 'Announcement created successfully.',
            'data' => $announcement->fresh(['author.user', 'announceable']),
        ], 201);
    }

    /**
     * Display the specified announcement
     */
    public function show(Announcement $announcement): JsonResponse
    {
        $announcement->load(['author.user', 'announceable']);

        $data = $announcement->toArray();
        $data['is_visible'] = $announcement->isVisible();
        $data['is_expired'] = $announcement->isExpired();
        $data['is_university_wide'] = $announcement->isUniversityWide();
        $data['priority_badge'] = $announcement->priority_badge;

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Update the specified announcement
     */
    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'priority' => 'sometimes|string|in:'.implode(',', Announcement::PRIORITIES),
            'is_published' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_pinned' => 'sometimes|boolean',
        ]);

        $announcement->update($validated);

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'data' => $announcement->fresh(['author.user', 'announceable']),
        ]);
    }

    /**
     * Remove the specified announcement
     */
    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully.',
        ]);
    }

    /**
     * Get university-wide announcements
     */
    public function universityWide(Request $request): JsonResponse
    {
        $query = Announcement::with(['author.user'])
            ->universityWide()
            ->visible()
            ->ordered();

        $announcements = $query->get();

        return response()->json([
            'data' => $announcements,
        ]);
    }

    /**
     * Get announcements for a course section
     */
    public function forCourseSection(CourseSection $courseSection): JsonResponse
    {
        $announcements = Announcement::with(['author.user'])
            ->forCourseSection($courseSection->id)
            ->visible()
            ->ordered()
            ->get();

        return response()->json([
            'data' => $announcements,
        ]);
    }

    /**
     * Get announcements for a department
     */
    public function forDepartment(Department $department): JsonResponse
    {
        $announcements = Announcement::with(['author.user'])
            ->forDepartment($department->id)
            ->visible()
            ->ordered()
            ->get();

        return response()->json([
            'data' => $announcements,
        ]);
    }

    /**
     * Get current student's relevant announcements
     */
    public function myAnnouncements(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get student's enrolled course sections
        $enrollments = Enrollment::where('student_id', $student->id)
            ->where('status', 'enrolled')
            ->with(['courseSection.course.department'])
            ->get();

        $courseSectionIds = $enrollments->pluck('course_section_id');

        // Get department IDs from enrolled courses
        $departmentIds = $enrollments
            ->pluck('courseSection.course.department_id')
            ->filter()
            ->unique();

        // Query announcements visible to this student
        $announcements = Announcement::with(['author.user', 'announceable'])
            ->visible()
            ->where(function ($q) use ($courseSectionIds, $departmentIds) {
                // University-wide
                $q->universityWide()
                    // Or for enrolled course sections
                    ->orWhere(function ($q2) use ($courseSectionIds) {
                        $q2->where('announceable_type', CourseSection::class)
                            ->whereIn('announceable_id', $courseSectionIds);
                    })
                    // Or for student's departments
                    ->orWhere(function ($q2) use ($departmentIds) {
                        $q2->where('announceable_type', Department::class)
                            ->whereIn('announceable_id', $departmentIds);
                    });
            })
            ->ordered()
            ->get();

        // Add context for each announcement
        $announcements->transform(function ($announcement) use ($enrollments) {
            $data = $announcement->toArray();

            if ($announcement->isForCourseSection()) {
                $enrollment = $enrollments->firstWhere('course_section_id', $announcement->announceable_id);
                if ($enrollment) {
                    $data['course_code'] = $enrollment->courseSection->course->course_code;
                    $data['course_title'] = $enrollment->courseSection->course->title;
                }
            }

            return $data;
        });

        return response()->json([
            'data' => $announcements,
        ]);
    }

    /**
     * Get announcements created by current staff member
     */
    public function myCreatedAnnouncements(Request $request): JsonResponse
    {
        $user = $request->user();
        $staff = Staff::where('user_id', $user->id)->firstOrFail();

        $announcements = Announcement::with(['announceable'])
            ->where('author_id', $staff->id)
            ->ordered()
            ->get();

        return response()->json([
            'data' => $announcements,
        ]);
    }

    /**
     * Publish an announcement
     */
    public function publish(Announcement $announcement): JsonResponse
    {
        $announcement->update([
            'is_published' => true,
            'published_at' => $announcement->published_at ?? now(),
        ]);

        return response()->json([
            'message' => 'Announcement published successfully.',
            'data' => $announcement->fresh(),
        ]);
    }

    /**
     * Unpublish an announcement
     */
    public function unpublish(Announcement $announcement): JsonResponse
    {
        $announcement->update(['is_published' => false]);

        return response()->json([
            'message' => 'Announcement unpublished successfully.',
            'data' => $announcement->fresh(),
        ]);
    }

    /**
     * Pin an announcement
     */
    public function pin(Announcement $announcement): JsonResponse
    {
        $announcement->update(['is_pinned' => true]);

        return response()->json([
            'message' => 'Announcement pinned successfully.',
            'data' => $announcement->fresh(),
        ]);
    }

    /**
     * Unpin an announcement
     */
    public function unpin(Announcement $announcement): JsonResponse
    {
        $announcement->update(['is_pinned' => false]);

        return response()->json([
            'message' => 'Announcement unpinned successfully.',
            'data' => $announcement->fresh(),
        ]);
    }

    /**
     * Get priority levels
     */
    public function priorities(): JsonResponse
    {
        return response()->json([
            'data' => Announcement::PRIORITIES,
        ]);
    }
}
