<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Campos completos de crédito, no padrão da descrição auto-gerada do YouTube:
     * distribuidora ("Provided to YouTube by"), compositor, gravadora (℗),
     * data de lançamento completa e a descrição bruta (respaldo jurídico).
     */
    public function up(): void
    {
        Schema::table('audio_infos', function (Blueprint $table) {
            $table->string('compositor')->nullable()->after('artista');
            $table->string('distribuidora')->nullable()->after('gravadora');
        });

        // ano -> data_lancamento (data completa, ex.: 2021-04-16)
        Schema::table('audio_infos', function (Blueprint $table) {
            $table->renameColumn('ano', 'data_lancamento');
        });

        // licenca -> descricao (texto bruto completo da descrição)
        Schema::table('audio_infos', function (Blueprint $table) {
            $table->renameColumn('licenca', 'descricao');
        });
    }

    public function down(): void
    {
        Schema::table('audio_infos', function (Blueprint $table) {
            $table->renameColumn('descricao', 'licenca');
        });
        Schema::table('audio_infos', function (Blueprint $table) {
            $table->renameColumn('data_lancamento', 'ano');
        });
        Schema::table('audio_infos', function (Blueprint $table) {
            $table->dropColumn(['compositor', 'distribuidora']);
        });
    }
};
