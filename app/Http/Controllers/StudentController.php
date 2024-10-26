namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['academicRecords', 'documents', 'admissionApplications'])
            ->paginate(10);

        // Return an Inertia response for rendering the Students index page
        return Inertia::render('Students/Index', [
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'student_number' => 'required|unique:students',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string',
            'nationality' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'required|string',
            'phone' => 'required|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_phone' => 'required|string',
        ]);

        $student = Student::create($validated);

        // Redirect to the Students index page with a success message
        return redirect()->route('students.index')->with('success', 'Student created successfully.');
    }

    public function show(Student $student)
    {
        $student->load(['academicRecords', 'documents', 'admissionApplications.programChoices.program']);

        // Return an Inertia response for rendering the Student show page
        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|string',
            'nationality' => 'sometimes|string',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'state' => 'sometimes|string',
            'postal_code' => 'sometimes|string',
            'country' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'emergency_contact_name' => 'sometimes|string',
            'emergency_contact_phone' => 'sometimes|string',
        ]);

        $student->update($validated);

        // Redirect to the Student show page with a success message
        return redirect()->route('students.show', $student->id)->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student)
    {
        $student->delete();

        // Redirect to the Students index page with a success message
        return redirect()->route('students.index')->with('success', 'Student deleted successfully.');
    }
}
