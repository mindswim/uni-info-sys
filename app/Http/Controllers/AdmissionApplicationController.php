namespace App\Http\Controllers;

use App\Models\AdmissionApplication;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionApplicationController extends Controller
{
    public function index(Student $student): Response
    {
        $applications = $student->admissionApplications()
            ->with('programChoices.program')
            ->paginate(10);

        // Return an Inertia response to render the applications index page
        return Inertia::render('AdmissionApplications/Index', [
            'student' => $student,
            'applications' => $applications,
        ]);
    }

    public function store(Request $request, Student $student)
    {
        $validated = $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|string',
            'status' => 'required|string|in:draft,submitted,under_review,accepted,rejected',
        ]);

        $student->admissionApplications()->create([
            ...$validated,
            'application_date' => now(),
        ]);

        // Redirect to the applications index page with a success message
        return redirect()->route('students.admission-applications.index', $student->id)
                         ->with('success', 'Admission application created successfully.');
    }

    public function show(Student $student, AdmissionApplication $application): Response
    {
        // Ensure the application belongs to the student
        if ($application->student_id !== $student->id) {
            abort(404, 'Application not found');
        }

        $application->load('programChoices.program');

        // Return an Inertia response to render the application show page
        return Inertia::render('AdmissionApplications/Show', [
            'student' => $student,
            'application' => $application,
        ]);
    }

    public function update(Request $request, Student $student, AdmissionApplication $application)
    {
        // Ensure the application belongs to the student
        if ($application->student_id !== $student->id) {
            abort(404, 'Application not found');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:draft,submitted,under_review,accepted,rejected',
            'decision_status' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        if (in_array($validated['status'], ['accepted', 'rejected'])) {
            $validated['decision_date'] = now();
        }

        $application->update($validated);

        // Redirect to the application show page with a success message
        return redirect()->route('students.admission-applications.show', [$student->id, $application->id])
                         ->with('success', 'Admission application updated successfully.');
    }

    public function destroy(Student $student, AdmissionApplication $application)
    {
        // Ensure the application belongs to the student
        if ($application->student_id !== $student->id) {
            abort(404, 'Application not found');
        }

        $application->delete();

        // Redirect to the applications index page with a success message
        return redirect()->route('students.admission-applications.index', $student->id)
                         ->with('success', 'Admission application deleted successfully.');
    }
}
