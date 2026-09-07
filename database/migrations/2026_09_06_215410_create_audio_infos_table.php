<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB, Schema};

return new class () extends Migration {
    /**
     * Créditos do áudio em tabela separada (1:1 com música).
     */
    public function up(): void
    {
        Schema::create('audio_infos', function (Blueprint $table) {
            $table->id();

            if (DB::connection()->getDriverName() !== 'sqlite') {
                $table->foreignId('musica_id')->unique()->constrained('musicas')->cascadeOnDelete();
            } else {
                $table->unsignedBigInteger('musica_id')->unique();
            }

            $table->string('album')->nullable();
            $table->string('artista')->nullable();
            $table->string('gravadora')->nullable();
            $table->string('ano')->nullable();
            $table->string('fonte_url')->nullable();
            $table->text('licenca')->nullable();
            $table->timestamps();
        });

        // Migra os dados que estavam nas colunas de musicas (se houver) e remove as colunas.
        if (Schema::hasColumn('musicas', 'audio_album')) {
            DB::table('musicas')
                ->where(function ($q) {
                    $q->whereNotNull('audio_album')
                        ->orWhereNotNull('audio_artista')
                        ->orWhereNotNull('audio_gravadora')
                        ->orWhereNotNull('audio_ano')
                        ->orWhereNotNull('audio_fonte_url')
                        ->orWhereNotNull('audio_licenca');
                })
                ->orderBy('id')
                ->each(function ($m) {
                    DB::table('audio_infos')->insert([
                        'musica_id'  => $m->id,
                        'album'      => $m->audio_album,
                        'artista'    => $m->audio_artista,
                        'gravadora'  => $m->audio_gravadora,
                        'ano'        => $m->audio_ano,
                        'fonte_url'  => $m->audio_fonte_url,
                        'licenca'    => $m->audio_licenca,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                });

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
    }

    public function down(): void
    {
        Schema::table('musicas', function (Blueprint $table) {
            $table->string('audio_album')->nullable();
            $table->string('audio_artista')->nullable();
            $table->string('audio_gravadora')->nullable();
            $table->string('audio_ano')->nullable();
            $table->string('audio_fonte_url')->nullable();
            $table->text('audio_licenca')->nullable();
        });

        Schema::dropIfExists('audio_infos');
    }
};
