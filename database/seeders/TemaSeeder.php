<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TemaSeeder extends Seeder
{
    public function run(): void
    {
        /**
         * Run the database seeds.
         */
        $temas = [
            ['nome' => 'Entrada', 'cor' => '#3B82F6', 'ordem' => 1],
            ['nome' => 'Ato Penitencial', 'cor' => '#10B981', 'ordem' => 2],
            ['nome' => 'Glória', 'cor' => '#8B5CF6', 'ordem' => 3],
            ['nome' => 'Meditação', 'cor' => '#F59E0B', 'ordem' => 4],
            ['nome' => 'Aclamação ao Evangelho', 'cor' => '#EF4444', 'ordem' => 5],
            ['nome' => 'Creio', 'cor' => '#06B6D4', 'ordem' => 6],
            ['nome' => 'Ofertório', 'cor' => '#EC4899', 'ordem' => 7],
            ['nome' => 'Santo', 'cor' => '#14B8A6', 'ordem' => 8],
            ['nome' => 'Amém', 'cor' => '#F97316', 'ordem' => 9],
            ['nome' => 'Paz', 'cor' => '#84CC16', 'ordem' => 10],
            ['nome' => 'Cordeiro', 'cor' => '#06B6D4', 'ordem' => 11],
            ['nome' => 'Comunhão', 'cor' => '#6366F1', 'ordem' => 12],
            ['nome' => 'Ação de Graças', 'cor' => '#0EA5E9', 'ordem' => 13],
            ['nome' => 'Final', 'cor' => '#DC2626', 'ordem' => 14],
            ['nome' => 'Cura', 'cor' => '#FBBF24', 'ordem' => 15],
            ['nome' => 'Louvor', 'cor' => '#EF4444', 'ordem' => 16],
            ['nome' => 'Adoração', 'cor' => '#3B82F6', 'ordem' => 17],
            ['nome' => 'Entrega', 'cor' => '#10B981', 'ordem' => 18],
            ['nome' => 'Espírito Santo', 'cor' => '#8B5CF6', 'ordem' => 19],
            ['nome' => 'Maria', 'cor' => '#F59E0B', 'ordem' => 20],
            ['nome' => 'Consolo e Esperança', 'cor' => '#EF4444', 'ordem' => 21],
        ];

        foreach ($temas as $tema) {
            DB::table('temas')->insert([
                'nome'       => $tema['nome'],
                'slug'       => Str::slug($tema['nome']),
                'cor'        => $tema['cor'],
                'ordem'      => $tema['ordem'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
