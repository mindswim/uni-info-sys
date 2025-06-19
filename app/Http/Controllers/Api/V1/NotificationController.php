<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Notifications",
    description: "Endpoints for managing user notifications."
)]
class NotificationController extends Controller
{
    #[OA\Get(
        path: "/api/v1/notifications",
        summary: "Get user notifications",
        description: "Retrieve all unread notifications for the authenticated user.",
        tags: ["Notifications"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of unread notifications.",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(
                                type: "object",
                                properties: [
                                    new OA\Property(property: "id", type: "string", example: "abc-123-def"),
                                    new OA\Property(property: "type", type: "string", example: "App\\Notifications\\ApplicationStatusUpdated"),
                                    new OA\Property(property: "data", type: "object", example: ["message" => "Your application status has been updated"]),
                                    new OA\Property(property: "read_at", type: "string", format: "date-time", nullable: true),
                                ]
                            )
                        )
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        return response()->json([
            'data' => $request->user()->unreadNotifications
        ]);
    }

    #[OA\Post(
        path: "/api/v1/notifications/{id}/read",
        summary: "Mark notification as read",
        description: "Mark a specific notification as read for the authenticated user.",
        tags: ["Notifications"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "Notification ID", schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Notification marked as read successfully."),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Notification not found"),
        ]
    )]
    public function markAsRead(Request $request, $notificationId)
    {
        $notification = $request->user()->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
        
        return response()->noContent();
    }
}
