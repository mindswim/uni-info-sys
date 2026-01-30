<?php

namespace App\Jobs;

use App\Models\Department;
use App\Models\Faculty;

class ProcessDepartmentImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Departments';
    }

    protected function getRequiredHeaders(): array
    {
        return ['name', 'code', 'faculty_name'];
    }

    protected function getOptionalHeaders(): array
    {
        return [];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'faculty_name' => 'required|string|exists:faculties,name',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'name.required' => 'Department name is required',
            'code.required' => 'Department code is required',
            'faculty_name.required' => 'Faculty name is required',
            'faculty_name.exists' => 'Faculty does not exist',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $faculty = Faculty::where('name', $data['faculty_name'])->first();

        if (! $faculty) {
            throw new \Exception("Faculty '{$data['faculty_name']}' not found");
        }

        $existingDept = Department::where('code', $data['code'])->first();
        $isUpdate = $existingDept !== null;

        Department::updateOrCreate(
            ['code' => $data['code']],
            [
                'name' => $data['name'],
                'code' => $data['code'],
                'faculty_id' => $faculty->id,
            ]
        );

        if ($isUpdate) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }

        $stats['successful']++;
    }
}
