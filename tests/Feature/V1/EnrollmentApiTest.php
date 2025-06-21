<?php

namespace Tests\Feature\Api\V1;

use App\Models\Building;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Faculty;
use App\Models\Role;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentApiTest extends TestCase
{
    use RefreshDatabase;

    private Student $student;
    private CourseSection $courseSection;
    private CourseSection $fullCourseSection;
    private Term $term;
    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->createTestData();
        
        // Authenticate as an admin user for API tests
        $user = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $user->roles()->attach($adminRole);
        Sanctum::actingAs($user);
    }

    private function createTestData(): void
    {
        // Create faculty and department
        $faculty = Faculty::factory()->create();
        $department = Department::factory()->create(['faculty_id' => $faculty->id]);
        
        // Create term with future add_drop_deadline
        $this->term = Term::factory()->create([
            'name' => 'Fall 2024',
            'academic_year' => 2024,
            'semester' => 'Fall',
            'start_date' => now()->addDays(30),
            'end_date' => now()->addDays(120),
            'add_drop_deadline' => now()->addDays(60),
        ]);
        
        // Create course
        $this->course = Course::factory()->create(['department_id' => $department->id]);
        
        // Create building and room
        $building = Building::factory()->create();
        $room = Room::factory()->create(['building_id' => $building->id]);
        
        // Create instructor
        $instructorUser = User::factory()->create();
        $instructor = Staff::factory()->create([
            'user_id' => $instructorUser->id,
            'department_id' => $department->id,
        ]);
        
        // Create student
        $studentUser = User::factory()->create(['email_verified_at' => now()]);
        $this->student = Student::factory()->create(['user_id' => $studentUser->id]);
        
        // Create course sections
        $this->courseSection = CourseSection::factory()->create([
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'section_number' => '001',
            'capacity' => 30,
        ]);
        
        // Create a full course section for capacity testing
        $this->fullCourseSection = CourseSection::factory()->create([
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'instructor_id' => $instructor->id,
            'room_id' => $room->id,
            'section_number' => '002',
            'capacity' => 2,
        ]);
        
        // Fill the course section to capacity
        $students = Student::factory()->count(2)->create();
        foreach ($students as $student) {
            Enrollment::factory()->create([
                'student_id' => $student->id,
                'course_section_id' => $this->fullCourseSection->id,
                'status' => 'enrolled',
            ]);
        }
    }

    /** @test */
    public function it_can_list_enrollments_with_pagination()
    {
        // Create some enrollments
        Enrollment::factory()->count(5)->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->getJson('/api/v1/enrollments');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'status',
                        'grade',
                        'enrolled_at',
                        'student' => [
                            'id',
                            'student_number',
                            'name',
                        ],
                        'course_section' => [
                            'id',
                            'section_number',
                            'capacity',
                            'enrolled_count',
                            'available_spots',
                        ],
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    /** @test */
    public function it_can_create_enrollment_with_available_capacity()
    {
        $enrollmentData = [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments', $enrollmentData);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Student has been successfully enrolled in the course section.',
                'data' => [
                    'status' => 'enrolled',
                    'student' => [
                        'id' => $this->student->id,
                    ],
                    'course_section' => [
                        'id' => $this->courseSection->id,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);
    }

    /** @test */
    public function it_automatically_waitlists_when_course_section_is_full()
    {
        $newStudent = Student::factory()->create();
        
        $enrollmentData = [
            'student_id' => $newStudent->id,
            'course_section_id' => $this->fullCourseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments', $enrollmentData);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Student has been added to the waitlist for this course section.',
                'data' => [
                    'status' => 'waitlisted',
                ],
            ]);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $newStudent->id,
            'course_section_id' => $this->fullCourseSection->id,
            'status' => 'waitlisted',
        ]);
    }

    /** @test */
    public function it_prevents_duplicate_enrollments()
    {
        // Create existing enrollment
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        $enrollmentData = [
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments', $enrollmentData);

        $response->assertUnprocessable()
            ->assertJson([
                'detail' => 'Student is already enrolled or waitlisted for this course section'
            ]);
    }

    /** @test */
    public function it_can_show_single_enrollment_with_relationships()
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->getJson("/api/v1/enrollments/{$enrollment->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'status',
                    'grade',
                    'student' => [
                        'id',
                        'student_number',
                        'name',
                        'email',
                    ],
                    'course_section' => [
                        'id',
                        'section_number',
                        'capacity',
                        'enrolled_count',
                        'available_spots',
                        'course' => [
                            'id',
                            'course_code',
                            'title',
                            'credits',
                        ],
                        'term' => [
                            'id',
                            'name',
                            'academic_year',
                            'semester',
                        ],
                        'instructor' => [
                            'id',
                            'name',
                            'job_title',
                        ],
                        'room' => [
                            'id',
                            'room_number',
                            'building' => [
                                'id',
                                'name',
                            ],
                        ],
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_update_enrollment_status()
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        $updateData = [
            'status' => 'completed',
            'grade' => 'A',
            'reason_for_change' => 'Course completion with final grade',
        ];

        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", $updateData);

        $response->assertOk()
            ->assertJson([
                'message' => 'Enrollment updated successfully.',
                'data' => [
                    'status' => 'completed',
                    'grade' => 'A',
                ],
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'completed',
            'grade' => 'A',
        ]);
    }

    /** @test */
    public function it_validates_status_transitions()
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'completed',
        ]);

        $updateData = ['status' => 'enrolled'];

        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", $updateData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    /** @test */
    public function it_validates_grade_format()
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        $updateData = [
            'status' => 'completed',
            'grade' => 'INVALID_GRADE',
            'reason_for_change' => 'Test invalid grade format',
        ];

        $response = $this->putJson("/api/v1/enrollments/{$enrollment->id}", $updateData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['grade']);
    }

    /** @test */
    public function it_can_withdraw_enrollment()
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        $response = $this->postJson("/api/v1/enrollments/{$enrollment->id}/withdraw");

        $response->assertOk()
            ->assertJson([
                'message' => 'Student has been withdrawn from the course section.',
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'withdrawn',
        ]);
    }

    /** @test */
    public function it_can_complete_enrollment_with_grade()
    {
        $enrollment = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
            'status' => 'enrolled',
        ]);

        $response = $this->postJson("/api/v1/enrollments/{$enrollment->id}/complete", [
            'grade' => 'B+',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Enrollment marked as completed with grade.',
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'completed',
            'grade' => 'B+',
        ]);
    }

    /** @test */
    public function it_can_filter_enrollments_by_student()
    {
        $otherStudent = Student::factory()->create();
        
        // Create enrollments for both students
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);
        
        Enrollment::factory()->create([
            'student_id' => $otherStudent->id,
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->getJson("/api/v1/enrollments?student_id={$this->student->id}");

        $response->assertOk();
        
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->student->id, $data[0]['student']['id']);
    }

    /** @test */
    public function it_can_get_enrollments_by_student()
    {
        // Create additional course sections for different enrollments
        $courseSection2 = CourseSection::factory()->create([
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'section_number' => '003',
        ]);
        
        $courseSection3 = CourseSection::factory()->create([
            'course_id' => $this->course->id,
            'term_id' => $this->term->id,
            'section_number' => '004',
        ]);

        // Create enrollments for this specific student using different course sections
        $enrollments = [];
        $enrollments[] = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $this->courseSection->id,
        ]);
        $enrollments[] = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $courseSection2->id,
        ]);
        $enrollments[] = Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'course_section_id' => $courseSection3->id,
        ]);

        $response = $this->getJson("/api/v1/students/{$this->student->id}/enrollments");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'status',
                        'student',
                        'course_section',
                    ],
                ],
                'meta',
            ]);

        $data = $response->json('data');
        $this->assertCount(3, $data);
    }

    /** @test */
    public function it_can_get_enrollments_by_course_section()
    {
        Enrollment::factory()->count(5)->create([
            'course_section_id' => $this->courseSection->id,
        ]);

        $response = $this->getJson("/api/v1/course-sections/{$this->courseSection->id}/enrollments");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'status',
                        'student',
                    ],
                ],
                'meta',
            ]);

        $data = $response->json('data');
        $this->assertCount(5, $data);
    }

    /** @test */
    public function it_promotes_from_waitlist_when_spot_opens()
    {
        // Create a waitlisted student
        $waitlistedStudent = Student::factory()->create();
        $waitlistedEnrollment = Enrollment::factory()->create([
            'student_id' => $waitlistedStudent->id,
            'course_section_id' => $this->fullCourseSection->id,
            'status' => 'waitlisted',
        ]);

        // Get one of the enrolled students and withdraw them
        $enrolledEnrollment = $this->fullCourseSection->enrollments()
            ->where('status', 'enrolled')
            ->first();

        $response = $this->postJson("/api/v1/enrollments/{$enrolledEnrollment->id}/withdraw");

        $response->assertOk();

        // Check that the waitlisted student was promoted
        $waitlistedEnrollment->refresh();
        $this->assertEquals('enrolled', $waitlistedEnrollment->status);
    }

    /** @test */
    public function it_validates_required_fields_for_enrollment_creation()
    {
        $response = $this->postJson('/api/v1/enrollments', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['student_id', 'course_section_id']);
    }

    /** @test */
    public function it_validates_student_exists()
    {
        $enrollmentData = [
            'student_id' => 99999,
            'course_section_id' => $this->courseSection->id,
        ];

        $response = $this->postJson('/api/v1/enrollments', $enrollmentData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['student_id']);
    }

    /** @test */
    public function it_validates_course_section_exists()
    {
        $enrollmentData = [
            'student_id' => $this->student->id,
            'course_section_id' => 99999,
        ];

        $response = $this->postJson('/api/v1/enrollments', $enrollmentData);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['course_section_id']);
    }
} 