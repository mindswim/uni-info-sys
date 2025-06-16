<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @group Authentication
 * @description APIs for authenticating and receiving an API token.
 */
class AuthController extends Controller
{
    /**
     * Create API Token
     * 
     * Authenticates a user and returns a plain-text Sanctum API token.
     * @bodyParam email string required The user's email address. Example: user@example.com
     * @bodyParam password string required The user's password. Example: password
     * @bodyParam device_name string required A name for the device or token, for your reference. Example: my-laptop
     * 
     * @response {
     *  "token": "1|aBcDeFgHiJkLmNoPqRsTuVwXyZ"
     * }
     * @unauthenticated
     */
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
