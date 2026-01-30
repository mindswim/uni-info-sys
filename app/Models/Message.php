<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const TYPE_TEXT = 'text';

    public const TYPE_FILE = 'file';

    public const TYPE_SYSTEM = 'system';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'type',
        'attachments',
        'reply_to_id',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    // Relationships

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replyTo()
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function replies()
    {
        return $this->hasMany(Message::class, 'reply_to_id');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }

    // Helpers

    public function isReadBy(User $user): bool
    {
        if ($this->sender_id === $user->id) {
            return true;
        }

        return $this->reads()->where('user_id', $user->id)->exists();
    }

    public function markAsReadBy(User $user): void
    {
        if ($this->sender_id === $user->id) {
            return;
        }

        $this->reads()->firstOrCreate([
            'user_id' => $user->id,
        ], [
            'read_at' => now(),
        ]);
    }

    protected static function booted(): void
    {
        static::created(function (Message $message) {
            // Update conversation's last_message_at
            $message->conversation->update([
                'last_message_at' => $message->created_at,
            ]);
        });
    }
}
