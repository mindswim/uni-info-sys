<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "StudentResource",
    title: "Student Resource",
    description: "Represents a student in the system.",
    properties: [
        new OA\Property(property: "id", type: "integer", description: "The unique identifier for the student.", example: 1),
        new OA\Property(property: "student_number", type: "string", description: "The unique student identification number.", example: "2024-00001"),
        new OA\Property(property: "first_name", type: "string", example: "John"),
        new OA\Property(property: "last_name", type: "string", example: "Doe"),
        new OA\Property(property: "full_name", type: "string", example: "John Doe"),
        new OA\Property(property: "date_of_birth", type: "string", format: "date", example: "2005-01-15"),
        new OA\Property(property: "gender", type: "string", example: "Male"),
        new OA\Property(property: "nationality", type: "string", example: "American"),
        new OA\Property(property: "address", type: "string", example: "123 Main St"),
        new OA\Property(property: "city", type: "string", example: "Anytown"),
        new OA\Property(property: "state", type: "string", example: "CA"),
        new OA\Property(property: "postal_code", type: "string", example: "12345"),
        new OA\Property(property: "country", type: "string", example: "USA"),
        new OA\Property(property: "phone", type: "string", example: "555-1234"),
        new OA\Property(property: "emergency_contact_name", type: "string", example: "Jane Doe"),
        new OA\Property(property: "emergency_contact_phone", type: "string", example: "555-5678"),
        new OA\Property(property: "user", ref: "#/components/schemas/UserResource", description: "The user account associated with the student (when loaded)."),
    ]
)]
class StudentResource extends JsonResource
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
            'student_number' => $this->student_number,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->first_name . ' ' . $this->last_name,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'nationality' => $this->nationality,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
            'email' => $this->user->email ?? null,
            'enrollment_status' => $this->enrollment_status,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'user' => new UserResource($this->whenLoaded('user')),
            'major_program' => $this->whenLoaded('majorProgram'),
            'minor_program' => $this->whenLoaded('minorProgram'),
            'enrollments' => EnrollmentResource::collection($this->whenLoaded('enrollments')),
            'academic_records' => AcademicRecordResource::collection($this->whenLoaded('academicRecords')),
        ];
    }
}
