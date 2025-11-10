<?php

namespace App\Jobs;

use App\Models\Staff;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProcessStaffImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Staff';
    }

    protected function getRequiredHeaders(): array
    {
        return ['first_name', 'last_name', 'email'];
    }

    protected function getOptionalHeaders(): array
    {
        return [
            'employee_number',
            'department_code',
            'title',
            'office_location',
            'office_phone',
            'hire_date',
        ];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'employee_number' => 'nullable|string|max:50',
            'department_code' => 'nullable|string|exists:departments,code',
            'title' => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'office_phone' => 'nullable|string|max:20',
            'hire_date' => 'nullable|date',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be valid',
            'department_code.exists' => 'Department does not exist',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        // Find department if provided
        $departmentId = null;
        if (!empty($data['department_code'])) {
            $department = Department::where('code', $data['department_code'])->first();
            if ($department) {
                $departmentId = $department->id;
            }
        }

        // Check if user exists
        $existingUser = User::where('email', $data['email'])->first();
        $isUpdate = $existingUser !== null;

        // Create or update user
        $userAttributes = [
            'name' => trim($data['first_name'] . ' ' . $data['last_name']),
            'email' => $data['email'],
        ];

        if (!$isUpdate) {
            $userAttributes['password'] = Hash::make(Str::random(16));
        }

        $user = User::updateOrCreate(
            ['email' => $data['email']],
            $userAttributes
        );

        // Assign Staff role
        if (!$user->hasRole('Staff')) {
            $staffRole = \App\Models\Role::where('name', 'Staff')->first();
            if ($staffRole) {
                $user->roles()->syncWithoutDetaching([$staffRole->id]);
            }
        }

        // Generate employee number if not provided
        $staffData = Staff::where('user_id', $user->id)->first();
        $employeeNumber = $data['employee_number']
            ?? $staffData?->employee_number
            ?? $this->generateEmployeeNumber();

        // Create or update staff record
        $staffAttributes = [
            'employee_number' => $employeeNumber,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'department_id' => $departmentId,
            'title' => $data['title'] ?? null,
            'office_location' => $data['office_location'] ?? null,
            'office_phone' => $data['office_phone'] ?? null,
            'hire_date' => $data['hire_date'] ?? null,
        ];

        Staff::updateOrCreate(
            ['user_id' => $user->id],
            $staffAttributes
        );

        if ($isUpdate) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }

        $stats['successful']++;
    }

    private function generateEmployeeNumber(): string
    {
        $year = date('y');
        $randomPart = str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
        $employeeNumber = "E{$year}{$randomPart}";

        while (Staff::where('employee_number', $employeeNumber)->exists()) {
            $randomPart = str_pad(random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            $employeeNumber = "E{$year}{$randomPart}";
        }

        return $employeeNumber;
    }
}
