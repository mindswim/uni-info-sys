<?php

namespace Tests\Unit\Filters;

use App\Filters\EnrollmentFilter;
use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentFilterTest extends TestCase
{
    use RefreshDatabase;

    private EnrollmentFilter $filter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->filter = new EnrollmentFilter();
    }

    /** @test */
    public function it_can_filter_by_student_id()
    {
        $query = Enrollment::query();
        $filters = ['student_id' => 123];

        $result = $this->filter->apply($query, $filters);

        $this->assertStringContainsString('where "student_id" = ?', $result->toSql());
    }

    /** @test */
    public function it_can_filter_by_course_section_id()
    {
        $query = Enrollment::query();
        $filters = ['course_section_id' => 456];

        $result = $this->filter->apply($query, $filters);

        $this->assertStringContainsString('where "course_section_id" = ?', $result->toSql());
    }

    /** @test */
    public function it_can_filter_by_single_status()
    {
        $query = Enrollment::query();
        $filters = ['status' => 'enrolled'];

        $result = $this->filter->apply($query, $filters);

        $this->assertStringContainsString('where "status" in (?)', $result->toSql());
    }

    /** @test */
    public function it_can_filter_by_multiple_statuses()
    {
        $query = Enrollment::query();
        $filters = ['status' => ['enrolled', 'waitlisted']];

        $result = $this->filter->apply($query, $filters);

        $this->assertStringContainsString('where "status" in (?, ?)', $result->toSql());
    }

    /** @test */
    public function it_can_filter_by_term_id_through_course_section()
    {
        $query = Enrollment::query();
        $filters = ['term_id' => 789];

        $result = $this->filter->apply($query, $filters);

        $sql = $result->toSql();
        $this->assertStringContainsString('exists (select * from "course_sections"', $sql);
        $this->assertStringContainsString('"term_id" = ?', $sql);
    }

    /** @test */
    public function it_can_filter_by_course_id_through_course_section()
    {
        $query = Enrollment::query();
        $filters = ['course_id' => 101];

        $result = $this->filter->apply($query, $filters);

        $sql = $result->toSql();
        $this->assertStringContainsString('exists (select * from "course_sections"', $sql);
        $this->assertStringContainsString('"course_id" = ?', $sql);
    }

    /** @test */
    public function it_can_filter_by_department_id_through_nested_relationships()
    {
        $query = Enrollment::query();
        $filters = ['department_id' => 202];

        $result = $this->filter->apply($query, $filters);

        $sql = $result->toSql();
        $this->assertStringContainsString('exists (select * from "course_sections"', $sql);
        $this->assertStringContainsString('exists (select * from "courses"', $sql);
        $this->assertStringContainsString('"department_id" = ?', $sql);
    }

    /** @test */
    public function it_can_filter_by_instructor_id_through_course_section()
    {
        $query = Enrollment::query();
        $filters = ['instructor_id' => 303];

        $result = $this->filter->apply($query, $filters);

        $sql = $result->toSql();
        $this->assertStringContainsString('exists (select * from "course_sections"', $sql);
        $this->assertStringContainsString('"instructor_id" = ?', $sql);
    }

    /** @test */
    public function it_can_apply_multiple_filters_simultaneously()
    {
        $query = Enrollment::query();
        $filters = [
            'student_id' => 123,
            'status' => ['enrolled', 'waitlisted'],
            'term_id' => 456,
            'department_id' => 789,
        ];

        $result = $this->filter->apply($query, $filters);

        $sql = $result->toSql();
        // Check that all filters are applied
        $this->assertStringContainsString('where "student_id" = ?', $sql);
        $this->assertStringContainsString('and "status" in (?, ?)', $sql);
        $this->assertStringContainsString('and exists (select * from "course_sections"', $sql);
        $this->assertStringContainsString('"term_id" = ?', $sql);
        $this->assertStringContainsString('"department_id" = ?', $sql);
    }

    /** @test */
    public function it_ignores_empty_filters()
    {
        $query = Enrollment::query();
        $filters = [
            'student_id' => null,
            'status' => '',
            'term_id' => 0,
            'course_id' => false,
        ];

        $result = $this->filter->apply($query, $filters);

        // Should return the original query without any where clauses
        $this->assertEquals('select * from "enrollments"', $result->toSql());
    }

    /** @test */
    public function it_returns_query_builder_instance()
    {
        $query = Enrollment::query();
        $filters = ['student_id' => 123];

        $result = $this->filter->apply($query, $filters);

        $this->assertInstanceOf(Builder::class, $result);
    }

    /** @test */
    public function it_handles_empty_filter_array()
    {
        $query = Enrollment::query();
        $filters = [];

        $result = $this->filter->apply($query, $filters);

        $this->assertEquals('select * from "enrollments"', $result->toSql());
    }

    /** @test */
    public function it_handles_unknown_filter_keys()
    {
        $query = Enrollment::query();
        $filters = [
            'student_id' => 123,
            'unknown_field' => 'value',
            'another_unknown' => 456,
        ];

        $result = $this->filter->apply($query, $filters);

        // Should only apply the known filter
        $sql = $result->toSql();
        $this->assertStringContainsString('where "student_id" = ?', $sql);
        $this->assertStringNotContainsString('unknown_field', $sql);
        $this->assertStringNotContainsString('another_unknown', $sql);
    }
}
