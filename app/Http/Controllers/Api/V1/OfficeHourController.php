<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OfficeHourSlot;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfficeHourController extends Controller
{
    public function index(Staff $staff): JsonResponse
    {
        $slots = $staff->officeHourSlots()
            ->active()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json(['data' => $slots]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'staff_id' => ['required', 'exists:staff,id'],
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_virtual' => ['boolean'],
            'meeting_link' => ['nullable', 'url', 'max:255'],
            'max_appointments' => ['integer', 'min:1', 'max:50'],
        ]);

        $slot = OfficeHourSlot::create($validated);

        return response()->json([
            'message' => 'Office hour slot created successfully.',
            'data' => $slot,
        ], 201);
    }

    public function update(Request $request, OfficeHourSlot $officeHourSlot): JsonResponse
    {
        $validated = $request->validate([
            'day_of_week' => ['sometimes', 'integer', 'between:0,6'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_virtual' => ['boolean'],
            'meeting_link' => ['nullable', 'url', 'max:255'],
            'max_appointments' => ['integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $officeHourSlot->update($validated);

        return response()->json([
            'message' => 'Office hour slot updated successfully.',
            'data' => $officeHourSlot,
        ]);
    }

    public function destroy(OfficeHourSlot $officeHourSlot): JsonResponse
    {
        $officeHourSlot->delete();

        return response()->json(null, 204);
    }

    public function available(Staff $staff, Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = \Carbon\Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;

        $slots = $staff->officeHourSlots()
            ->active()
            ->forDay($dayOfWeek)
            ->orderBy('start_time')
            ->get();

        return response()->json(['data' => $slots]);
    }
}
