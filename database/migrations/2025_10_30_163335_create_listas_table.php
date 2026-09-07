<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('listas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nome'); // Ex: "Missa Domingo 15/10"
            $table->string('token')->unique(); // Token único para compartilhamento
            $table->boolean('publica')->default(true); // Se pode ser acessada via link
            $table->integer('visualizacoes')->default(0);
            $table->timestamps();

            $table->index('token');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listas');
    }
};
