<?php

namespace App\Jobs;

use App\Models\Room;
use App\Models\Building;

class ProcessRoomImport extends AbstractCsvImportJob
{
    protected function getEntityName(): string
    {
        return 'Rooms';
    }

    protected function getRequiredHeaders(): array
    {
        return ['room_number', 'building_code', 'capacity'];
    }

    protected function getOptionalHeaders(): array
    {
        return ['room_type'];
    }

    protected function getValidationRules(array $data): array
    {
        return [
            'room_number' => 'required|string|max:50',
            'building_code' => 'required|string|exists:buildings,code',
            'capacity' => 'required|integer|min:1',
            'room_type' => 'nullable|string|in:Classroom,Lab,Lecture Hall,Office,Seminar Room,Auditorium',
        ];
    }

    protected function getValidationMessages(): array
    {
        return [
            'room_number.required' => 'Room number is required',
            'building_code.required' => 'Building code is required',
            'building_code.exists' => 'Building does not exist',
            'capacity.required' => 'Capacity is required',
            'capacity.min' => 'Capacity must be at least 1',
        ];
    }

    protected function processRow(array $data, int $rowNumber, array &$stats): void
    {
        $building = Building::where('code', $data['building_code'])->first();

        if (!$building) {
            throw new \Exception("Building '{$data['building_code']}' not found");
        }

        $existingRoom = Room::where('room_number', $data['room_number'])
            ->where('building_id', $building->id)
            ->first();
        $isUpdate = $existingRoom !== null;

        Room::updateOrCreate(
            [
                'room_number' => $data['room_number'],
                'building_id' => $building->id,
            ],
            [
                'capacity' => $data['capacity'],
                'room_type' => $data['room_type'] ?? 'Classroom',
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
