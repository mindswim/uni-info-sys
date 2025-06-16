<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all unread notifications for the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        return response()->json([
            'data' => $request->user()->unreadNotifications
        ]);
    }

    /**
     * Mark a specific notification as read.
     *
     * @param Request $request
     * @param string $notificationId
     * @return \Illuminate\Http\Response
     */
    public function markAsRead(Request $request, $notificationId)
    {
        $notification = $request->user()->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
        
        return response()->noContent();
    }
}
