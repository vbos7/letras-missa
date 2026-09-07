<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB, Schema};

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('musicas', function (Blueprint $table) {
            $table->id();
            $table->integer('numero')->unique(); // Número do hinário (ex: 123)
            $table->string('titulo');
            $table->text('letra');
            $table->string('autor')->nullable();
            $table->string('tom')->nullable(); // Tom musical (ex: G, C, D)

            // No SQLite (testes), não criamos FK pois complica o drop da coluna depois
            if (DB::connection()->getDriverName() !== 'sqlite') {
                $table->foreignId('tema_id')->nullable()->constrained('temas')->nullOnDelete();
            } else {
                $table->unsignedBigInteger('tema_id')->nullable();
            }
            $table->text('tags')->nullable(); // Para busca adicional
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            // Índices para otimizar buscas
            $table->index('numero');
            $table->index('tema_id');

            // Fulltext index apenas para MySQL/MariaDB (não suportado em SQLite para testes)
            if (config('database.default') !== 'sqlite') {
                $table->fullText(['titulo', 'letra']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('musicas');
    }
};
