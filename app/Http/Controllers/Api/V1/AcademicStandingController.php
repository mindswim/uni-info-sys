<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\UpdateAcademicStandings;
use App\Models\Student;

class AcademicStandingController extends Controller
{
    public function recalculate()
    {
        UpdateAcademicStandings::dispatch();

        return response()->json(['message' => 'Academic standing recalculation job has been dispatched.']);
    }

    public function summary()
    {
        $distribution = Student::whereIn('enrollment_status', ['full_time', 'part_time', 'active'])
            ->selectRaw('academic_status, COUNT(*) as count')
            ->groupBy('academic_status')
            ->pluck('count', 'academic_status')
            ->toArray();

        $total = array_sum($distribution);

        return response()->json([
            'data' => [
                'distribution' => $distribution,
                'total_students' => $total,
            ],
        ]);
    }
}
