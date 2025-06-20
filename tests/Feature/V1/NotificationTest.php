<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Student;
use App\Models\AdmissionApplication;
use App\Notifications\ApplicationStatusUpdated;
use App\Services\AdmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $student;
    protected $application;
    protected $admissionService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->student = Student::factory()->create(['user_id' => $this->user->id]);
        $this->application = AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        $this->admissionService = new AdmissionService();
    }

    public function test_notification_is_created_when_application_status_is_updated()
    {
        Notification::fake();

        // Update application status using the service
        $this->admissionService->updateApplicationStatus($this->application, 'accepted');

        // Assert notification was sent to the user
        Notification::assertSentTo(
            $this->user,
            ApplicationStatusUpdated::class
        );
    }

    public function test_notification_is_not_created_when_status_does_not_change()
    {
        Notification::fake();

        $currentStatus = $this->application->status;
        
        // Update with the same status
        $this->admissionService->updateApplicationStatus($this->application, $currentStatus);

        // Assert no notification was sent
        Notification::assertNotSentTo($this->user, ApplicationStatusUpdated::class);
    }

    public function test_can_list_unread_notifications()
    {
        // Create some notifications for the user
        $this->user->notify(new ApplicationStatusUpdated($this->application));
        
        // Create another application and notification
        $anotherApplication = AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        $this->user->notify(new ApplicationStatusUpdated($anotherApplication));

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'type',
                        'data',
                        'read_at',
                        'created_at',
                        'updated_at'
                    ]
                ]
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        
        // Verify notification data structure
        $this->assertArrayHasKey('application_id', $data[0]['data']);
        $this->assertArrayHasKey('status', $data[0]['data']);
        $this->assertArrayHasKey('message', $data[0]['data']);
    }

    public function test_can_mark_notification_as_read()
    {
        // Create a notification
        $this->user->notify(new ApplicationStatusUpdated($this->application));
        
        $notification = $this->user->unreadNotifications->first();
        $this->assertNotNull($notification);
        $this->assertNull($notification->read_at);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(204);

        // Verify notification is marked as read
        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    public function test_cannot_mark_nonexistent_notification_as_read()
    {
        $fakeId = '12345678-1234-1234-1234-123456789012';
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/notifications/{$fakeId}/read");

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'The requested resource was not found.'
            ]);
    }

    public function test_user_cannot_access_another_users_notifications()
    {
        // Create another user and their notification
        $otherUser = User::factory()->create();
        $otherStudent = Student::factory()->create(['user_id' => $otherUser->id]);
        $otherApplication = AdmissionApplication::factory()->create(['student_id' => $otherStudent->id]);
        
        $otherUser->notify(new ApplicationStatusUpdated($otherApplication));
        $otherNotification = $otherUser->unreadNotifications->first();

        // Try to mark the other user's notification as read
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/v1/notifications/{$otherNotification->id}/read");

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'The requested resource was not found.'
            ]);
    }

    public function test_notifications_require_authentication()
    {
        // Test listing notifications without authentication
        $response = $this->getJson('/api/v1/notifications');
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);

        // Test marking notification as read without authentication
        $fakeId = '12345678-1234-1234-1234-123456789012';
        $response = $this->postJson("/api/v1/notifications/{$fakeId}/read");
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    public function test_notification_contains_correct_data()
    {
        // Update application status
        $this->admissionService->updateApplicationStatus($this->application, 'rejected');
        
        $notification = $this->user->unreadNotifications->first();
        $this->assertNotNull($notification);
        
        $data = $notification->data;
        $this->assertEquals($this->application->id, $data['application_id']);
        $this->assertEquals('rejected', $data['status']);
        $this->assertStringContainsString('rejected', $data['message']);
    }

    public function test_only_unread_notifications_are_returned()
    {
        // Create two notifications
        $this->user->notify(new ApplicationStatusUpdated($this->application));
        
        $anotherApplication = AdmissionApplication::factory()->create(['student_id' => $this->student->id]);
        $this->user->notify(new ApplicationStatusUpdated($anotherApplication));

        // Verify we have 2 unread notifications
        $this->assertEquals(2, $this->user->unreadNotifications->count());

        // Mark one as read
        $firstNotification = $this->user->unreadNotifications->first();
        $firstNotificationId = $firstNotification->id;
        $firstNotification->markAsRead();

        // Refresh the user to clear any cached relationships
        $this->user->refresh();
        
        // Verify we now have 1 unread notification
        $this->assertEquals(1, $this->user->unreadNotifications->count());

        // Get unread notifications via API
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        // Should only return 1 unread notification
        $this->assertCount(1, $data);
        $this->assertNotEquals($firstNotificationId, $data[0]['id']);
    }
} 