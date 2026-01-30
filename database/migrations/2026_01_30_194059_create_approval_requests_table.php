<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_requests', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['section_offering', 'enrollment_override']);
            $table->morphs('requestable');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('staff')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('staff')->onDelete('set null');
            $table->datetime('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('denial_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['department_id', 'status']);
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_requests');
    }
};
