namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Student $student): Response
    {
        $documents = $student->documents;

        // Return an Inertia response to render the documents index page
        return Inertia::render('Documents/Index', [
            'student' => $student,
            'documents' => $documents,
        ]);
    }

    public function store(Request $request, Student $student)
    {
        $validated = $request->validate([
            'document_type' => 'required|string|in:passport,transcript,recommendation_letter,cv',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'status' => 'required|string|in:pending,approved,rejected',
        ]);

        $path = $request->file('file')->store('', 'documents');

        $student->documents()->create([
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'status' => $validated['status'],
            'verified' => false,
            'uploaded_at' => now(),
        ]);

        // Redirect to the Documents index page with a success message
        return redirect()->route('students.documents.index', $student->id)
                         ->with('success', 'Document uploaded successfully.');
    }

    public function show(Student $student, Document $document): Response
    {
        if ($document->student_id !== $student->id) {
            abort(404, 'Document not found');
        }

        // Return an Inertia response to render the document details page
        return Inertia::render('Documents/Show', [
            'student' => $student,
            'document' => $document,
        ]);
    }

    public function update(Request $request, Student $student, Document $document)
    {
        if ($document->student_id !== $student->id) {
            abort(404, 'Document not found');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
            'verified' => 'boolean',
        ]);

        $data = $validated;

        if (isset($validated['verified']) && $validated['verified']) {
            $data['verified_at'] = now();
        }

        $document->update($data);

        // Redirect to the Documents index page with a success message
        return redirect()->route('students.documents.index', $student->id)
                         ->with('success', 'Document updated successfully.');
    }

    public function destroy(Student $student, Document $document)
    {
        if ($document->student_id !== $student->id) {
            abort(404, 'Document not found');
        }

        if (Storage::disk('documents')->exists($document->file_path)) {
            Storage::disk('documents')->delete($document->file_path);
        }

        $document->delete();

        // Redirect to the Documents index page with a success message
        return redirect()->route('students.documents.index', $student->id)
                         ->with('success', 'Document deleted successfully.');
    }
}
