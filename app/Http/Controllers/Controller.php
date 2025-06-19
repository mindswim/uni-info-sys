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
 */
abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
