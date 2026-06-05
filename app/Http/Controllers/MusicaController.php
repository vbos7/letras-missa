<?php

namespace App\Http\Controllers;

use App\Models\Musica;
use App\Models\Tema;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MusicaController extends Controller
{
    public function index()
    {
        // Retorna todas as músicas ativas de uma vez (filtragem no frontend)
        $musicas = Musica::with('temas')
            ->where('ativo', true)
            ->orderBy('numero')
            ->get();

        $temas = Tema::orderBy('ordem')->get();

        // Buscar todos os autores únicos
        $autores = Musica::where('ativo', true)
            ->whereNotNull('autor')
            ->where('autor', '!=', '')
            ->distinct()
            ->orderBy('autor')
            ->pluck('autor');

        return Inertia::render('musicas/index', [
            'musicas' => $musicas,
            'temas' => $temas,
            'autores' => $autores,
        ]);
    }

    public function show(Musica $musica)
    {
        $musica->load('temas');

        $audioUrl = file_exists(public_path("audio/{$musica->id}.mp3"))
            ? "/audio/{$musica->id}.mp3"
            : null;

        // Se o usuário estiver logado, buscar suas listas com informação se já contém esta música
        $listas = null;
        if (auth()->check()) {
            $listas = auth()->user()->listas()
                ->select('id', 'nome')
                ->get()
                ->map(function ($lista) use ($musica) {
                    $lista->tem_musica = $lista->musicas()->where('musica_id', $musica->id)->exists();
                    return $lista;
                });
        }

        return Inertia::render('musicas/show', [
            'musica' => $musica,
            'listas' => $listas,
            'audioUrl' => $audioUrl,
        ]);
    }

    public function porTema(Tema $tema)
    {
        $musicas = Musica::with('temas')
            ->whereHas('temas', fn ($q) => $q->where('temas.id', $tema->id))
            ->where('ativo', true)
            ->orderBy('numero')
            ->paginate(50);

        return Inertia::render('musicas/PorTema', [
            'tema' => $tema,
            'musicas' => $musicas,
        ]);
    }
}
