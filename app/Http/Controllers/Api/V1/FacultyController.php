<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FacultyResource;
use App\Models\Faculty;
use Illuminate\Http\Request;

/**
 * @group "Faculty Management"
 * @authenticated
 * @description APIs for managing the university's faculties, the highest level of academic organization.
 *
 * APIs for managing faculties.
 */
class FacultyController extends Controller
{
    /**
     * List all faculties.
     * 
     * @responseFile storage/responses/V1/faculties.index.json
     */
    public function index()
    {
        return FacultyResource::collection(Faculty::with('departments')->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     * @bodyParam name string required The name of the faculty. Example: Faculty of Science
     * @responseFile status=201 storage/responses/V1/faculty.json
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:faculties|max:255'
        ]);
        
        $faculty = Faculty::create($validated);
        
        return new FacultyResource($faculty);
    }

    /**
     * Display the specified resource.
     * @urlParam faculty integer required The ID of the faculty.
     * @responseFile storage/responses/V1/faculty.json
     */
    public function show(Faculty $faculty)
    {
        return new FacultyResource($faculty->load('departments'));
    }

    /**
     * Update the specified resource in storage.
     * @urlParam faculty integer required The ID of the faculty.
     * @bodyParam name string The name of the faculty. Example: Faculty of Applied Science
     * @responseFile storage/responses/V1/faculty.json
     */
    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:faculties,name,'.$faculty->id.'|max:255'
        ]);
        
        $faculty->update($validated);

        return new FacultyResource($faculty);
    }

    /**
     * Remove the specified resource from storage.
     * @urlParam faculty integer required The ID of the faculty.
     * @response status=204
     */
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();

        return response()->noContent();
    }
}
