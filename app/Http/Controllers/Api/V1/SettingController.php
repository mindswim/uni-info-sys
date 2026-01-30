<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    // ==========================================
    // User Settings (authenticated user)
    // ==========================================

    /**
     * Get current user's settings
     */
    public function mySettings(Request $request): JsonResponse
    {
        $settings = UserSetting::getOrCreateForUser($request->user()->id);

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update current user's settings
     */
    public function updateMySettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Notifications
            'email_grades' => 'nullable|boolean',
            'email_courses' => 'nullable|boolean',
            'email_announcements' => 'nullable|boolean',
            'push_notifications' => 'nullable|boolean',
            'sms_alerts' => 'nullable|boolean',
            // Appearance
            'theme' => 'nullable|string|in:light,dark,system',
            'compact_mode' => 'nullable|boolean',
            'animations' => 'nullable|boolean',
            // Localization
            'language' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:50',
        ]);

        $settings = UserSetting::getOrCreateForUser($request->user()->id);
        $settings->update($validated);

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => $settings,
        ]);
    }

    /**
     * Update user's notification preferences
     */
    public function updateNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_grades' => 'nullable|boolean',
            'email_courses' => 'nullable|boolean',
            'email_announcements' => 'nullable|boolean',
            'push_notifications' => 'nullable|boolean',
            'sms_alerts' => 'nullable|boolean',
        ]);

        $settings = UserSetting::getOrCreateForUser($request->user()->id);
        $settings->update($validated);

        return response()->json([
            'message' => 'Notification preferences updated',
            'data' => $settings->getNotificationPreferences(),
        ]);
    }

    /**
     * Update user's appearance preferences
     */
    public function updateAppearance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme' => 'nullable|string|in:light,dark,system',
            'compact_mode' => 'nullable|boolean',
            'animations' => 'nullable|boolean',
        ]);

        $settings = UserSetting::getOrCreateForUser($request->user()->id);
        $settings->update($validated);

        return response()->json([
            'message' => 'Appearance preferences updated',
            'data' => $settings->getAppearancePreferences(),
        ]);
    }

    // ==========================================
    // System Settings (admin only)
    // ==========================================

    /**
     * Get all system settings
     */
    public function index(): JsonResponse
    {
        $settings = SystemSetting::getAllGrouped();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Get settings for a specific group
     */
    public function getGroup(string $group): JsonResponse
    {
        $validGroups = ['registration', 'notifications', 'academic', 'system'];

        if (! in_array($group, $validGroups)) {
            return response()->json([
                'message' => 'Invalid settings group',
            ], 400);
        }

        $settings = SystemSetting::getGroup($group);

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update settings for a group
     */
    public function updateGroup(Request $request, string $group): JsonResponse
    {
        $validGroups = ['registration', 'notifications', 'academic', 'system'];

        if (! in_array($group, $validGroups)) {
            return response()->json([
                'message' => 'Invalid settings group',
            ], 400);
        }

        $typeMap = $this->getTypeMap($group);

        foreach ($request->all() as $key => $value) {
            if (isset($typeMap[$key])) {
                SystemSetting::setValue($group, $key, $value, $typeMap[$key]);
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => SystemSetting::getGroup($group),
        ]);
    }

    /**
     * Get a single setting value
     */
    public function getSetting(string $group, string $key): JsonResponse
    {
        $value = SystemSetting::getValue($group, $key);

        if ($value === null) {
            return response()->json([
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'data' => [
                'group' => $group,
                'key' => $key,
                'value' => $value,
            ],
        ]);
    }

    /**
     * Set a single setting value
     */
    public function setSetting(Request $request, string $group, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required',
            'type' => 'nullable|string|in:string,boolean,integer,float,json',
            'description' => 'nullable|string|max:255',
        ]);

        $type = $validated['type'] ?? 'string';

        SystemSetting::setValue(
            $group,
            $key,
            $validated['value'],
            $type,
            $validated['description'] ?? null
        );

        return response()->json([
            'message' => 'Setting updated',
            'data' => [
                'group' => $group,
                'key' => $key,
                'value' => SystemSetting::getValue($group, $key),
            ],
        ]);
    }

    // ==========================================
    // System Maintenance Actions
    // ==========================================

    /**
     * Clear system cache
     */
    public function clearCache(): JsonResponse
    {
        Cache::flush();
        SystemSetting::clearCache();

        return response()->json([
            'message' => 'Cache cleared successfully',
        ]);
    }

    /**
     * Get system info
     */
    public function systemInfo(): JsonResponse
    {
        return response()->json([
            'data' => [
                'version' => SystemSetting::getValue('system', 'version', '2.5.1'),
                'environment' => app()->environment(),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'maintenance_mode' => SystemSetting::getValue('system', 'maintenance_mode', false),
                'database_connected' => $this->checkDatabaseConnection(),
            ],
        ]);
    }

    /**
     * Toggle maintenance mode
     */
    public function toggleMaintenance(Request $request): JsonResponse
    {
        $enable = $request->boolean('enable');

        SystemSetting::setValue('system', 'maintenance_mode', $enable, 'boolean');

        return response()->json([
            'message' => $enable ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
            'maintenance_mode' => $enable,
        ]);
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    /**
     * Get type map for a settings group
     */
    protected function getTypeMap(string $group): array
    {
        return match ($group) {
            'registration' => [
                'enabled' => 'boolean',
                'add_drop_enabled' => 'boolean',
                'waitlist_enabled' => 'boolean',
                'max_credits' => 'integer',
                'max_waitlist_per_student' => 'integer',
            ],
            'notifications' => [
                'email_enabled' => 'boolean',
                'sms_enabled' => 'boolean',
                'registration_alerts' => 'boolean',
                'payment_reminders' => 'boolean',
                'grade_notifications' => 'boolean',
            ],
            'academic' => [
                'current_term' => 'string',
                'grading_open' => 'boolean',
                'transcript_requests' => 'boolean',
            ],
            'system' => [
                'maintenance_mode' => 'boolean',
                'version' => 'string',
            ],
            default => [],
        };
    }

    /**
     * Check database connection
     */
    protected function checkDatabaseConnection(): bool
    {
        try {
            \DB::connection()->getPdo();

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
