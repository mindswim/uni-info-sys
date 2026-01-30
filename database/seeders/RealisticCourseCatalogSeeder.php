<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Database\Seeder;

class RealisticCourseCatalogSeeder extends Seeder
{
    /**
     * Create realistic university course catalog based on actual university patterns
     * Following UC Berkeley, MIT, Stanford numbering and prerequisite structures
     */
    public function run(): void
    {
        $this->createComputerScienceCourses();
        $this->createMathematicsCourses();
        $this->createPhysicsCourses();
        $this->createBusinessCourses();
        $this->createEnglishCourses();
        $this->createEngineeringCourses();

        $this->command->info('Created comprehensive realistic course catalog');
    }

    private function createComputerScienceCourses(): void
    {
        $csDept = Department::where('code', 'CS')->first();
        if (! $csDept) {
            return;
        }

        $courses = [
            // Lower Division (1-99) - Introductory
            ['CS 61A', 'Structure and Interpretation of Computer Programs', 4, [],
                'Introduction to programming using Python. Covers abstraction, recursion, and functional programming.'],
            ['CS 61B', 'Data Structures', 4, [],
                'Fundamental dynamic data structures and algorithms for use in programs.'],
            ['CS 61C', 'Great Ideas in Computer Architecture', 4, [],
                'Introduction to C and assembly language programming, machine organization.'],
            ['CS 70', 'Discrete Mathematics and Probability Theory', 4, [],
                'Mathematical reasoning, logic, induction, probability, and graph theory.'],

            // Upper Division (100-199) - Advanced Undergraduate
            ['CS 162', 'Operating Systems and System Programming', 4, ['CS 61B', 'CS 61C'],
                'Design and implementation of operating systems and systems programs.'],
            ['CS 164', 'Programming Languages and Compilers', 4, ['CS 61B'],
                'Survey of programming languages, language design, and compiler implementation.'],
            ['CS 170', 'Efficient Algorithms and Intractable Problems', 4, ['CS 61B', 'CS 70'],
                'Concept and basic techniques in design and analysis of algorithms.'],
            ['CS 186', 'Introduction to Database Systems', 4, ['CS 61B'],
                'Access methods, relational model, query languages, query optimization.'],
            ['CS 188', 'Introduction to Artificial Intelligence', 4, ['CS 61B', 'CS 70'],
                'Ideas and techniques underlying design of intelligent computer systems.'],
            ['CS 189', 'Introduction to Machine Learning', 4, ['CS 61B', 'CS 70'],
                'Theoretical foundations, algorithms, methodologies, and applications for machine learning.'],

            // Advanced Upper Division
            ['CS 161', 'Computer Security', 4, ['CS 61B', 'CS 70'],
                'Introduction to computer security including cryptography, software security.'],
            ['CS 168', 'Introduction to the Internet: Architecture and Protocols', 4, ['CS 162'],
                'Internet architecture, protocols, and network programming.'],
            ['CS 169', 'Software Engineering', 4, ['CS 61B'],
                'Ideas and techniques for designing, developing, and modifying large software systems.'],
            ['CS 184', 'Foundations of Computer Graphics', 4, ['CS 61B'],
                'Techniques for generating synthetic images including 3D modeling and animation.'],
            ['CS 194', 'Special Topics', 1, ['CS 61B'],
                'Topics of current interest in computer science.'],

            // Graduate Level (200-299)
            ['CS 252', 'Graduate Computer Architecture', 4, ['CS 162'],
                'Advanced topics in computer architecture and parallel systems.'],
            ['CS 267', 'Applications of Parallel Computers', 4, ['CS 162'],
                'Parallel computing using scientific applications as case studies.'],
            ['CS 270', 'Combinatorial Algorithms and Data Structures', 4, ['CS 170'],
                'Advanced algorithmic techniques and data structure design.'],
            ['CS 288', 'Natural Language Processing', 4, ['CS 188'],
                'Computational models of human language and applications.'],

            // Advanced Graduate (300+)
            ['CS 294', 'Special Topics in Computer Science', 4, [],
                'Advanced research topics in computer science.'],
        ];

        $this->createCoursesForDepartment($csDept, $courses);
    }

