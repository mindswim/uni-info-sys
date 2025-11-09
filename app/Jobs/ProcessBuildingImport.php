<?php

namespace App\Jobs;

use App\Models\Building;

class ProcessBuildingImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Buildings';
    }

    protected function getRequiredHeaders(): array
    {
        return ['name', 'code'];
    }

    protected function getOptionalHeaders(): array
    {
        return ['address', 'city', 'state', 'postal_code'];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'name.required' => 'Building name is required',
            'code.required' => 'Building code is required',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $existingBuilding = Building::where('code', $data['code'])->first();
        $isUpdate = $existingBuilding !== null;

        Building::updateOrCreate(
            ['code' => $data['code']],
            [
                'name' => $data['name'],
                'code' => $data['code'],
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
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
