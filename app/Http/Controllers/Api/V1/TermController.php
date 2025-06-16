<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Term;
use App\Http\Resources\TermResource;
use App\Http\Requests\StoreTermRequest;
use App\Http\Requests\UpdateTermRequest;
use Illuminate\Http\Request;

class TermController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Term::query();

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        return TermResource::collection($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTermRequest $request)
    {
        $term = Term::create($request->validated());
        return new TermResource($term);
    }

    /**
     * Display the specified resource.
     */
    public function show(Term $term)
    {
        return new TermResource($term);
    }

    /**
     * Update the specified resource in storage.
     * @hideFromAPIDocumentation
     */
    public function update(UpdateTermRequest $request, Term $term)
    {
        $term->update($request->validated());
        return new TermResource($term);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Term $term)
    {
        $term->delete();
        return response()->noContent();
    }
}