    private function createMathematicsCourses(): void
    {
        $mathDept = Department::where('code', 'MATH')->first();
        if (! $mathDept) {
            return;
        }

        $courses = [
            // Lower Division - Foundation Math
            ['MATH 16A', 'Analytic Geometry and Calculus', 4, [],
                'Differential calculus and applications including maxima and minima problems.'],
            ['MATH 16B', 'Analytic Geometry and Calculus', 4, ['MATH 16A'],
                'Integral calculus, infinite series, and elementary differential equations.'],
            ['MATH 53', 'Multivariable Calculus', 4, ['MATH 16B'],
                'Parametric equations and vector functions, partial derivatives, multiple integrals.'],
            ['MATH 54', 'Linear Algebra and Differential Equations', 4, ['MATH 16B'],
                'Basic linear algebra, systems of linear differential equations.'],
            ['MATH 55', 'Discrete Mathematics', 4, ['MATH 16A'],
                'Logic, set theory, induction, relations, functions, and basic graph theory.'],

            // Upper Division - Advanced Mathematics
            ['MATH 104', 'Introduction to Analysis', 4, ['MATH 53', 'MATH 55'],
                'The real number system, sequences, limits, continuity, and differentiability.'],
            ['MATH 110', 'Linear Algebra', 4, ['MATH 54', 'MATH 55'],
                'Vector spaces, linear transformations, eigenvalues, and canonical forms.'],
            ['MATH 113', 'Introduction to Abstract Algebra', 4, ['MATH 54', 'MATH 55'],
                'Groups, rings, fields, and their homomorphisms and quotient structures.'],
            ['MATH 128A', 'Numerical Analysis', 4, ['MATH 53', 'MATH 54'],
                'Programming and elementary numerical analysis including error analysis.'],
            ['MATH 170', 'Mathematical Methods for Optimization', 4, ['MATH 53', 'MATH 54'],
                'Linear and nonlinear optimization, convex analysis, applications.'],

            // Statistics Track
            ['STAT 134', 'Concepts of Probability', 4, ['MATH 53'],
                'Probability spaces, random variables, expectation, limit theorems.'],
            ['STAT 135', 'Concepts of Statistics', 4, ['STAT 134'],
                'Statistical inference, hypothesis testing, confidence intervals.'],

            // Graduate Level
            ['MATH 202A', 'Topology and Analysis', 4, ['MATH 104'],
                'Topology of metric spaces, continuous functions, compactness.'],
            ['MATH 250A', 'Groups, Rings, and Fields', 4, ['MATH 113'],
                'Advanced abstract algebra including Galois theory.'],
        ];

        $this->createCoursesForDepartment($mathDept, $courses);
    }

    private function createPhysicsCourses(): void
    {
        $physicsDept = Department::where('code', 'PHYS')->first();
        if (! $physicsDept) {
            return;
        }

        $courses = [
            // Lower Division Physics
            ['PHYS 7A', 'Physics for Scientists and Engineers', 4, ['MATH 16A'],
                'Mechanics and wave motion including oscillations and thermodynamics.'],
            ['PHYS 7B', 'Physics for Scientists and Engineers', 4, ['PHYS 7A', 'MATH 16B'],
                'Electricity, magnetism, electromagnetic waves, and optics.'],
            ['PHYS 7C', 'Physics for Scientists and Engineers', 4, ['PHYS 7B'],
                'Special relativity, quantum mechanics, atomic and nuclear physics.'],

            // Upper Division Physics
            ['PHYS 105', 'Analytic Mechanics', 4, ['PHYS 7A', 'MATH 53'],
                'Lagrangian and Hamiltonian mechanics, oscillations, and wave motion.'],
            ['PHYS 110A', 'Electromagnetism and Optics', 4, ['PHYS 7B', 'MATH 53'],
                'Electromagnetic fields, Maxwell equations, and electromagnetic waves.'],
            ['PHYS 137A', 'Quantum Mechanics', 4, ['PHYS 7C', 'MATH 54'],
                'Foundations of quantum mechanics including Schrödinger equation.'],
            ['PHYS 112', 'Statistical and Thermal Physics', 4, ['PHYS 7C', 'MATH 53'],
                'Kinetic theory, statistical mechanics, and thermodynamics.'],

            // Laboratory Courses
            ['PHYS 111A', 'Advanced Experimental Physics', 4, ['PHYS 7C'],
                'Advanced laboratory course in experimental techniques and data analysis.'],
        ];

        $this->createCoursesForDepartment($physicsDept, $courses);
    }

