<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const TYPE_DIRECT = 'direct';

    public const TYPE_GROUP = 'group';

    public const TYPE_COURSE = 'course';

    public const TYPE_SUPPORT = 'support';

    protected $fillable = [
        'subject',
        'type',
        'course_section_id',
        'created_by',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    // Relationships

    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot('last_read_at', 'is_muted', 'is_archived')
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class);
    }

    public function discussionTopic()
    {
        return $this->hasOne(DiscussionTopic::class);
    }

    // Scopes

    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->where('is_archived', false);
        });
    }

    public function scopeWithUnreadCount(Builder $query, User $user): Builder
    {
        return $query->withCount(['messages as unread_count' => function ($q) use ($user) {
            $q->where('sender_id', '!=', $user->id)
                ->whereDoesntHave('reads', function ($readQuery) use ($user) {
                    $readQuery->where('user_id', $user->id);
                });
        }]);
    }

    // Helpers

    public function getUnreadCountForUser(User $user): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereDoesntHave('reads', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->count();
    }

    public function markAsReadForUser(User $user): void
    {
        $this->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        // Mark all unread messages as read
        $unreadMessages = $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereDoesntHave('reads', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->get();

        foreach ($unreadMessages as $message) {
            $message->reads()->create([
                'user_id' => $user->id,
                'read_at' => now(),
            ]);
        }
    }

    public function getOtherParticipant(User $currentUser): ?User
    {
        if ($this->type !== self::TYPE_DIRECT) {
            return null;
        }

        return $this->participants
            ->where('id', '!=', $currentUser->id)
            ->first();
    }

    public function getDisplayName(User $currentUser): string
    {
        if ($this->subject) {
            return $this->subject;
        }

        if ($this->type === self::TYPE_DIRECT) {
            $other = $this->getOtherParticipant($currentUser);

            return $other ? $other->name : 'Deleted User';
        }

        if ($this->type === self::TYPE_COURSE && $this->courseSection) {
            return $this->courseSection->course->course_code.' Discussion';
        }

        return 'Conversation';
    }

    public static function findOrCreateDirect(User $user1, User $user2): self
    {
        // Find existing direct conversation between these two users
        $existing = self::where('type', self::TYPE_DIRECT)
            ->whereHas('participants', function ($q) use ($user1) {
                $q->where('user_id', $user1->id);
            })
            ->whereHas('participants', function ($q) use ($user2) {
                $q->where('user_id', $user2->id);
            })
            ->first();

        if ($existing) {
            return $existing;
        }

        // Create new conversation
        $conversation = self::create([
            'type' => self::TYPE_DIRECT,
            'created_by' => $user1->id,
        ]);

        $conversation->participants()->attach([$user1->id, $user2->id]);

        return $conversation;
    }
}
