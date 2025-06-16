<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Http\Resources\EnrollmentResource;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Enrollment::with(['student.user', 'courseSection']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('course_section_id')) {
            $query->where('course_section_id', $request->course_section_id);
        }

        return EnrollmentResource::collection($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEnrollmentRequest $request)
    {
        $data = $request->validated();
        $data['enrollment_date'] = now();
        $data['status'] = 'enrolled';

        $enrollment = Enrollment::create($data);
        $enrollment->load(['student.user', 'courseSection']);
        
        return new EnrollmentResource($enrollment);
    }

    /**
     * Display the specified resource.
     */
    public function show(Enrollment $enrollment)
    {
        $enrollment->load(['student.user', 'courseSection']);
        return new EnrollmentResource($enrollment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment)
    {
        $enrollment->update($request->validated());
        $enrollment->load(['student.user', 'courseSection']);
        return new EnrollmentResource($enrollment);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enrollment $enrollment)
    {
        // We don't delete enrollment records, just mark them as withdrawn.
        $enrollment->update(['status' => 'withdrawn']);
        return new EnrollmentResource($enrollment);
    }
}
