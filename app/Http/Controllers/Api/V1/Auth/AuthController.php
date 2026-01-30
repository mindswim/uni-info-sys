<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Authentication',
    description: 'Authentication endpoints for obtaining API tokens.'
)]
class AuthController extends Controller
{
    /**
     * Register a new student account
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'email_verified_at' => now(),
            ]);

            // Parse name into first/last
            $nameParts = explode(' ', $request->name, 2);

            Student::create([
                'user_id' => $user->id,
                'student_number' => 'STU' . random_int(100000, 999999),
                'first_name' => $nameParts[0],
                'last_name' => $nameParts[1] ?? '',
                'date_of_birth' => '2000-01-01',
                'gender' => 'prefer not to say',
                'nationality' => 'Unknown',
                'address' => '',
                'city' => '',
                'state' => '',
                'postal_code' => '',
                'country' => '',
                'phone' => '',
                'emergency_contact_name' => '',
                'emergency_contact_phone' => '',
                'enrollment_status' => 'prospective',
            ]);

            $studentRole = Role::where('name', 'student')->first();
            if ($studentRole) {
                $user->roles()->attach($studentRole);
            }

            $user->load(['student', 'staff', 'roles.permissions']);

            $token = $user->createToken('web')->plainTextToken;

            $roles = $user->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $roles,
                    'student_id' => $user->student?->id,
                    'staff_id' => null,
                ],
            ], 201);
        });
    }

    #[OA\Post(
        path: '/api/v1/tokens/create',
        summary: 'Login and obtain API token',
        description: 'Authenticate with email and password to receive an API token for subsequent requests.',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password', 'device_name'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@university.edu'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123'),
                    new OA\Property(property: 'device_name', type: 'string', example: 'Mobile App'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful, token returned.',
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: 'token', type: 'string', example: '1|abc123def456...')]
                )
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid credentials or validation error.',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'errors', type: 'object'),
                    ]
                )
            ),
        ]
    )]
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are not correct.'],
            ]);
        }

        // Load user relationships
        $user->load(['student', 'staff', 'roles.permissions']);

        $token = $user->createToken($request->device_name)->plainTextToken;

        // Build roles array with full permission details
        $roles = $user->roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $roles,
                'student_id' => $user->student?->id,
                'staff_id' => $user->staff?->id,
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/v1/auth/logout',
        summary: 'Logout and revoke current token',
        description: 'Revoke the current authentication token.',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successfully logged out.',
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: 'message', type: 'string')]
                )
            ),
        ]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }

    #[OA\Get(
        path: '/api/v1/auth/user',
        summary: 'Get current user information',
        description: "Get the authenticated user's profile information.",
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User information retrieved.',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'id', type: 'integer'),
                        new OA\Property(property: 'name', type: 'string'),
                        new OA\Property(property: 'email', type: 'string'),
                        new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string')),
                        new OA\Property(property: 'student_id', type: 'integer', nullable: true),
                        new OA\Property(property: 'staff_id', type: 'integer', nullable: true),
                    ]
                )
            ),
        ]
    )]
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['student', 'staff', 'roles.permissions']);

        // Build roles array with full permission details
        $roles = $user->roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $roles,
            'student_id' => $user->student?->id,
            'staff_id' => $user->staff?->id,
        ]);
    }
}
