<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'building' => new BuildingResource($this->whenLoaded('building')),
            'full_name' => $this->when($this->relationLoaded('building'),
                fn() => $this->building->name . ' - Room ' . $this->room_number),
        ];
    }
}
