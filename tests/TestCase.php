<?php

namespace Tests;

use App\Testing\TermPool;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=ON');
        }

        // Reset TermPool for deterministic testing
        // This ensures each test class starts with a fresh pool state
        TermPool::reset();
    }
}
