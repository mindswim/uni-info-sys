<?php

namespace App\Services;

use App\Models\ApprovalRequest;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApprovalService
{
    public function createRequest(
        string $type,
        Model $requestable,
        Department $department,
        Staff $staff,
        ?string $notes = null,
        ?array $metadata = null,
    ): ApprovalRequest {
        $request = ApprovalRequest::create([
            'type' => $type,
            'requestable_type' => get_class($requestable),
            'requestable_id' => $requestable->id,
            'department_id' => $department->id,
            'requested_by' => $staff->id,
            'status' => 'pending',
            'notes' => $notes,
            'metadata' => $metadata,
        ]);

        Log::info('Approval request created', [
            'id' => $request->id,
            'type' => $type,
            'department_id' => $department->id,
            'requested_by' => $staff->id,
        ]);

        return $request;
    }

    public function approve(ApprovalRequest $request, Staff $staff, ?string $notes = null): ApprovalRequest
    {
        return DB::transaction(function () use ($request, $staff, $notes) {
            $request->update([
                'status' => 'approved',
                'approved_by' => $staff->id,
                'approved_at' => now(),
                'notes' => $notes ?? $request->notes,
            ]);

            // Side effects per type
            if ($request->type === ApprovalRequest::TYPE_ENROLLMENT_OVERRIDE) {
                $this->handleEnrollmentOverrideApproval($request);
            }

            Log::info('Approval request approved', [
                'id' => $request->id,
                'type' => $request->type,
                'approved_by' => $staff->id,
            ]);

            return $request->fresh();
        });
    }

    public function deny(ApprovalRequest $request, Staff $staff, string $reason): ApprovalRequest
    {
        $request->update([
            'status' => 'denied',
            'approved_by' => $staff->id,
            'approved_at' => now(),
            'denial_reason' => $reason,
        ]);

        Log::info('Approval request denied', [
            'id' => $request->id,
            'type' => $request->type,
            'denied_by' => $staff->id,
        ]);

        return $request->fresh();
    }

    private function handleEnrollmentOverrideApproval(ApprovalRequest $request): void
    {
        $metadata = $request->metadata;
        if (! $metadata || ! isset($metadata['course_section_id'])) {
            return;
        }

        // Increase section capacity by 1 to allow the override enrollment
        $section = CourseSection::find($metadata['course_section_id']);
        if ($section) {
            $section->increment('capacity');
        }
    }
}
