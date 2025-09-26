<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    /**
     * Get all users for impersonation (God Mode)
     */
    public function index(Request $request)
    {
        // Check if user is god mode admin
        if (!$this->isGodMode($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::with(['roles', 'student', 'staff'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name'),
                    'type' => $this->getUserType($user),
                    'details' => $this->getUserDetails($user),
                ];
            });

        return response()->json([
            'users' => $users,
            'total' => $users->count(),
        ]);
    }

    /**
     * Impersonate a user
     */
    public function impersonate(Request $request, User $user)
    {
        // Check if user is god mode admin
        if (!$this->isGodMode($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Generate token for the target user
        $token = $user->createToken('impersonation')->plainTextToken;

        return response()->json([
            'message' => 'Now impersonating ' . $user->name,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'type' => $this->getUserType($user),
            ],
            'token' => $token,
            'original_user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ],
        ]);
    }

    /**
     * Quick login without password (for development)
     */
    public function quickLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Only allow in local/development environment
        if (app()->environment('production')) {
            return response()->json(['message' => 'Not available in production'], 403);
        }

        $user = User::where('email', $request->email)->first();
        $token = $user->createToken('quick-login')->plainTextToken;

        return response()->json([
            'message' => 'Quick login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'type' => $this->getUserType($user),
                'details' => $this->getUserDetails($user),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get system statistics (God Mode Dashboard)
     */
    public function statistics(Request $request)
    {
        // Check if user is god mode admin
        if (!$this->isGodMode($request->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'statistics' => [
                'users' => [
                    'total' => User::count(),
                    'students' => User::whereHas('roles', fn($q) => $q->where('name', 'Student'))->count(),
                    'faculty' => User::whereHas('roles', fn($q) => $q->where('name', 'Faculty'))->count(),
                    'staff' => User::whereHas('roles', fn($q) => $q->where('name', 'Staff'))->count(),
                    'admins' => User::whereHas('roles', fn($q) => $q->where('name', 'Admin'))->count(),
                ],
                'applications' => [
                    'total' => \App\Models\AdmissionApplication::count(),
                    'submitted' => \App\Models\AdmissionApplication::where('status', 'submitted')->count(),
                    'under_review' => \App\Models\AdmissionApplication::where('status', 'under_review')->count(),
                    'accepted' => \App\Models\AdmissionApplication::where('status', 'accepted')->count(),
                    'rejected' => \App\Models\AdmissionApplication::where('status', 'rejected')->count(),
                ],
                'enrollments' => [
                    'total' => \App\Models\Enrollment::count(),
                    'enrolled' => \App\Models\Enrollment::where('status', 'enrolled')->count(),
                    'waitlisted' => \App\Models\Enrollment::where('status', 'waitlisted')->count(),
                    'dropped' => \App\Models\Enrollment::where('status', 'dropped')->count(),
                ],
                'courses' => [
                    'total' => \App\Models\Course::count(),
                    'sections' => \App\Models\CourseSection::count(),
                    'open_sections' => \App\Models\CourseSection::where('status', 'open')->count(),
                ],
                'infrastructure' => [
                    'faculties' => \App\Models\Faculty::count(),
                    'departments' => \App\Models\Department::count(),
                    'programs' => \App\Models\Program::count(),
                    'buildings' => \App\Models\Building::count(),
                    'rooms' => \App\Models\Room::count(),
                ],
            ],
        ]);
    }

    /**
     * Check if user is god mode admin
     */
    private function isGodMode($user)
    {
        if (!$user) {
            return false;
        }

        // Check if user is the god mode admin
        if ($user->email === 'god@admin.com') {
            return true;
        }

        // Or check if user has admin role and special permission
        return $user->roles()->where('name', 'Admin')->exists();
    }

    /**
     * Get user type based on relationships
     */
    private function getUserType($user)
    {
        if ($user->student) {
            return 'student';
        }
        if ($user->staff) {
            return 'staff';
        }
        if ($user->roles()->where('name', 'Admin')->exists()) {
            return 'admin';
        }
        return 'user';
    }

    /**
     * Get user details based on type
     */
    private function getUserDetails($user)
    {
        if ($user->student) {
            return [
                'student_number' => $user->student->student_number,
                'enrollment_status' => $user->student->enrollment_status,
                'program' => $user->student->enrollments()
                    ->with('courseSection.course.department.programs')
                    ->first()
                    ?->courseSection->course->department->programs->first()?->name,
            ];
        }

        if ($user->staff) {
            return [
                'job_title' => $user->staff->job_title,
                'department' => $user->staff->department?->name,
                'office' => $user->staff->office_location,
            ];
        }

        return null;
    }
}