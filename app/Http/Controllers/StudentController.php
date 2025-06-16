<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
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

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());

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

    /**
     * API version of show method that returns JSON resource
     */
    public function showApi(Student $student)
    {
        // Eager load the relationships you want to include in the response.
        $student->load(['academicRecords', 'documents', 'admissionApplications.programChoices.program']);

        // Instead of returning an Inertia view or raw JSON, return the resource.
        // The resource will format the final JSON output.
        return new StudentResource($student);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

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
