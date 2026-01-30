<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class RealisticFacultySeeder extends Seeder
{
    /**
     * Create realistic faculty profiles with academic specializations
     * Based on real university faculty structures and common academic titles
     */
    public function run(): void
    {
        $faker = Faker::create();

        $facultyRole = Role::where('name', 'faculty')->first();
        if (! $facultyRole) {
            $facultyRole = Role::create(['name' => 'faculty', 'description' => 'Faculty members']);
        }

        $this->createComputerScienceFaculty($faker, $facultyRole);
        $this->createMathematicsFaculty($faker, $facultyRole);
        $this->createPhysicsFaculty($faker, $facultyRole);
        $this->createBusinessFaculty($faker, $facultyRole);
        $this->createEnglishFaculty($faker, $facultyRole);
        $this->createEngineeringFaculty($faker, $facultyRole);

        $this->command->info('Created realistic faculty profiles with specializations');
    }

    private function createComputerScienceFaculty($faker, $facultyRole): void
    {
        $csDept = Department::where('code', 'CS')->first();
        if (! $csDept) {
            return;
        }

        $facultyData = [
            // Senior Faculty (Full Professors)
            [
                'name' => 'Dr. Alan Turing',
                'title' => 'Professor',
                'specialization' => 'Artificial Intelligence, Machine Learning, Theoretical Computer Science',
                'education' => 'Ph.D. Computer Science, MIT',
                'office_hours' => 'Tuesday, Thursday 2:00-4:00 PM',
            ],
            [
                'name' => 'Dr. Barbara Liskov',
                'title' => 'Institute Professor',
                'specialization' => 'Programming Languages, Distributed Systems, Software Engineering',
                'education' => 'Ph.D. Computer Science, Stanford University',
                'office_hours' => 'Wednesday, Friday 10:00-12:00 PM',
            ],
            [
                'name' => 'Dr. Tim Berners-Lee',
                'title' => 'Professor',
                'specialization' => 'Computer Networks, Web Technologies, Information Systems',
                'education' => 'Ph.D. Computer Science, Oxford University',
                'office_hours' => 'Monday, Wednesday 1:00-3:00 PM',
            ],

            // Associate Professors
            [
                'name' => 'Dr. Grace Hopper',
                'title' => 'Associate Professor',
                'specialization' => 'Compilers, Programming Languages, Computer Architecture',
                'education' => 'Ph.D. Computer Science, Yale University',
                'office_hours' => 'Tuesday, Thursday 11:00 AM-1:00 PM',
            ],
            [
                'name' => 'Dr. Yann LeCun',
                'title' => 'Associate Professor',
                'specialization' => 'Deep Learning, Computer Vision, Neural Networks',
                'education' => 'Ph.D. Computer Science, Université Paris VI',
                'office_hours' => 'Monday, Friday 9:00-11:00 AM',
            ],
            [
                'name' => 'Dr. Shafi Goldwasser',
                'title' => 'Associate Professor',
                'specialization' => 'Cryptography, Computational Complexity, Security',
                'education' => 'Ph.D. Computer Science, UC Berkeley',
                'office_hours' => 'Wednesday, Thursday 3:00-5:00 PM',
            ],

            // Assistant Professors
            [
                'name' => 'Dr. Fei-Fei Li',
                'title' => 'Assistant Professor',
                'specialization' => 'Computer Vision, Machine Learning, AI Ethics',
                'education' => 'Ph.D. Computer Science, Caltech',
                'office_hours' => 'Tuesday, Friday 2:00-4:00 PM',
            ],
            [
                'name' => 'Dr. Andrew Ng',
                'title' => 'Assistant Professor',
                'specialization' => 'Machine Learning, Online Education, Robotics',
                'education' => 'Ph.D. Computer Science, UC Berkeley',
                'office_hours' => 'Monday, Thursday 10:00 AM-12:00 PM',
            ],

            // Lecturers
            [
                'name' => 'Dr. John Carmack',
                'title' => 'Senior Lecturer',
                'specialization' => 'Computer Graphics, Game Development, Real-time Systems',
                'education' => 'M.S. Computer Science, University of Missouri',
                'office_hours' => 'Wednesday, Friday 1:00-3:00 PM',
            ],
        ];

        $this->createFacultyForDepartment($csDept, $facultyData, $faker, $facultyRole);
    }

    private function createMathematicsFaculty($faker, $facultyRole): void
    {
        $mathDept = Department::where('code', 'MATH')->first();
        if (! $mathDept) {
            return;
        }

        $facultyData = [
            [
                'name' => 'Dr. Emmy Noether',
                'title' => 'Distinguished Professor',
                'specialization' => 'Abstract Algebra, Ring Theory, Field Theory',
                'education' => 'Ph.D. Mathematics, University of Göttingen',
                'office_hours' => 'Monday, Wednesday 11:00 AM-1:00 PM',
            ],
            [
                'name' => 'Dr. Terence Tao',
                'title' => 'Professor',
                'specialization' => 'Harmonic Analysis, Partial Differential Equations, Number Theory',
                'education' => 'Ph.D. Mathematics, Princeton University',
                'office_hours' => 'Tuesday, Thursday 2:00-4:00 PM',
            ],
            [
                'name' => 'Dr. Karen Uhlenbeck',
                'title' => 'Professor',
                'specialization' => 'Geometric Analysis, Gauge Theory, Integrable Systems',
                'education' => 'Ph.D. Mathematics, Brandeis University',
                'office_hours' => 'Wednesday, Friday 10:00 AM-12:00 PM',
            ],
            [
                'name' => 'Dr. Andrew Wiles',
                'title' => 'Professor',
                'specialization' => 'Number Theory, Algebraic Geometry, Modular Forms',
                'education' => 'Ph.D. Mathematics, Cambridge University',
                'office_hours' => 'Monday, Friday 1:00-3:00 PM',
            ],
            [
                'name' => 'Dr. Maryam Mirzakhani',
                'title' => 'Associate Professor',
                'specialization' => 'Hyperbolic Geometry, Riemann Surfaces, Dynamical Systems',
                'education' => 'Ph.D. Mathematics, Harvard University',
                'office_hours' => 'Tuesday, Thursday 9:00-11:00 AM',
            ],
            [
                'name' => 'Dr. Peter Sarnak',
                'title' => 'Associate Professor',
                'specialization' => 'Analytic Number Theory, Automorphic Forms, Spectral Theory',
                'education' => 'Ph.D. Mathematics, Stanford University',
                'office_hours' => 'Wednesday, Thursday 3:00-5:00 PM',
            ],
        ];

        $this->createFacultyForDepartment($mathDept, $facultyData, $faker, $facultyRole);
    }

    private function createPhysicsFaculty($faker, $facultyRole): void
    {
        $physicsDept = Department::where('code', 'PHYS')->first();
        if (! $physicsDept) {
            return;
        }

        $facultyData = [
            [
                'name' => 'Dr. Marie Curie',
                'title' => 'Distinguished Professor',
                'specialization' => 'Nuclear Physics, Radioactivity, Materials Science',
                'education' => 'Ph.D. Physics, University of Paris',
                'office_hours' => 'Monday, Wednesday 2:00-4:00 PM',
            ],
            [
                'name' => 'Dr. Richard Feynman',
                'title' => 'Professor',
                'specialization' => 'Quantum Mechanics, Particle Physics, Quantum Electrodynamics',
                'education' => 'Ph.D. Physics, Princeton University',
                'office_hours' => 'Tuesday, Thursday 10:00 AM-12:00 PM',
            ],
            [
                'name' => 'Dr. Donna Strickland',
                'title' => 'Professor',
                'specialization' => 'Laser Physics, Nonlinear Optics, Ultrafast Optics',
                'education' => 'Ph.D. Physics, University of Rochester',
                'office_hours' => 'Wednesday, Friday 1:00-3:00 PM',
            ],
            [
                'name' => 'Dr. Michio Kaku',
                'title' => 'Associate Professor',
                'specialization' => 'Theoretical Physics, String Theory, Cosmology',
                'education' => 'Ph.D. Physics, UC Berkeley',
                'office_hours' => 'Monday, Thursday 11:00 AM-1:00 PM',
            ],
            [
                'name' => 'Dr. Lisa Randall',
                'title' => 'Associate Professor',
                'specialization' => 'Particle Physics, Cosmology, Extra Dimensions',
                'education' => 'Ph.D. Physics, Harvard University',
                'office_hours' => 'Tuesday, Friday 3:00-5:00 PM',
            ],
        ];

        $this->createFacultyForDepartment($physicsDept, $facultyData, $faker, $facultyRole);
    }

    private function createBusinessFaculty($faker, $facultyRole): void
    {
        $busDept = Department::where('code', 'BUS')->first();
        if (! $busDept) {
            return;
        }

        $facultyData = [
            [
                'name' => 'Dr. Michael Porter',
                'title' => 'University Professor',
                'specialization' => 'Strategic Management, Competitive Strategy, Economic Development',
                'education' => 'Ph.D. Business Economics, Harvard University',
                'office_hours' => 'Monday, Wednesday 10:00 AM-12:00 PM',
            ],
            [
                'name' => 'Dr. Clayton Christensen',
                'title' => 'Professor',
                'specialization' => 'Innovation, Disruptive Technology, Business Strategy',
                'education' => 'Ph.D. Business Administration, Harvard Business School',
                'office_hours' => 'Tuesday, Thursday 2:00-4:00 PM',
            ],
            [
                'name' => 'Dr. Sheryl Sandberg',
                'title' => 'Professor of Practice',
                'specialization' => 'Leadership, Technology Management, Operations',
                'education' => 'MBA, Harvard Business School',
                'office_hours' => 'Wednesday, Friday 1:00-3:00 PM',
            ],
            [
                'name' => 'Dr. Warren Buffett',
                'title' => 'Visiting Professor',
                'specialization' => 'Investment Strategy, Value Investing, Financial Analysis',
                'education' => 'M.S. Economics, Columbia Business School',
                'office_hours' => 'Thursday, Friday 9:00-11:00 AM',
            ],
            [
                'name' => 'Dr. Amy Edmondson',
                'title' => 'Associate Professor',
                'specialization' => 'Organizational Behavior, Leadership, Team Dynamics',
                'education' => 'Ph.D. Organizational Behavior, Harvard University',
                'office_hours' => 'Monday, Friday 3:00-5:00 PM',
            ],
        ];

        $this->createFacultyForDepartment($busDept, $facultyData, $faker, $facultyRole);
    }

    private function createEnglishFaculty($faker, $facultyRole): void
    {
        $englishDept = Department::where('code', 'ENG')->first();
        if (! $englishDept) {
            return;
        }

        $facultyData = [
            [
                'name' => 'Dr. Toni Morrison',
                'title' => 'University Professor',
                'specialization' => 'African American Literature, Creative Writing, Literary Criticism',
                'education' => 'M.A. English, Cornell University',
                'office_hours' => 'Tuesday, Thursday 11:00 AM-1:00 PM',
            ],
            [
                'name' => 'Dr. Harold Bloom',
                'title' => 'Sterling Professor',
                'specialization' => 'Literary Criticism, Romantic Poetry, Shakespeare Studies',
                'education' => 'Ph.D. English, Yale University',
                'office_hours' => 'Monday, Wednesday 2:00-4:00 PM',
            ],
            [
                'name' => 'Dr. Joyce Carol Oates',
                'title' => 'Professor',
                'specialization' => 'Contemporary American Literature, Creative Writing, Gothic Fiction',
                'education' => 'M.A. English, University of Wisconsin',
                'office_hours' => 'Wednesday, Friday 10:00 AM-12:00 PM',
            ],
            [
                'name' => 'Dr. Edward Said',
                'title' => 'University Professor',
                'specialization' => 'Postcolonial Theory, Comparative Literature, Cultural Criticism',
                'education' => 'Ph.D. English, Harvard University',
                'office_hours' => 'Monday, Thursday 1:00-3:00 PM',
            ],
        ];

        $this->createFacultyForDepartment($englishDept, $facultyData, $faker, $facultyRole);
    }

    private function createEngineeringFaculty($faker, $facultyRole): void
    {
        $eeDept = Department::where('code', 'EE')->first();
        $meDept = Department::where('code', 'ME')->first();

        if ($eeDept) {
            $eeFaculty = [
                [
                    'name' => 'Dr. Claude Shannon',
                    'title' => 'Institute Professor',
                    'specialization' => 'Information Theory, Digital Communications, Signal Processing',
                    'education' => 'Ph.D. Mathematics, MIT',
                    'office_hours' => 'Monday, Wednesday 9:00-11:00 AM',
                ],
                [
                    'name' => 'Dr. Robert Kahn',
                    'title' => 'Professor',
                    'specialization' => 'Computer Networks, Internet Protocols, Communication Systems',
                    'education' => 'Ph.D. Electrical Engineering, Princeton University',
                    'office_hours' => 'Tuesday, Thursday 2:00-4:00 PM',
                ],
                [
                    'name' => 'Dr. Lynn Conway',
                    'title' => 'Professor',
                    'specialization' => 'VLSI Design, Computer Architecture, Microelectronics',
                    'education' => 'Ph.D. Electrical Engineering, Columbia University',
                    'office_hours' => 'Wednesday, Friday 1:00-3:00 PM',
                ],
            ];
            $this->createFacultyForDepartment($eeDept, $eeFaculty, $faker, $facultyRole);
        }

        if ($meDept) {
            $meFaculty = [
                [
                    'name' => 'Dr. James Dyson',
                    'title' => 'Professor of Practice',
                    'specialization' => 'Product Design, Manufacturing, Innovation Management',
                    'education' => 'Ph.D. Mechanical Engineering, Royal College of Art',
                    'office_hours' => 'Monday, Thursday 10:00 AM-12:00 PM',
                ],
                [
                    'name' => 'Dr. Yoky Matsuoka',
                    'title' => 'Associate Professor',
                    'specialization' => 'Robotics, Human-Machine Interface, Bioengineering',
                    'education' => 'Ph.D. Electrical and Computer Engineering, UC Berkeley',
                    'office_hours' => 'Tuesday, Friday 11:00 AM-1:00 PM',
                ],
            ];
            $this->createFacultyForDepartment($meDept, $meFaculty, $faker, $facultyRole);
        }
    }

    private function createFacultyForDepartment(Department $department, array $facultyData, $faker, $facultyRole): void
    {
        foreach ($facultyData as $faculty) {
            // Create user account
            $user = User::create([
                'name' => $faculty['name'],
                'email' => $this->generateEmail($faculty['name']),
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);

            // Assign faculty role
            $user->roles()->attach($facultyRole);

            // Create staff profile with academic information
            Staff::create([
                'user_id' => $user->id,
                'department_id' => $department->id,
                'job_title' => $faculty['title'],
                'office_location' => $this->generateOfficeLocation($department->code),
                'phone' => $faker->phoneNumber,
                'specialization' => $faculty['specialization'],
                'education' => $faculty['education'],
                'office_hours' => $faculty['office_hours'],
                'bio' => $this->generateFacultyBio($faculty['name'], $faculty['specialization']),
            ]);
        }
    }

    private function generateEmail(string $name): string
    {
        $cleanName = strtolower(str_replace(['Dr. ', ' '], ['', '.'], $name));

        return $cleanName.'@university.edu';
    }

    private function generateOfficeLocation(string $deptCode): string
    {
        $buildings = [
            'CS' => 'Computer Science Building',
            'MATH' => 'Mathematics Building',
            'PHYS' => 'Physics Building',
            'BUS' => 'Business School',
            'ENG' => 'Humanities Hall',
            'EE' => 'Engineering Building',
            'ME' => 'Mechanical Engineering Building',
        ];

        $building = $buildings[$deptCode] ?? 'Academic Building';
        $room = rand(100, 599);

        return "{$building}, Room {$room}";
    }

    private function generateFacultyBio(string $name, string $specialization): string
    {
        $firstName = explode(' ', str_replace('Dr. ', '', $name))[0];

        return "{$firstName} is a renowned researcher in {$specialization}. With extensive experience in both academia and industry, {$firstName} brings cutting-edge knowledge and practical insights to the classroom. Their research has been published in top-tier journals and conferences, contributing significantly to the advancement of the field.";
    }
}
