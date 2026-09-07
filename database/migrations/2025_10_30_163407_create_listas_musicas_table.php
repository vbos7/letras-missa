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
        Schema::create('lista_musicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lista_id')->constrained('listas')->cascadeOnDelete();
            $table->foreignId('musica_id')->constrained('musicas')->cascadeOnDelete();
            $table->integer('ordem'); // Ordem da música na lista
            $table->text('observacao')->nullable(); // Ex: "Tocar devagar", "Solo de violão"
            $table->timestamps();

            $table->unique(['lista_id', 'musica_id']);
            $table->index(['lista_id', 'ordem']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lista_musicas');
    }
};
