<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "EnrollmentResource",
    title: "Enrollment Resource",
    description: "Represents a student's enrollment in a course section.",
    properties: [
        new OA\Property(property: "id", type: "integer", readOnly: true, example: 1),
        new OA\Property(property: "status", type: "string", enum: ["enrolled", "waitlisted", "completed", "withdrawn"], example: "enrolled"),
        new OA\Property(property: "grade", type: "string", nullable: true, example: "A-"),
        new OA\Property(property: "enrolled_at", type: "string", format: "date-time", readOnly: true),
        new OA\Property(property: "updated_at", type: "string", format: "date-time", readOnly: true),
        new OA\Property(
            property: "student",
            type: "object",
            properties: [
                new OA\Property(property: "id", type: "integer", example: 1),
                new OA\Property(property: "student_number", type: "string", example: "SN2024001"),
                new OA\Property(property: "name", type: "string", example: "John Doe"),
                new OA\Property(property: "email", type: "string", format: "email", example: "john.doe@example.com"),
            ]
        ),
        new OA\Property(
            property: "course_section",
            type: "object",
            properties: [
                new OA\Property(property: "id", type: "integer", example: 1),
                new OA\Property(property: "section_number", type: "string", nullable: true, example: "A01"),
                new OA\Property(property: "capacity", type: "integer", example: 40),
                new OA\Property(property: "enrolled_count", type: "integer", example: 38),
                new OA\Property(property: "available_spots", type: "integer", example: 2),
                new OA\Property(property: "schedule_days", type: "array", items: new OA\Items(type: "string"), example: ["Tuesday", "Thursday"]),
                new OA\Property(property: "start_time", type: "string", format: "time", example: "10:00"),
                new OA\Property(property: "end_time", type: "string", format: "time", example: "11:30"),
                new OA\Property(property: "schedule_display", type: "string", example: "Tuesday, Thursday 10:00 AM-11:30 AM"),
                new OA\Property(
                    property: "course",
                    type: "object",
                    ref: "#/components/schemas/CourseResource"
                ),
                new OA\Property(
                    property: "term",
                    type: "object",
                    ref: "#/components/schemas/TermResource"
                ),
                new OA\Property(
                    property: "instructor",
                    type: "object",
                    ref: "#/components/schemas/StaffResource"
                ),
                new OA\Property(
                    property: "room",
                    type: "object",
                    ref: "#/components/schemas/RoomResource"
                ),
            ]
        ),
    ]
)]
class EnrollmentResource extends JsonResource
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
            'status' => $this->status,
            'grade' => $this->grade,
            'enrolled_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Student information
            'student' => $this->whenLoaded('student', function () {
                return [
                    'id' => $this->student->id,
                    'student_number' => $this->student->student_number,
                    'name' => $this->student->first_name . ' ' . $this->student->last_name,
                    'email' => $this->student->user->email ?? null,
                ];
            }),
            
            // Course section with nested relationships
            'course_section' => $this->whenLoaded('courseSection', function () {
                $courseSection = $this->courseSection;
                $enrolledCount = $courseSection->enrollments_count ?? $courseSection->enrollments()->count();
                
                return [
                    'id' => $courseSection->id,
                    'section_number' => $courseSection->section_number,
                    'capacity' => $courseSection->capacity,
                    'enrolled_count' => $enrolledCount,
                    'available_spots' => max(0, $courseSection->capacity - $enrolledCount),
                    'schedule_days' => $courseSection->schedule_days,
                    'start_time' => $courseSection->start_time ? (is_string($courseSection->start_time) ? $courseSection->start_time : $courseSection->start_time->format('H:i')) : null,
                    'end_time' => $courseSection->end_time ? (is_string($courseSection->end_time) ? $courseSection->end_time : $courseSection->end_time->format('H:i')) : null,
                    'schedule_display' => $this->formatScheduleDisplay($courseSection),
                    
                    // Course information
                    'course' => $this->when($courseSection->relationLoaded('course'), function () use ($courseSection) {
                        return [
                            'id' => $courseSection->course->id,
                            'course_code' => $courseSection->course->course_code,
                            'title' => $courseSection->course->title,
                            'credits' => $courseSection->course->credits,
                            'description' => $courseSection->course->description,
                        ];
                    }),
                    
                    // Term information
                    'term' => $this->when($courseSection->relationLoaded('term'), function () use ($courseSection) {
                        return [
                            'id' => $courseSection->term->id,
                            'name' => $courseSection->term->name,
                            'academic_year' => $courseSection->term->academic_year,
                            'semester' => $courseSection->term->semester,
                            'start_date' => $courseSection->term->start_date?->format('Y-m-d'),
                            'end_date' => $courseSection->term->end_date?->format('Y-m-d'),
                        ];
                    }),
                    
                    // Instructor information
                    'instructor' => $this->when($courseSection->relationLoaded('instructor'), function () use ($courseSection) {
                        if (!$courseSection->instructor) return null;
                        
                        return [
                            'id' => $courseSection->instructor->id,
                            'name' => $courseSection->instructor->user->name ?? 'Unknown',
                            'job_title' => $courseSection->instructor->job_title,
                            'office_location' => $courseSection->instructor->office_location,
                        ];
                    }),
                    
                    // Room and building information
                    'room' => $this->when($courseSection->relationLoaded('room'), function () use ($courseSection) {
                        if (!$courseSection->room) return null;
                        
                        return [
                            'id' => $courseSection->room->id,
                            'room_number' => $courseSection->room->room_number,
                            'capacity' => $courseSection->room->capacity,
                            'type' => $courseSection->room->type,
                            'building' => $this->when($courseSection->room->relationLoaded('building'), function () use ($courseSection) {
                                return [
                                    'id' => $courseSection->room->building->id,
                                    'name' => $courseSection->room->building->name,
                                    'address' => $courseSection->room->building->address,
                                ];
                            }),
                        ];
                    }),
                ];
            }),
        ];
    }
    
    /**
     * Format schedule display string
     */
    private function formatScheduleDisplay($courseSection): ?string
    {
        if (!$courseSection->schedule_days || !$courseSection->start_time || !$courseSection->end_time) {
            return null;
        }
        
        // Handle both Carbon objects and string values
        $startTime = is_string($courseSection->start_time) 
            ? \Carbon\Carbon::createFromFormat('H:i:s', $courseSection->start_time)
            : $courseSection->start_time;
            
        $endTime = is_string($courseSection->end_time)
            ? \Carbon\Carbon::createFromFormat('H:i:s', $courseSection->end_time)
            : $courseSection->end_time;
        
        $daysString = is_array($courseSection->schedule_days) 
            ? implode(', ', $courseSection->schedule_days)
            : $courseSection->schedule_days;
            
        return sprintf(
            '%s %s-%s',
            $daysString,
            $startTime->format('g:i A'),
            $endTime->format('g:i A')
        );
    }
}
