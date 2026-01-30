<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_hour_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0=Sunday, 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->string('location')->nullable();
            $table->boolean('is_virtual')->default(false);
            $table->string('meeting_link')->nullable();
            $table->unsignedInteger('max_appointments')->default(3);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['staff_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_hour_slots');
    }
};
