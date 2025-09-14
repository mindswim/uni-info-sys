<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Authentication",
    description: "Authentication endpoints for obtaining API tokens."
)]
class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/v1/tokens/create",
        summary: "Login and obtain API token",
        description: "Authenticate with email and password to receive an API token for subsequent requests.",
        tags: ["Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password", "device_name"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@university.edu"),
                    new OA\Property(property: "password", type: "string", format: "password", example: "password123"),
                    new OA\Property(property: "device_name", type: "string", example: "Mobile App"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Login successful, token returned.",
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: "token", type: "string", example: "1|abc123def456...")]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Invalid credentials or validation error.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "errors", type: "object"),
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

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'student_id' => $user->student?->id,
                'staff_id' => $user->staff?->id,
            ]
        ]);
    }

    #[OA\Post(
        path: "/api/v1/auth/logout",
        summary: "Logout and revoke current token",
        description: "Revoke the current authentication token.",
        tags: ["Authentication"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successfully logged out.",
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: "message", type: "string")]
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
        path: "/api/v1/auth/user",
        summary: "Get current user information",
        description: "Get the authenticated user's profile information.",
        tags: ["Authentication"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "User information retrieved.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "name", type: "string"),
                        new OA\Property(property: "email", type: "string"),
                        new OA\Property(property: "roles", type: "array"),
                        new OA\Property(property: "student_id", type: "integer"),
                        new OA\Property(property: "staff_id", type: "integer"),
                    ]
                )
            ),
        ]
    )]
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['student', 'staff', 'roles.permissions']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name'),
            'student_id' => $user->student?->id,
            'staff_id' => $user->staff?->id,
        ]);
    }
}
