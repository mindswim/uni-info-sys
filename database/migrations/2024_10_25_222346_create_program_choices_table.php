<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('program_choices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('admission_applications')->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->integer('preference_order');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('program_choices');
    }
};
