<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use App\Http\Resources\StaffResource;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Staff::class);

        $query = Staff::with(['user', 'department']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        return StaffResource::collection($query->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStaffRequest $request)
    {
        $this->authorize('create', Staff::class);

        $validated = $request->validated();

        $staff = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['user']['name'],
                'email' => $validated['user']['email'],
                'password' => Hash::make($validated['user']['password']),
            ]);

            return Staff::create([
                'user_id' => $user->id,
                'department_id' => $validated['department_id'],
                'job_title' => $validated['job_title'],
                'bio' => $validated['bio'] ?? null,
                'office_location' => $validated['office_location'] ?? null,
            ]);
        });

        $staff->load(['user', 'department']);

        return new StaffResource($staff);
    }

    /**
     * Display the specified resource.
     */
    public function show(Staff $staff)
    {
        $this->authorize('view', $staff);

        $staff->load(['user', 'department']);
        return new StaffResource($staff);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        $this->authorize('update', $staff);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $staff) {
            if (isset($validated['user'])) {
                $staff->user->update($validated['user']);
            }
            
            $staff->update($validated);
        });

        $staff->load(['user', 'department']);
        return new StaffResource($staff);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staff $staff)
    {
        $this->authorize('delete', $staff);

        DB::transaction(function () use ($staff) {
            // Workaround for failing cascade delete in test environment
            $user = $staff->user;
            $staff->delete();
            if ($user) {
                $user->delete();
            }
        });

        return response()->noContent();
    }
}
