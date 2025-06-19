<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "ProgramChoiceResource",
    title: "Program Choice Resource",
    description: "Program choice resource representation",
    properties: [
        new OA\Property(
            property: "id",
            type: "integer",
            description: "Unique identifier of the program choice",
            example: 1
        ),
        new OA\Property(
            property: "application_id",
            type: "integer",
            description: "ID of the admission application this choice belongs to",
            example: 1
        ),
        new OA\Property(
            property: "program_id",
            type: "integer",
            description: "ID of the program being chosen",
            example: 1
        ),
        new OA\Property(
            property: "preference_order",
            type: "integer",
            description: "The preference order of this program choice (1 = most preferred)",
            example: 1
        ),
        new OA\Property(
            property: "status",
            type: "string",
            description: "Current status of this program choice",
            enum: ["pending", "accepted", "rejected"],
            example: "pending"
        ),
        new OA\Property(
            property: "program",
            ref: "#/components/schemas/ProgramResource",
            description: "Program information (when loaded)"
        ),
        new OA\Property(
            property: "admission_application",
            ref: "#/components/schemas/AdmissionApplicationResource",
            description: "Admission application information (when loaded)"
        )
    ]
)]
class ProgramChoiceResource extends JsonResource
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
            'application_id' => $this->application_id,
            'program_id' => $this->program_id,
            'preference_order' => $this->preference_order,
            'status' => $this->status,
            'program' => new ProgramResource($this->whenLoaded('program')),
            'admission_application' => new AdmissionApplicationResource($this->whenLoaded('admissionApplication')),
        ];
    }
}
