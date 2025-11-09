<?php

namespace App\Jobs;

use App\Models\Term;

class ProcessTermImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Terms';
    }

    protected function getRequiredHeaders(): array
    {
        return ['name', 'code', 'start_date', 'end_date'];
    }

    protected function getOptionalHeaders(): array
    {
        return ['is_current'];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'nullable|boolean',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'name.required' => 'Term name is required',
            'code.required' => 'Term code is required',
            'start_date.required' => 'Start date is required',
            'end_date.required' => 'End date is required',
            'end_date.after' => 'End date must be after start date',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $existingTerm = Term::where('code', $data['code'])->first();
        $isUpdate = $existingTerm !== null;

        // If this is marked as current, unset other current terms
        if (isset($data['is_current']) && $data['is_current']) {
            Term::where('is_current', true)->update(['is_current' => false]);
        }

        Term::updateOrCreate(
            ['code' => $data['code']],
            [
                'name' => $data['name'],
                'code' => $data['code'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'is_current' => $data['is_current'] ?? false,
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
