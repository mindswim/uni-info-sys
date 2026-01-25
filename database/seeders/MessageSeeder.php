<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Staff;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Log::info('Seeding messages...');

        // Get demo users
        $admin = User::where('email', 'admin@university.edu')->first();
        $students = Student::with('user')->take(10)->get();
        $staff = Staff::with('user')->take(5)->get();

        if (!$admin || $students->isEmpty()) {
            Log::warning('Missing users for message seeding');
            return;
        }

        // Create admin support conversations with students
        foreach ($students->take(5) as $student) {
            if (!$student->user) continue;

            $conversation = Conversation::create([
                'type' => Conversation::TYPE_DIRECT,
                'created_by' => $student->user->id,
                'last_message_at' => now()->subDays(rand(0, 7)),
            ]);

            $conversation->participants()->attach([
                $admin->id,
                $student->user->id,
            ]);

            // Create some messages
            $messages = [
                [
                    'sender_id' => $student->user->id,
                    'body' => 'Hi, I have a question about my enrollment status.',
                    'created_at' => now()->subDays(3)->subHours(rand(1, 5)),
                ],
                [
                    'sender_id' => $admin->id,
                    'body' => 'Hello! I\'d be happy to help. What would you like to know about your enrollment?',
                    'created_at' => now()->subDays(3)->subHours(rand(0, 1)),
                ],
                [
                    'sender_id' => $student->user->id,
                    'body' => 'I\'m trying to register for CS301 but it says I\'m missing a prerequisite. I think I already completed it.',
                    'created_at' => now()->subDays(2)->subHours(rand(2, 6)),
                ],
                [
                    'sender_id' => $admin->id,
                    'body' => 'Let me check your academic records. Can you confirm which course you completed for the prerequisite?',
                    'created_at' => now()->subDays(2)->subHours(rand(0, 2)),
                ],
            ];

            foreach ($messages as $msgData) {
                $conversation->messages()->create(array_merge($msgData, [
                    'type' => Message::TYPE_TEXT,
                ]));
            }

            $conversation->update(['last_message_at' => $messages[count($messages) - 1]['created_at']]);
        }

        // Create student-to-student conversations
        if ($students->count() >= 2) {
            $student1 = $students[0];
            $student2 = $students[1];

            if ($student1->user && $student2->user) {
                $conversation = Conversation::create([
                    'type' => Conversation::TYPE_DIRECT,
                    'created_by' => $student1->user->id,
                    'last_message_at' => now()->subDays(1),
                ]);

                $conversation->participants()->attach([
                    $student1->user->id,
                    $student2->user->id,
                ]);

                $messages = [
                    [
                        'sender_id' => $student1->user->id,
                        'body' => 'Hey, are you in the CS201 study group?',
                        'created_at' => now()->subDays(2),
                    ],
                    [
                        'sender_id' => $student2->user->id,
                        'body' => 'Yes! We\'re meeting tomorrow at the library.',
                        'created_at' => now()->subDays(2)->addHours(1),
                    ],
                    [
                        'sender_id' => $student1->user->id,
                        'body' => 'Great! What time? I have class until 2pm.',
                        'created_at' => now()->subDays(1)->subHours(5),
                    ],
                    [
                        'sender_id' => $student2->user->id,
                        'body' => 'We\'re planning for 3pm in study room B. Does that work?',
                        'created_at' => now()->subDays(1)->subHours(4),
                    ],
                    [
                        'sender_id' => $student1->user->id,
                        'body' => 'Perfect! See you there.',
                        'created_at' => now()->subDays(1)->subHours(3),
                    ],
                ];

                foreach ($messages as $msgData) {
                    $conversation->messages()->create(array_merge($msgData, [
                        'type' => Message::TYPE_TEXT,
                    ]));
                }

                $conversation->update(['last_message_at' => $messages[count($messages) - 1]['created_at']]);
            }
        }

        // Create staff-to-student conversations (academic advising)
        if ($staff->isNotEmpty() && $students->isNotEmpty()) {
            foreach ($staff->take(2) as $staffMember) {
                if (!$staffMember->user) continue;

                foreach ($students->take(3) as $student) {
                    if (!$student->user) continue;

                    $conversation = Conversation::create([
                        'type' => Conversation::TYPE_DIRECT,
                        'created_by' => $staffMember->user->id,
                        'last_message_at' => now()->subDays(rand(1, 14)),
                    ]);

                    $conversation->participants()->attach([
                        $staffMember->user->id,
                        $student->user->id,
                    ]);

                    $messageTemplates = [
                        [
                            'from' => 'staff',
                            'body' => "Hi {$student->first_name}, I wanted to follow up on our advising session. Have you had a chance to review the course requirements we discussed?",
                        ],
                        [
                            'from' => 'student',
                            'body' => "Yes, thank you for the information! I have a question about the research requirement.",
                        ],
                        [
                            'from' => 'staff',
                            'body' => "Of course, what would you like to know?",
                        ],
                    ];

                    $baseTime = now()->subDays(rand(5, 10));
                    foreach ($messageTemplates as $index => $template) {
                        $senderId = $template['from'] === 'staff' ? $staffMember->user->id : $student->user->id;
                        $conversation->messages()->create([
                            'sender_id' => $senderId,
                            'body' => $template['body'],
                            'type' => Message::TYPE_TEXT,
                            'created_at' => $baseTime->copy()->addHours($index * 2),
                        ]);
                    }

                    $conversation->update(['last_message_at' => $baseTime->copy()->addHours(4)]);
                }
            }
        }

        $conversationCount = Conversation::count();
        $messageCount = Message::count();
        Log::info("Created {$conversationCount} conversations with {$messageCount} messages");
    }
}
