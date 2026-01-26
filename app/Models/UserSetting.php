<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        // Notifications
        'email_grades',
        'email_courses',
        'email_announcements',
        'push_notifications',
        'sms_alerts',
        // Appearance
        'theme',
        'compact_mode',
        'animations',
        // Localization
        'language',
        'timezone',
    ];

    protected $casts = [
        'email_grades' => 'boolean',
        'email_courses' => 'boolean',
        'email_announcements' => 'boolean',
        'push_notifications' => 'boolean',
        'sms_alerts' => 'boolean',
        'compact_mode' => 'boolean',
        'animations' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create settings for a user
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            [
                'email_grades' => true,
                'email_courses' => true,
                'email_announcements' => false,
                'push_notifications' => true,
                'sms_alerts' => false,
                'theme' => 'system',
                'compact_mode' => false,
                'animations' => true,
                'language' => 'en',
                'timezone' => 'America/New_York',
            ]
        );
    }

    /**
     * Get notification preferences
     */
    public function getNotificationPreferences(): array
    {
        return [
            'email_grades' => $this->email_grades,
            'email_courses' => $this->email_courses,
            'email_announcements' => $this->email_announcements,
            'push_notifications' => $this->push_notifications,
            'sms_alerts' => $this->sms_alerts,
        ];
    }

    /**
     * Get appearance preferences
     */
    public function getAppearancePreferences(): array
    {
        return [
            'theme' => $this->theme,
            'compact_mode' => $this->compact_mode,
            'animations' => $this->animations,
        ];
    }
}
