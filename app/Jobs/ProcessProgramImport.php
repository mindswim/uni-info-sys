<?php

namespace App\Jobs;

use App\Models\Department;
use App\Models\Program;

class ProcessProgramImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Programs';
    }

    protected function getRequiredHeaders(): array
    {
        return ['name', 'code', 'department_code', 'degree_level'];
    }

    protected function getOptionalHeaders(): array
    {
        return ['description', 'credits_required'];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'department_code' => 'required|string|exists:departments,code',
            'degree_level' => 'required|string|in:Associate,Bachelor,Master,Doctoral,Certificate',
            'description' => 'nullable|string',
            'credits_required' => 'nullable|integer|min:0|max:200',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'name.required' => 'Program name is required',
            'code.required' => 'Program code is required',
            'department_code.required' => 'Department code is required',
            'department_code.exists' => 'Department does not exist',
            'degree_level.required' => 'Degree level is required',
            'degree_level.in' => 'Invalid degree level',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $department = Department::where('code', $data['department_code'])->first();

        if (! $department) {
            throw new \Exception("Department '{$data['department_code']}' not found");
        }

        $existingProgram = Program::where('code', $data['code'])->first();
        $isUpdate = $existingProgram !== null;

        Program::updateOrCreate(
            ['code' => $data['code']],
            [
                'name' => $data['name'],
                'code' => $data['code'],
                'department_id' => $department->id,
                'degree_level' => $data['degree_level'],
                'description' => $data['description'] ?? null,
                'credits_required' => $data['credits_required'] ?? null,
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
