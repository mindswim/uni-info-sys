<?php

use Illuminate\Support\Facades\Route;

// Demo API endpoints with hardcoded data for testing without database
Route::prefix('demo')->group(function () {
    
    Route::get('/students', function () {
        return response()->json([
            'data' => [
                [
                    'id' => 1,
                    'student_number' => 'STU2025001',
                    'first_name' => 'Maria',
                    'last_name' => 'Rodriguez',
                    'email' => 'maria@demo.com',
                    'nationality' => 'Mexican',
                    'status' => 'active',
                    'gpa' => 3.85,
                    'created_at' => '2025-08-01T00:00:00Z'
                ],
                [
                    'id' => 2,
                    'student_number' => 'STU2025002',
                    'first_name' => 'David',
                    'last_name' => 'Park',
                    'email' => 'david@demo.com',
                    'nationality' => 'Korean',
                    'status' => 'active',
                    'gpa' => 3.92,
                    'created_at' => '2025-08-01T00:00:00Z'
                ],
                [
                    'id' => 3,
                    'student_number' => 'STU2025003',
                    'first_name' => 'Sophie',
                    'last_name' => 'Turner',
                    'email' => 'sophie@demo.com',
                    'nationality' => 'American',
                    'status' => 'active',
                    'gpa' => 3.67,
                    'created_at' => '2025-08-01T00:00:00Z'
                ]
            ],
            'meta' => [
                'total' => 3,
                'per_page' => 15,
                'current_page' => 1
            ]
        ]);
    });

    Route::get('/courses', function () {
        return response()->json([
            'data' => [
                [
                    'id' => 1,
                    'course_code' => 'CS350',
                    'title' => 'Introduction to Artificial Intelligence',
                    'description' => 'Fundamentals of AI including machine learning, neural networks, and ethical considerations',
                    'credits' => 3,
                    'department' => 'Computer Science',
                    'sections' => [
                        [
                            'id' => 1,
                            'section_number' => '001',
                            'capacity' => 2,
                            'enrolled' => 2,
                            'waitlisted' => 1,
                            'instructor' => 'Prof. Alan Turing',
                            'schedule' => 'MWF 10:00-11:30',
                            'room' => 'Science Building 101'
                        ]
                    ]
                ],
                [
                    'id' => 2,
                    'course_code' => 'CS201',
                    'title' => 'Data Structures and Algorithms',
                    'description' => 'Essential data structures and algorithmic thinking for software development',
                    'credits' => 3,
                    'department' => 'Computer Science',
                    'sections' => [
                        [
                            'id' => 2,
                            'section_number' => '001',
                            'capacity' => 30,
                            'enrolled' => 15,
                            'waitlisted' => 0,
                            'instructor' => 'Prof. Alan Turing',
                            'schedule' => 'TTh 2:00-3:30',
                            'room' => 'Science Building 102'
                        ]
                    ]
                ]
            ]
        ]);
    });

    Route::get('/enrollments', function () {
        return response()->json([
            'data' => [
                [
                    'id' => 1,
                    'student_id' => 2,
                    'student_name' => 'David Park',
                    'course_code' => 'CS350',
                    'course_title' => 'Introduction to Artificial Intelligence',
                    'section' => '001',
                    'status' => 'enrolled',
                    'enrollment_date' => '2025-08-15T00:00:00Z',
                    'grade' => null
                ],
                [
                    'id' => 2,
                    'student_id' => 2,
                    'student_name' => 'David Park',
                    'course_code' => 'CS201',
                    'course_title' => 'Data Structures and Algorithms',
                    'section' => '001',
                    'status' => 'enrolled',
                    'enrollment_date' => '2025-08-15T00:00:00Z',
                    'grade' => null
                ],
                [
                    'id' => 3,
                    'student_id' => 3,
                    'student_name' => 'Sophie Turner',
                    'course_code' => 'CS350',
                    'course_title' => 'Introduction to Artificial Intelligence',
                    'section' => '001',
                    'status' => 'waitlisted',
                    'enrollment_date' => '2025-08-16T00:00:00Z',
                    'waitlist_position' => 1
                ]
            ]
        ]);
    });

    Route::get('/applications', function () {
        return response()->json([
            'data' => [
                [
                    'id' => 1,
                    'student_id' => 1,
                    'student_name' => 'Maria Rodriguez',
                    'student_email' => 'maria@demo.com',
                    'program' => 'Bachelor of Science in Computer Science',
                    'status' => 'submitted',
                    'application_date' => '2025-07-15T00:00:00Z',
                    'decision_date' => null,
                    'gpa' => 9.8,
                    'country' => 'Mexico'
                ],
                [
                    'id' => 2,
                    'student_id' => 2,
                    'student_name' => 'David Park',
                    'student_email' => 'david@demo.com',
                    'program' => 'Bachelor of Science in Computer Science',
                    'status' => 'accepted',
                    'application_date' => '2025-06-20T00:00:00Z',
                    'decision_date' => '2025-07-01T00:00:00Z',
                    'gpa' => 3.9,
                    'country' => 'South Korea'
                ]
            ]
        ]);
    });

    Route::get('/dashboard', function () {
        return response()->json([
            'stats' => [
                'total_students' => 1247,
                'active_courses' => 89,
                'pending_applications' => 156,
                'total_enrollments' => 2341,
                'departments' => 12,
                'pending_grades' => 45,
                'active_staff' => 67,
                'available_reports' => 15
            ],
            'recent_activity' => [
                [
                    'type' => 'application_submitted',
                    'message' => 'Maria Rodriguez submitted application for Computer Science',
                    'timestamp' => '2 hours ago'
                ],
                [
                    'type' => 'enrollment_waitlisted',
                    'message' => 'Sophie Turner waitlisted for AI course',
                    'timestamp' => '4 hours ago'
                ],
                [
                    'type' => 'course_filled',
                    'message' => 'CS350 Introduction to AI reached capacity',
                    'timestamp' => '1 day ago'
                ]
            ],
            'current_term' => [
                'name' => 'Fall 2025',
                'start_date' => '2025-09-01',
                'end_date' => '2025-12-20',
                'add_drop_deadline' => '2025-09-15'
            ]
        ]);
    });
});