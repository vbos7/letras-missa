<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Créditos do áudio (gravação) — para dar os devidos créditos e evitar
     * problemas com gravadoras/estúdios, no estilo das informações do YouTube.
     */
    public function up(): void
    {
        Schema::table('musicas', function (Blueprint $table) {
            $table->string('audio_album')->nullable()->after('tags');
            $table->string('audio_artista')->nullable()->after('audio_album');
            $table->string('audio_gravadora')->nullable()->after('audio_artista');
            $table->string('audio_ano')->nullable()->after('audio_gravadora');
            $table->string('audio_fonte_url')->nullable()->after('audio_ano');
            $table->text('audio_licenca')->nullable()->after('audio_fonte_url');
        });
    }

    public function down(): void
    {
        Schema::table('musicas', function (Blueprint $table) {
            $table->dropColumn([
                'audio_album',
                'audio_artista',
                'audio_gravadora',
                'audio_ano',
                'audio_fonte_url',
                'audio_licenca',
            ]);
        });
    }
};
