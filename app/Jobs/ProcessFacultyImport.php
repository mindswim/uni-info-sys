<?php

namespace App\Jobs;

use App\Models\Faculty;

class ProcessFacultyImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Faculties';
    }

    protected function getRequiredHeaders(): array
    {
        return ['name'];
    }

    protected function getOptionalHeaders(): array
    {
        return [];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'name' => 'required|string|max:255',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'name.required' => 'Faculty name is required',
            'name.max' => 'Faculty name must not exceed 255 characters',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $existingFaculty = Faculty::where('name', $data['name'])->first();
        $isUpdate = $existingFaculty !== null;

        Faculty::updateOrCreate(
            ['name' => $data['name']],
            ['name' => $data['name']]
        );

        if ($isUpdate) {
            $stats['updated']++;
        } else {
            $stats['created']++;
        }

        $stats['successful']++;
    }
}
