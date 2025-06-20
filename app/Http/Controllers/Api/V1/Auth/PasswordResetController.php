<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class PasswordResetController extends Controller
{
    #[OA\Post(
        path: "/api/v1/forgot-password",
        summary: "Send password reset link",
        description: "Send a password reset link to the user's email address. This initiates the password reset flow by generating a secure token and sending it via email.",
        tags: ["Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", description: "The email address of the user requesting password reset", example: "student@example.com")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Password reset link sent successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", description: "Success message", example: "Password reset link sent to your email address.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Validation error",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", description: "Error message", example: "The given data was invalid."),
                        new OA\Property(
                            property: "errors",
                            type: "object",
                            properties: [
                                new OA\Property(property: "email", type: "array", items: new OA\Items(type: "string"), description: "Email validation errors")
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "User not found or other error",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", description: "Error message", example: "We can't find a user with that email address.")
                    ]
                )
            )
        ]
    )]
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email address.'
            ]);
        }

        return response()->json([
            'message' => $this->getPasswordResetMessage($status)
        ], 400);
    }

    #[OA\Post(
        path: "/api/v1/reset-password",
        summary: "Reset password using token",
        description: "Reset the user's password using the token received via email. This completes the password reset flow by validating the token and updating the user's password.",
        tags: ["Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["token", "email", "password", "password_confirmation"],
                properties: [
                    new OA\Property(property: "token", type: "string", description: "The password reset token received via email", example: "abc123def456..."),
                    new OA\Property(property: "email", type: "string", format: "email", description: "The email address of the user", example: "student@example.com"),
                    new OA\Property(property: "password", type: "string", format: "password", description: "The new password (minimum 8 characters)", example: "newpassword123"),
                    new OA\Property(property: "password_confirmation", type: "string", format: "password", description: "Password confirmation (must match password)", example: "newpassword123")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Password reset successful",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", description: "Success message", example: "Your password has been reset successfully.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Validation error",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", description: "Error message", example: "The given data was invalid."),
                        new OA\Property(
                            property: "errors",
                            type: "object",
                            properties: [
                                new OA\Property(property: "email", type: "array", items: new OA\Items(type: "string"), description: "Email validation errors"),
                                new OA\Property(property: "password", type: "array", items: new OA\Items(type: "string"), description: "Password validation errors"),
                                new OA\Property(property: "token", type: "array", items: new OA\Items(type: "string"), description: "Token validation errors")
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Reset failed (invalid token, expired, etc.)",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", description: "Error message", example: "This password reset token is invalid or has expired.")
                    ]
                )
            )
        ]
    )]
    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Your password has been reset successfully.'
            ]);
        }

        return response()->json([
            'message' => $this->getPasswordResetMessage($status)
        ], 400);
    }

    /**
     * Get user-friendly message for password reset status
     */
    private function getPasswordResetMessage(string $status): string
    {
        return match($status) {
            Password::RESET_LINK_SENT => 'Password reset link sent to your email address.',
            Password::PASSWORD_RESET => 'Your password has been reset successfully.',
            Password::INVALID_USER => "We can't find a user with that email address.",
            Password::INVALID_TOKEN => 'This password reset token is invalid or has expired.',
            Password::RESET_THROTTLED => 'Please wait before retrying.',
            default => 'An error occurred while processing your request.'
        };
    }
}
