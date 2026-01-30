<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: 'Room Resource',
    description: 'Represents a room within a building.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'room_number', type: 'string', example: '101'),
        new OA\Property(property: 'capacity', type: 'integer', example: 30),
        new OA\Property(property: 'type', type: 'string', enum: ['lecture_hall', 'laboratory', 'seminar_room', 'office'], example: 'lecture_hall'),
        new OA\Property(property: 'building', ref: '#/components/schemas/BuildingResource'),
    ]
)]
class RoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_number' => $this->room_number,
            'capacity' => $this->capacity,
            'type' => $this->type,
            'building' => new BuildingResource($this->whenLoaded('building')),
        ];
    }
}
