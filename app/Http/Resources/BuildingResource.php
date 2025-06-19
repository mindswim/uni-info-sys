<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Building Resource",
    description: "Represents a university building.",
    properties: [
        new OA\Property(property: "id", type: "integer", readOnly: true, example: 1),
        new OA\Property(property: "name", type: "string", example: "Main Hall"),
        new OA\Property(property: "address", type: "string", example: "123 University Ave"),
        new OA\Property(
            property: "rooms",
            type: "array",
            items: new OA\Items(ref: "#/components/schemas/RoomResource")
        ),
    ]
)]
class BuildingResource extends JsonResource
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
            'name' => $this->name,
            'address' => $this->address,
            'rooms' => RoomResource::collection($this->whenLoaded('rooms')),
        ];
    }
}
