<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="University Admissions System API",
 *     version="1.0.0",
 *     description="RESTful API for managing university admissions, student enrollment, and academic records",
 *     @OA\Contact(
 *         email="admin@university.edu"
 *     )
 * )
 * @OA\Server(
 *     url="/api/v1",
 *     description="API V1"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 * @OA\Parameter(
 *    parameter="enrollment_student_id_filter",
 *    name="student_id",
 *    in="query",
 *    description="Filter by student ID",
 *    required=false,
 *    @OA\Schema(type="integer")
 * )
 * @OA\Parameter(
 *   parameter="enrollment_course_section_id_filter",
 *   name="course_section_id",
 *   in="query",
 *   description="Filter by course section ID",
 *   required=false,
 *   @OA\Schema(type="integer")
 * )
 * @OA\Parameter(
 *  parameter="enrollment_status_filter",
 *  name="status",
 *  in="query",
 *  description="Filter by enrollment status",
 *  required=false,
 *  @OA\Schema(type="string", enum={"enrolled", "waitlisted", "completed", "withdrawn"})
 * )
 * @OA\Schema(
 *     schema="ProblemDetails",
 *     title="RFC 7807 Problem Details",
 *     description="Standard error response format following RFC 7807",
 *     type="object",
 *     required={"type", "title", "status", "detail"},
 *     @OA\Property(property="type", type="string", format="uri", example="https://tools.ietf.org/html/rfc7231#section-6.5.4", description="A URI reference that identifies the problem type"),
 *     @OA\Property(property="title", type="string", example="Resource Not Found", description="A short, human-readable summary of the problem type"),
 *     @OA\Property(property="status", type="integer", example=404, description="The HTTP status code"),
 *     @OA\Property(property="detail", type="string", example="The requested resource could not be found.", description="A human-readable explanation specific to this occurrence"),
 *     @OA\Property(property="errors", type="object", description="Validation errors (for 422 responses)", additionalProperties={"type": "array", "items": {"type": "string"}}),
 *     @OA\Property(property="extensions", type="object", description="Additional problem-specific extension members", additionalProperties=true)
 * )
 * @OA\Schema(
 *     schema="ValidationError",
 *     title="Validation Error",
 *     description="RFC 7807 formatted validation error",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/ProblemDetails"),
 *         @OA\Schema(
 *             type="object",
 *             @OA\Property(property="type", type="string", example="https://tools.ietf.org/html/rfc4918#section-11.2"),
 *             @OA\Property(property="title", type="string", example="Validation Failed"),
 *             @OA\Property(property="status", type="integer", example=422),
 *             @OA\Property(property="detail", type="string", example="The given data was invalid."),
 *             @OA\Property(
 *                 property="errors",
 *                 type="object",
 *                 example={"name": {"The name field is required."}},
 *                 additionalProperties={"type": "array", "items": {"type": "string"}}
 *             )
 *         )
 *     }
 * )
 * @OA\Schema(
 *     schema="NotFoundError",
 *     title="Not Found Error",
 *     description="RFC 7807 formatted not found error",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/ProblemDetails"),
 *         @OA\Schema(
 *             type="object",
 *             @OA\Property(property="type", type="string", example="https://tools.ietf.org/html/rfc7231#section-6.5.4"),
 *             @OA\Property(property="title", type="string", example="Resource Not Found"),
 *             @OA\Property(property="status", type="integer", example=404),
 *             @OA\Property(property="detail", type="string", example="No query results for model [App\\Models\\Faculty] 99999")
 *         )
 *     }
 * )
 * @OA\Schema(
 *     schema="UnauthorizedError",
 *     title="Unauthorized Error",
 *     description="RFC 7807 formatted unauthorized error",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/ProblemDetails"),
 *         @OA\Schema(
 *             type="object",
 *             @OA\Property(property="type", type="string", example="https://tools.ietf.org/html/rfc7235#section-3.1"),
 *             @OA\Property(property="title", type="string", example="Unauthenticated"),
 *             @OA\Property(property="status", type="integer", example=401),
 *             @OA\Property(property="detail", type="string", example="Unauthenticated.")
 *         )
 *     }
 * )
 * @OA\Schema(
 *     schema="ForbiddenError",
 *     title="Forbidden Error",
 *     description="RFC 7807 formatted forbidden error",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/ProblemDetails"),
 *         @OA\Schema(
 *             type="object",
 *             @OA\Property(property="type", type="string", example="https://tools.ietf.org/html/rfc7231#section-6.5.3"),
 *             @OA\Property(property="title", type="string", example="Forbidden"),
 *             @OA\Property(property="status", type="integer", example=403),
 *             @OA\Property(property="detail", type="string", example="This action is unauthorized.")
 *         )
 *     }
 * )
 */
abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
