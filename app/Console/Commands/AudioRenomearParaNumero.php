<?php

namespace App\Console\Commands;

use App\Models\Musica;
use Illuminate\Console\Command;

class AudioRenomearParaNumero extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audio:renomear-para-numero {--dry-run : Apenas mostra o que seria feito, sem renomear}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Renomeia os arquivos de áudio de {id}.mp3 para {numero}.mp3 (número da música)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dir    = public_path('audio');
        $dryRun = (bool) $this->option('dry-run');

        if (!is_dir($dir)) {
            $this->error("Diretório não encontrado: {$dir}");

            return self::FAILURE;
        }

        // Mapa id => numero para as músicas existentes.
        $musicas = Musica::pluck('numero', 'id');

        // Fase 1: mover cada {id}.mp3 para um nome temporário, guardando o número de destino.
        // Duas fases evitam colisões entre o espaço de ids e o de números.
        $planejados = [];

        foreach ($musicas as $id => $numero) {
            $origem = "{$dir}/{$id}.mp3";

            if (!is_file($origem)) {
                continue;
            }

            $temp         = "{$dir}/_migrando_{$id}.mp3";
            $planejados[] = ['temp' => $temp, 'numero' => $numero, 'id' => $id];

            if (!$dryRun) {
                rename($origem, $temp);
            }
        }

        if (empty($planejados)) {
            $this->info('Nenhum arquivo de áudio nomeado por id encontrado. Nada a fazer.');

            return self::SUCCESS;
        }

        // Fase 2: mover cada temporário para {numero}.mp3.
        $total = 0;

        foreach ($planejados as $p) {
            $destino = "{$dir}/{$p['numero']}.mp3";
            $this->line("  {$p['id']}.mp3  →  {$p['numero']}.mp3");

            if (!$dryRun) {
                rename($p['temp'], $destino);
            }
            $total++;
        }

        if ($dryRun) {
            $this->warn("[dry-run] {$total} arquivo(s) seriam renomeados.");
        } else {
            $this->info("{$total} arquivo(s) renomeado(s) com sucesso.");
        }

        return self::SUCCESS;
    }
}
