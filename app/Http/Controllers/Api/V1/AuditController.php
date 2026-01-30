<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    /**
     * List audit logs with filtering and pagination.
     */
    public function index(Request $request)
    {
        $query = Audit::with('user')->latest();

        if ($request->filled('auditable_type')) {
            $type = $request->input('auditable_type');
            // Allow short names like "Student" -> "App\Models\Student"
            if (! str_contains($type, '\\')) {
                $type = 'App\\Models\\'.$type;
            }
            $query->where('auditable_type', $type);
        }

        if ($request->filled('auditable_id')) {
            $query->where('auditable_id', $request->input('auditable_id'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $perPage = min((int) $request->input('per_page', 50), 100);
        $audits = $query->paginate($perPage);

        return response()->json($audits);
    }
}