    private function createBusinessCourses(): void
    {
        $busDept = Department::where('code', 'BUS')->first();
        if (! $busDept) {
            return;
        }

        $courses = [
            // Lower Division Business Foundation
            ['BUS 10', 'Introduction to Business', 3, [],
                'Overview of business functions, entrepreneurship, and business environment.'],
            ['ECON 1', 'Introduction to Economics', 4, [],
                'Basic principles of microeconomic and macroeconomic theory.'],
            ['ECON 2', 'Introduction to Statistics: Business and Economics', 4, ['MATH 16A'],
                'Statistical methods for business and economic applications.'],

            // Core Business Courses
            ['BUS 103', 'Financial Accounting', 3, [],
                'Preparation and interpretation of financial statements.'],
            ['BUS 104', 'Managerial Accounting', 3, ['BUS 103'],
                'Cost accounting, budgeting, and performance measurement systems.'],
            ['BUS 105', 'Finance', 3, ['BUS 103', 'ECON 2'],
                'Financial theory and corporate financial decision making.'],
            ['BUS 106', 'Marketing', 3, [],
                'Marketing concepts, strategy, consumer behavior, and market research.'],
            ['BUS 107', 'Operations Management', 3, ['ECON 2'],
                'Production systems, quality management, and supply chain management.'],
            ['BUS 108', 'Organizational Behavior', 3, [],
                'Individual and group behavior in organizations, leadership, and motivation.'],

            // Advanced Business Courses
            ['BUS 151', 'Strategic Management', 3, ['BUS 105', 'BUS 106', 'BUS 107'],
                'Strategic planning, competitive analysis, and corporate strategy.'],
            ['BUS 152', 'Business Analytics', 3, ['ECON 2'],
                'Data analysis and decision making tools for business applications.'],
            ['BUS 153', 'International Business', 3, ['BUS 106'],
                'Global business environment, international trade, and multinational corporations.'],
            ['BUS 160', 'Entrepreneurship', 3, ['BUS 10'],
                'New venture creation, business plan development, and startup management.'],

            // Specialized Tracks
            ['BUS 131', 'Investment Analysis', 3, ['BUS 105'],
                'Security analysis, portfolio theory, and investment strategies.'],
            ['BUS 134', 'Corporate Finance', 3, ['BUS 105'],
                'Capital structure, dividend policy, and financial planning.'],
            ['BUS 142', 'Digital Marketing', 3, ['BUS 106'],
                'Online marketing strategies, social media, and digital analytics.'],
        ];

        $this->createCoursesForDepartment($busDept, $courses);
    }

    private function createEnglishCourses(): void
    {
        $englishDept = Department::where('code', 'ENG')->first();
        if (! $englishDept) {
            return;
        }

        $courses = [
            // Writing and Composition
            ['ENG 1A', 'Reading and Composition', 4, [],
                'Critical reading and academic writing with emphasis on argument and analysis.'],
            ['ENG 1B', 'Reading and Composition', 4, ['ENG 1A'],
                'Advanced composition and critical analysis of literary texts.'],
            ['ENG 24', 'Freshman Seminars', 1, [],
                'Small group seminars on topics of current interest in English studies.'],

            // Literature Survey Courses
            ['ENG 45A', 'British Literature to 1800', 4, ['ENG 1A'],
                'Survey of British literature from medieval period through neoclassicism.'],
            ['ENG 45B', 'British Literature: 1800-Present', 4, ['ENG 1A'],
                'British literature from Romanticism to contemporary period.'],
            ['ENG 46A', 'American Literature to 1900', 4, ['ENG 1A'],
                'American literature from colonial period through 19th century.'],
            ['ENG 46B', 'American Literature: 1900-Present', 4, ['ENG 1A'],
                'Modern and contemporary American literature.'],

            // Upper Division Literature
            ['ENG 124', 'Shakespeare', 4, ['ENG 45A'],
                'Study of Shakespeare major plays and sonnets.'],
            ['ENG 131', 'Chaucer', 4, ['ENG 45A'],
                'Middle English language and literature with focus on Canterbury Tales.'],
            ['ENG 140', 'Modern Poetry', 4, ['ENG 1B'],
                '20th century poetry in English from various cultural traditions.'],
            ['ENG 156', 'African American Literature', 4, ['ENG 1B'],
                'African American literary tradition from slavery to present.'],

            // Creative Writing
            ['ENG 90', 'Introduction to Creative Writing', 4, ['ENG 1A'],
                'Workshop in fiction, poetry, and creative nonfiction.'],
            ['ENG 190', 'Advanced Creative Writing', 4, ['ENG 90'],
                'Advanced workshop with focus on developing individual voice and style.'],

            // Linguistics and Language
            ['ENG 100', 'Introduction to Linguistics', 4, [],
                'Systematic study of human language including phonetics and syntax.'],
        ];

        $this->createCoursesForDepartment($englishDept, $courses);
    }

