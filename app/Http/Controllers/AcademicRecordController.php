namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicRecordController extends Controller
{
    public function index(Student $student): Response
    {
        $academicRecords = $student->academicRecords;

        // Return an Inertia response to render the academic records index page
        return Inertia::render('AcademicRecords/Index', [
            'student' => $student,
            'academicRecords' => $academicRecords,
        ]);
    }

    public function store(Request $request, Student $student)
    {
        $validated = $request->validate([
            'institution_name' => 'required|string|max:255',
            'qualification_type' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'gpa' => 'required|numeric|min:0|max:4',
            'transcript_url' => 'nullable|string',
            'verified' => 'boolean',
        ]);

        $student->academicRecords()->create($validated);

        // Redirect to the academic records index page with a success message
        return redirect()->route('students.academic-records.index', $student->id)
                         ->with('success', 'Academic record created successfully.');
    }

    public function show(Student $student, AcademicRecord $academicRecord): Response
    {
        // Ensure the academic record belongs to the student
        if ($academicRecord->student_id !== $student->id) {
            abort(404, 'Record not found');
        }

        // Return an Inertia response to render the academic record details page
        return Inertia::render('AcademicRecords/Show', [
            'student' => $student,
            'academicRecord' => $academicRecord,
        ]);
    }

    public function update(Request $request, Student $student, AcademicRecord $academicRecord)
    {
        // Ensure the academic record belongs to the student
        if ($academicRecord->student_id !== $student->id) {
            abort(404, 'Record not found');
        }

        $validated = $request->validate([
            'institution_name' => 'sometimes|string|max:255',
            'qualification_type' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'gpa' => 'sometimes|numeric|min:0|max:4',
            'transcript_url' => 'nullable|string',
            'verified' => 'boolean',
        ]);

        $academicRecord->update($validated);

        // Redirect to the academic record show page with a success message
        return redirect()->route('students.academic-records.show', [$student->id, $academicRecord->id])
                         ->with('success', 'Academic record updated successfully.');
    }

    public function destroy(Student $student, AcademicRecord $academicRecord)
    {
        // Ensure the academic record belongs to the student
        if ($academicRecord->student_id !== $student->id) {
            abort(404, 'Record not found');
        }

        $academicRecord->delete();

        // Redirect to the academic records index page with a success message
        return redirect()->route('students.academic-records.index', $student->id)
                         ->with('success', 'Academic record deleted successfully.');
    }
}
