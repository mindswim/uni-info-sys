<?php

namespace App\Testing;

use App\Models\Term;
use Illuminate\Support\Collection;

/**
 * Term Pool Manager for Deterministic Testing
 * 
 * Provides a pool of unique, deterministic terms for testing to prevent
 * unique constraint violations while maintaining test isolation.
 */
class TermPool
{
    private static ?Collection $terms = null;
    private static int $counter = 0;

    /**
     * Get or create a term from the pool
     * 
     * Cycles through available terms to ensure uniqueness while
     * providing deterministic behavior for tests.
     */
    public static function getOrCreate(): Term
    {
        if (self::$terms === null) {
            self::initializePool();
        }

        // Cycle through available terms
        $term = self::$terms->get(self::$counter % self::$terms->count());
        self::$counter++;

        return $term;
    }

    /**
     * Reset the pool state (called between test classes)
     */
    public static function reset(): void
    {
        self::$terms = null;
        self::$counter = 0;
    }

    /**
     * Initialize the term pool with unique, deterministic terms
     */
    private static function initializePool(): void
    {
        self::$terms = collect();
        
        $semesters = ['Fall', 'Spring', 'Summer'];
        $startYear = 2025; // Start from 2025 to avoid conflicts with existing data
        
        // Create 30 unique terms (10 years * 3 semesters) - more than enough for any test suite
        // Keeping year range reasonable to avoid MySQL datetime limits (2038 problem)
        for ($i = 0; $i < 30; $i++) {
            $year = $startYear + intval($i / 3);
            $semester = $semesters[$i % 3];
            
            // Use firstOrCreate to handle race conditions gracefully
            $term = Term::firstOrCreate(
                [
                    'academic_year' => $year,
                    'semester' => $semester
                ],
                [
                    'name' => "{$semester} {$year}",
                    'start_date' => self::getStartDate($year, $semester),
                    'end_date' => self::getEndDate($year, $semester),
                    'add_drop_deadline' => self::getDeadline($year, $semester),
                ]
            );
            
            self::$terms->push($term);
        }
    }

    /**
     * Get semester start date
     */
    private static function getStartDate(int $year, string $semester): string
    {
        return match($semester) {
            'Spring' => "{$year}-01-15",
            'Summer' => "{$year}-06-01", 
            'Fall' => "{$year}-09-01",
            default => "{$year}-01-15",
        };
    }

    /**
     * Get semester end date
     */
    private static function getEndDate(int $year, string $semester): string
    {
        return match($semester) {
            'Spring' => "{$year}-05-10",
            'Summer' => "{$year}-08-15",
            'Fall' => "{$year}-12-20",
            default => "{$year}-05-10",
        };
    }

    /**
     * Get add/drop deadline
     */
    private static function getDeadline(int $year, string $semester): string
    {
        return match($semester) {
            'Spring' => "{$year}-01-29",
            'Summer' => "{$year}-06-15",
            'Fall' => "{$year}-09-15",
            default => "{$year}-01-29",
        };
    }

    /**
     * Get current pool size (for debugging)
     */
    public static function getPoolSize(): int
    {
        return self::$terms?->count() ?? 0;
    }

    /**
     * Get current counter position (for debugging)
     */
    public static function getCurrentPosition(): int
    {
        return self::$counter;
    }
} 