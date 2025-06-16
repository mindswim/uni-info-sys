<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Student;
use App\Models\Message;
use App\Models\Activity;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $student = Student::with(['academicRecords', 'documents'])
            ->where('user_id', Auth::id())
            ->first();

        if (!$student) {
            return Inertia::render('Setup', [
                'message' => 'Please complete your student profile to continue.'
            ]);
        }

        return Inertia::render('Dashboard', [
            'studentInfo' => [
                'name' => $student->first_name . ' ' . $student->last_name,
                'id' => $student->student_number,
                'status' => $student->status,
                'applicationStage' => $student->application_stage,
                'term' => $student->term,
                'deadlineDate' => $student->application_deadline,
            ],
            'applicationProgress' => $this->getApplicationProgress($student),
            'recentActivity' => Activity::where('student_id', $student->id)
                ->latest()
                ->take(3)
                ->get()
                ->map(fn($activity) => [
                    'time' => $activity->created_at->format('M d, g:i A'),
                    'text' => $activity->description
                ]),
            'messages' => Message::where('student_id', $student->id)
                ->latest()
                ->take(2)
                ->get()
                ->map(fn($message) => [
                    'sender' => $message->sender,
                    'date' => $message->created_at->format('M d'),
                    'message' => $message->content,
                    'unread' => !$message->read
                ]),
            'notifications' => Message::where('student_id', $student->id)
                ->where('read', false)
                ->count()
        ]);
    }

    private function getApplicationProgress($student)
    {
        return [
            [
                'status' => $student->personal_info_completed ? 'complete' : 'pending',
                'text' => 'Personal Information: ' . 
                    ($student->personal_info_completed ? 'Complete' : 'In Progress')
            ],
            [
                'status' => $this->getAcademicStatus($student),
                'text' => 'Academic History: ' . 
                    ($this->getAcademicStatus($student) === 'complete' ? 'Complete' : 'In Progress')
            ],
            // Add more progress items
        ];
    }

    private function getAcademicStatus($student)
    {
        return $student->academicRecords()->exists() ? 'complete' : 'pending';
    }
}
