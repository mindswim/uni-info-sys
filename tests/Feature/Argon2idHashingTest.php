<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class Argon2idHashingTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_use_argon2id_hashing()
    {
        // Create new user and verify password hash format
        $user = User::factory()->create(['password' => 'test-password']);

        $this->assertStringStartsWith('$argon2id$', $user->password);
        $this->assertEquals('argon2id', $user->password_algorithm);
    }

    public function test_existing_bcrypt_users_can_still_login()
    {
        // Create a user with bcrypt hash manually (bypassing mutator)
        $bcryptHash = bcrypt('test-password');

        DB::table('users')->insert([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => $bcryptHash,
            'password_algorithm' => 'bcrypt',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = User::where('email', 'test@example.com')->first();

        // Verify the hash is bcrypt format
        $this->assertStringStartsWith('$2y$', $user->password);
        $this->assertEquals('bcrypt', $user->password_algorithm);

        // Test that authentication still works with bcrypt
        $this->assertTrue(Hash::check('test-password', $user->password));
    }

    public function test_password_rehashing_on_password_change()
    {
        // Create a user with bcrypt hash manually (bypassing mutator)
        $bcryptHash = bcrypt('old-password');

        DB::table('users')->insert([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => $bcryptHash,
            'password_algorithm' => 'bcrypt',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = User::where('email', 'test@example.com')->first();

        $this->assertStringStartsWith('$2y$', $user->password);
        $this->assertEquals('bcrypt', $user->password_algorithm);

        // Change password (should now use argon2id via mutator)
        $user->password = 'new-password';
        $user->save();

        // Verify it now uses argon2id
        $this->assertStringStartsWith('$argon2id$', $user->password);
        $this->assertEquals('argon2id', $user->password_algorithm);
    }

    public function test_argon2id_parameters_are_secure()
    {
        $config = config('hashing.argon2id');

        // Verify memory parameter is secure (at least 64MB)
        $this->assertGreaterThanOrEqual(65536, $config['memory']);

        // Verify time parameter is secure (at least 3 iterations)
        $this->assertGreaterThanOrEqual(3, $config['time']);

        // Verify threads parameter is set
        $this->assertGreaterThanOrEqual(1, $config['threads']);
    }

    public function test_hash_verification_works()
    {
        $password = 'test-password-123';
        $hash = Hash::make($password);

        // Verify the hash was created with argon2id
        $this->assertStringStartsWith('$argon2id$', $hash);

        // Verify Hash::check works
        $this->assertTrue(Hash::check($password, $hash));
        $this->assertFalse(Hash::check('wrong-password', $hash));
    }

    public function test_user_registration_uses_argon2id()
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // If registration endpoint doesn't exist, just test direct user creation
        if ($response->status() === 404) {
            $user = User::create([
                'name' => 'New User',
                'email' => 'newuser@example.com',
                'password' => 'password123',
            ]);

            $this->assertStringStartsWith('$argon2id$', $user->password);
            $this->assertEquals('argon2id', $user->password_algorithm);
        } else {
            $response->assertStatus(201);

            $user = User::where('email', 'newuser@example.com')->first();
            $this->assertNotNull($user);
            $this->assertStringStartsWith('$argon2id$', $user->password);
            $this->assertEquals('argon2id', $user->password_algorithm);
        }
    }

    public function test_configuration_validation()
    {
        // Test that config returns argon2id as default
        $this->assertEquals('argon2id', config('hashing.driver'));

        // Test that argon2id config exists
        $this->assertIsArray(config('hashing.argon2id'));
        $this->assertArrayHasKey('memory', config('hashing.argon2id'));
        $this->assertArrayHasKey('time', config('hashing.argon2id'));
        $this->assertArrayHasKey('threads', config('hashing.argon2id'));
    }

    public function test_performance_is_acceptable()
    {
        $password = 'test-password-for-performance';

        $startTime = microtime(true);
        $hash = Hash::make($password);
        $endTime = microtime(true);

        $duration = $endTime - $startTime;

        // Hashing should complete within 2 seconds (generous limit)
        $this->assertLessThan(2.0, $duration, 'Argon2id hashing took too long: '.$duration.' seconds');

        // Verify the hash was created correctly
        $this->assertStringStartsWith('$argon2id$', $hash);
        $this->assertTrue(Hash::check($password, $hash));
    }

    public function test_backward_compatibility_with_bcrypt()
    {
        // Test that we can still verify bcrypt hashes created with bcrypt function
        $password = 'test-password';
        $bcryptHash = bcrypt($password);

        $this->assertStringStartsWith('$2y$', $bcryptHash);
        $this->assertTrue(Hash::check($password, $bcryptHash));
        $this->assertFalse(Hash::check('wrong-password', $bcryptHash));
    }

    public function test_password_algorithm_tracking_in_database()
    {
        // Test that password_algorithm column exists and is tracked
        $user = User::factory()->create(['password' => 'test-password']);

        // Check database directly
        $userFromDb = User::find($user->id);
        $this->assertEquals('argon2id', $userFromDb->password_algorithm);

        // Verify column exists in database schema
        $this->assertTrue(\Schema::hasColumn('users', 'password_algorithm'));
    }

    public function test_mixed_algorithm_environment()
    {
        // Create user with bcrypt hash manually (bypassing mutator)
        $bcryptHash = bcrypt('password123');

        DB::table('users')->insert([
            'name' => 'Bcrypt User',
            'email' => 'bcrypt@example.com',
            'password' => $bcryptHash,
            'password_algorithm' => 'bcrypt',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $bcryptUser = User::where('email', 'bcrypt@example.com')->first();

        $argon2idUser = User::factory()->create([
            'email' => 'argon2id@example.com',
            'password' => 'password123',
        ]);

        // Both should be able to authenticate
        $this->assertTrue(Hash::check('password123', $bcryptUser->password));
        $this->assertTrue(Hash::check('password123', $argon2idUser->password));

        // Verify their algorithms are tracked correctly
        $this->assertEquals('bcrypt', $bcryptUser->password_algorithm);
        $this->assertEquals('argon2id', $argon2idUser->password_algorithm);
    }
}
