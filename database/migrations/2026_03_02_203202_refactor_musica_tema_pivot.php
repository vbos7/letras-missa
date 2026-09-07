<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB, Schema};

return new class () extends Migration {
    public function up(): void
    {
        // 1. Criar tabela pivot
        Schema::create('musica_tema', function (Blueprint $table) {
            $table->foreignId('musica_id')->constrained('musicas')->cascadeOnDelete();
            $table->foreignId('tema_id')->constrained('temas')->cascadeOnDelete();
            $table->primary(['musica_id', 'tema_id']);
            $table->timestamps();
        });

        // 2. Migrar tema_id existente para a tabela pivot
        DB::table('musicas')->whereNotNull('tema_id')->get()->each(function ($musica) {
            DB::table('musica_tema')->insert([
                'musica_id'  => $musica->id,
                'tema_id'    => $musica->tema_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        // 3. Remover a coluna tema_id de musicas
        // Primeiro, remover FK (MySQL) e índice explícito separadamente
        // pois no SQLite o dropColumn falha se o índice ainda referenciar a coluna
        if (DB::connection()->getDriverName() !== 'sqlite') {
            Schema::table('musicas', function (Blueprint $table) {
                $table->dropForeign(['tema_id']);
            });
        }
        Schema::table('musicas', function (Blueprint $table) {
            $table->dropIndex('musicas_tema_id_index');
        });
        Schema::table('musicas', function (Blueprint $table) {
            $table->dropColumn('tema_id');
        });
    }

    public function down(): void
    {
        // Restaurar coluna tema_id
        Schema::table('musicas', function (Blueprint $table) {
            $table->foreignId('tema_id')->nullable()->constrained('temas')->nullOnDelete();
        });

        // Restaurar dados do pivot de volta para tema_id (pega o primeiro tema)
        DB::table('musica_tema')->get()->each(function ($pivot) {
            DB::table('musicas')
                ->where('id', $pivot->musica_id)
                ->whereNull('tema_id')
                ->update(['tema_id' => $pivot->tema_id]);
        });

        Schema::dropIfExists('musica_tema');
    }
};