    private function createEngineeringCourses(): void
    {
        $eeDept = Department::where('code', 'EE')->first();
        $meDept = Department::where('code', 'ME')->first();

        if ($eeDept) {
            $eeCourses = [
                // Lower Division EE
                ['EE 16A', 'Designing Information Devices and Systems I', 4, ['MATH 16A'],
                    'Linear algebra, circuits, and system analysis fundamentals.'],
                ['EE 16B', 'Designing Information Devices and Systems II', 4, ['EE 16A', 'MATH 16B'],
                    'Differential equations, feedback, and eigenanalysis in engineering systems.'],
                ['EE 40', 'Introduction to Microelectronic Circuits', 3, ['PHYS 7B'],
                    'Electronic circuit analysis using Kirchhoff laws and network analysis.'],

                // Upper Division EE
                ['EE 105', 'Microelectronic Devices and Circuits', 4, ['EE 40', 'EE 16B'],
                    'Physical operation of semiconductor devices and basic amplifier circuits.'],
                ['EE 120', 'Signals and Systems', 4, ['EE 16B'],
                    'Continuous and discrete-time signals, Fourier analysis, filtering.'],
                ['EE 122', 'Introduction to Communication Networks', 4, ['EE 120'],
                    'Network protocols, performance analysis, and network design.'],
                ['EE 130', 'Integrated Circuit Devices', 4, ['EE 105'],
                    'Physical operation and modeling of devices in integrated circuits.'],
                ['EE 140', 'Linear Integrated Circuits', 4, ['EE 105'],
                    'Analysis and design of analog integrated circuits and systems.'],
                ['EE 142', 'Integrated Circuits for Communications', 4, ['EE 105', 'EE 120'],
                    'RF and microwave integrated circuit design for wireless communications.'],

                // Digital Systems
                ['EE 141', 'Introduction to Digital Integrated Circuits', 4, ['EE 105'],
                    'MOS digital integrated circuits, logic design, and memory systems.'],
                ['EE 192', 'Capstone Design Project', 4, ['EE 105'],
                    'Team-based engineering design project with industry applications.'],
            ];
            $this->createCoursesForDepartment($eeDept, $eeCourses);
        }

        if ($meDept) {
            $meCourses = [
                // Lower Division ME
                ['ME 40', 'Thermodynamics', 4, ['PHYS 7A', 'MATH 53'],
                    'Fundamental principles of thermodynamics and their engineering applications.'],
                ['ME 104', 'Mechanical Engineering Design', 4, ['ME 40'],
                    'Design methodology, materials selection, and mechanical component design.'],

                // Upper Division ME
                ['ME 106', 'Fluid Mechanics', 4, ['ME 40', 'MATH 54'],
                    'Fundamental principles of fluid statics and dynamics.'],
                ['ME 108', 'Heat Transfer', 4, ['ME 40', 'ME 106'],
                    'Conduction, convection, and radiation heat transfer.'],
                ['ME 110', 'Introduction to Product Development', 4, ['ME 104'],
                    'Product design process from concept to manufacturing.'],
                ['ME 132', 'Dynamic Systems and Feedback', 4, ['ME 104', 'MATH 54'],
                    'Dynamic behavior of mechanical systems and control system fundamentals.'],
                ['ME 180', 'Introduction to Computer-Aided Design', 3, [],
                    'Computer methods for mechanical design and engineering analysis.'],
            ];
            $this->createCoursesForDepartment($meDept, $meCourses);
        }
    }

    private function createCoursesForDepartment(Department $department, array $courses): void
    {
        foreach ($courses as [$code, $title, $credits, $prereqCodes, $description]) {
            // Extract course number for automatic level classification
            preg_match('/(\w+)\s+(\d+[A-Z]*)/', $code, $matches);
            $courseNumber = $matches[2] ?? '';

            // Convert prerequisite codes to course IDs
            $prerequisites = [];
            foreach ($prereqCodes as $prereqCode) {
                $prereqCourse = Course::where('course_code', $prereqCode)->first();
                if ($prereqCourse) {
                    $prerequisites[] = $prereqCourse->id;
                }
            }

            Course::create([
                'course_code' => $code,
                'course_number' => $courseNumber,
                'title' => $title,
                'description' => $description,
                'credits' => $credits,
                'prerequisites' => empty($prerequisites) ? null : $prerequisites,
                'department_id' => $department->id,
                // Level will be auto-set by the Course model's boot method
            ]);
        }
    }
}
