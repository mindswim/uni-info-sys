<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EarlyAlertComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'early_alert_id',
        'user_id',
        'comment',
    ];

    public function earlyAlert()
    {
        return $this->belongsTo(EarlyAlert::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
