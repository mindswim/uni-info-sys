<?php

namespace App\Http\Controllers\Api\V1;

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

        return response()->json(['token' => $user->createToken($request->device_name)->plainTextToken]);
    }
}
