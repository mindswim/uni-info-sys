<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'CourseResource',
    type: 'object',
    title: 'Course Resource',
    description: 'A course offered by a department in the university.',
    properties: [
        new OA\Property(property: 'id', type: 'integer', readOnly: true, example: 1),
        new OA\Property(property: 'course_code', type: 'string', maxLength: 20, example: 'CS101'),
        new OA\Property(property: 'title', type: 'string', maxLength: 255, example: 'Introduction to Computer Science'),
        new OA\Property(property: 'description', type: 'string', example: 'Basic concepts and principles of computer science.'),
        new OA\Property(property: 'credits', type: 'integer', minimum: 0, example: 3),
        new OA\Property(property: 'department_id', type: 'integer', example: 1),
        new OA\Property(
            property: 'department',
            type: 'object',
            description: 'The department this course belongs to'
        ),
        new OA\Property(
            property: 'prerequisites',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/CourseResource'),
            description: 'Courses that must be completed before taking this course'
        ),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', readOnly: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', readOnly: true),
    ],
)]
class CourseResource extends JsonResource
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
            'course_code' => $this->course_code,
            'title' => $this->title,
            'description' => $this->description,
            'credits' => $this->credits,
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'prerequisite_courses' => $this->when($this->relationLoaded('prerequisiteCourses'), fn () => CourseResource::collection($this->prerequisiteCourses)),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
