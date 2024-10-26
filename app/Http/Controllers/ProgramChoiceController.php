namespace App\Http\Controllers;

use App\Models\AdmissionApplication;
use App\Models\ProgramChoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramChoiceController extends Controller
{
    public function index(AdmissionApplication $application)
    {
        $programChoices = $application->programChoices()->with('program')->get();

        // Return an Inertia response for rendering the ProgramChoices index page
        return Inertia::render('ProgramChoices/Index', [
            'application' => $application,
            'programChoices' => $programChoices,
        ]);
    }

    public function store(Request $request, AdmissionApplication $application)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'preference_order' => 'required|integer|min:1',
            'status' => 'required|string|in:pending,accepted,rejected',
        ]);

        // Check if preference order already exists
        if ($application->programChoices()->where('preference_order', $validated['preference_order'])->exists()) {
            return redirect()->back()->withErrors(['preference_order' => 'Preference order already exists']);
        }

        $application->programChoices()->create($validated);

        // Redirect to the ProgramChoices index page with a success message
        return redirect()->route('applications.program-choices.index', $application->id)
                         ->with('success', 'Program choice added successfully.');
    }

    public function update(Request $request, AdmissionApplication $application, ProgramChoice $programChoice)
    {
        $validated = $request->validate([
            'preference_order' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string|in:pending,accepted,rejected',
        ]);

        if (isset($validated['preference_order'])) {
            // Check if new preference order already exists
            $exists = $application->programChoices()
                ->where('preference_order', $validated['preference_order'])
                ->where('id', '!=', $programChoice->id)
                ->exists();

            if ($exists) {
                return redirect()->back()->withErrors(['preference_order' => 'Preference order already exists']);
            }
        }

        $programChoice->update($validated);

        // Redirect to the ProgramChoices index page with a success message
        return redirect()->route('applications.program-choices.index', $application->id)
                         ->with('success', 'Program choice updated successfully.');
    }

    public function destroy(AdmissionApplication $application, ProgramChoice $programChoice)
    {
        $programChoice->delete();

        // Redirect to the ProgramChoices index page with a success message
        return redirect()->route('applications.program-choices.index', $application->id)
                         ->with('success', 'Program choice deleted successfully.');
    }
}
