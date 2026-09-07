<?php

namespace App\Http\Controllers;

use App\Models\Tema;
use Inertia\Inertia;

class TemaController extends Controller
{
    public function index()
    {
        $temas = Tema::withCount('musicas')
            ->orderBy('ordem')
            ->get();

        return Inertia::render('temas/index', [
            'temas' => $temas,
        ]);
    }

    public function show(Tema $tema)
    {
        $musicas = $tema->musicas()
            ->where('ativo', true)
            ->orderBy('numero')
            ->paginate(50);

        return Inertia::render('temas/show', [
            'tema'    => $tema,
            'musicas' => $musicas,
        ]);
    }
}
