<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get a setting value with caching
     */
    public static function getValue(string $group, string $key, mixed $default = null): mixed
    {
        $cacheKey = "system_setting.{$group}.{$key}";

        return Cache::remember($cacheKey, 3600, function () use ($group, $key, $default) {
            $setting = self::where('group', $group)->where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $group, string $key, mixed $value, string $type = 'string', ?string $description = null): self
    {
        $setting = self::updateOrCreate(
            ['group' => $group, 'key' => $key],
            [
                'value' => self::serializeValue($value, $type),
                'type' => $type,
                'description' => $description,
            ]
        );

        // Clear cache
        Cache::forget("system_setting.{$group}.{$key}");
        Cache::forget("system_settings.{$group}");

        return $setting;
    }

    /**
     * Get all settings for a group
     */
    public static function getGroup(string $group): array
    {
        $cacheKey = "system_settings.{$group}";

        return Cache::remember($cacheKey, 3600, function () use ($group) {
            $settings = self::where('group', $group)->get();

            $result = [];
            foreach ($settings as $setting) {
                $result[$setting->key] = self::castValue($setting->value, $setting->type);
            }

            return $result;
        });
    }

    /**
     * Get all settings organized by group
     */
    public static function getAllGrouped(): array
    {
        $settings = self::all();

        $result = [];
        foreach ($settings as $setting) {
            if (!isset($result[$setting->group])) {
                $result[$setting->group] = [];
            }
            $result[$setting->group][$setting->key] = self::castValue($setting->value, $setting->type);
        }

        return $result;
    }

    /**
     * Cast stored value to proper type
     */
    protected static function castValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Serialize value for storage
     */
    protected static function serializeValue(mixed $value, string $type): string
    {
        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'json', 'array' => json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        $groups = self::distinct('group')->pluck('group');

        foreach ($groups as $group) {
            Cache::forget("system_settings.{$group}");

            $keys = self::where('group', $group)->pluck('key');
            foreach ($keys as $key) {
                Cache::forget("system_setting.{$group}.{$key}");
            }
        }
    }

    /**
     * Seed default settings
     */
    public static function seedDefaults(): void
    {
        $defaults = [
            'registration' => [
                ['key' => 'enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Allow student registration'],
                ['key' => 'add_drop_enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Allow add/drop period'],
                ['key' => 'waitlist_enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Enable course waitlists'],
                ['key' => 'max_credits', 'value' => 18, 'type' => 'integer', 'description' => 'Maximum credits per term'],
                ['key' => 'max_waitlist_per_student', 'value' => 3, 'type' => 'integer', 'description' => 'Max waitlist entries per student'],
            ],
            'notifications' => [
                ['key' => 'email_enabled', 'value' => true, 'type' => 'boolean', 'description' => 'Enable email notifications'],
                ['key' => 'sms_enabled', 'value' => false, 'type' => 'boolean', 'description' => 'Enable SMS notifications'],
                ['key' => 'registration_alerts', 'value' => true, 'type' => 'boolean', 'description' => 'Send registration alerts'],
                ['key' => 'payment_reminders', 'value' => true, 'type' => 'boolean', 'description' => 'Send payment reminders'],
                ['key' => 'grade_notifications', 'value' => true, 'type' => 'boolean', 'description' => 'Send grade notifications'],
            ],
            'academic' => [
                ['key' => 'current_term', 'value' => 'Spring 2025', 'type' => 'string', 'description' => 'Current academic term'],
                ['key' => 'grading_open', 'value' => true, 'type' => 'boolean', 'description' => 'Allow faculty grade submission'],
                ['key' => 'transcript_requests', 'value' => true, 'type' => 'boolean', 'description' => 'Allow transcript requests'],
            ],
            'system' => [
                ['key' => 'maintenance_mode', 'value' => false, 'type' => 'boolean', 'description' => 'Enable maintenance mode'],
                ['key' => 'version', 'value' => '2.5.1', 'type' => 'string', 'description' => 'System version'],
            ],
        ];

        foreach ($defaults as $group => $settings) {
            foreach ($settings as $setting) {
                self::setValue($group, $setting['key'], $setting['value'], $setting['type'], $setting['description']);
            }
        }
    }
}
