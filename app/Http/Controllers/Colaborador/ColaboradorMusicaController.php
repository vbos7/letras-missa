<?php

namespace App\Http\Controllers\Colaborador;

use App\Http\Controllers\Controller;
use App\Models\{Musica, SolicitacaoMusica, Tema};
use Illuminate\Http\Request;
use Inertia\Inertia;

class ColaboradorMusicaController extends Controller
{
    public function index(Request $request)
    {
        $query = Musica::with('temas');

        if ($request->filled('tema_id')) {
            $query->whereHas('temas', fn ($q) => $q->where('temas.id', $request->tema_id));
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $musicas = $query->orderBy('numero')->paginate(20);
        $temas   = Tema::orderBy('ordem')->get();

        return Inertia::render('colaborador/musicas/index', [
            'musicas' => $musicas,
            'temas'   => $temas,
            'filters' => [
                'search'  => $request->search,
                'tema_id' => $request->tema_id,
            ],
        ]);
    }

    public function create()
    {
        $temas = Tema::orderBy('ordem')->get();

        return Inertia::render('colaborador/musicas/create', [
            'temas' => $temas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero'     => 'required|integer|unique:musicas,numero',
            'titulo'     => 'required|string|max:255',
            'letra'      => 'required|string',
            'autor'      => 'nullable|string|max:255',
            'tom'        => 'nullable|string|max:10',
            'tema_ids'   => 'required|array|min:1',
            'tema_ids.*' => 'exists:temas,id',
            'tags'       => 'nullable|string',
            'ativo'      => 'sometimes|boolean',
        ]);

        $validated['ativo'] = $validated['ativo'] ?? true;
        $temaIds            = $validated['tema_ids'];
        unset($validated['tema_ids']);

        $musica = Musica::create($validated);
        $musica->temas()->sync($temaIds);

        return redirect()->route('colaborador.musicas.index')
            ->with('success', 'Música cadastrada com sucesso!');
    }

    public function edit(Musica $musica)
    {
        $temas = Tema::orderBy('ordem')->get();

        return Inertia::render('colaborador/musicas/edit', [
            'musica' => $musica->load('temas'),
            'temas'  => $temas,
        ]);
    }

    public function solicitarEdicao(Request $request, Musica $musica)
    {
        $validated = $request->validate([
            'numero'     => 'required|integer|unique:musicas,numero,' . $musica->id,
            'titulo'     => 'required|string|max:255',
            'letra'      => 'required|string',
            'autor'      => 'nullable|string|max:255',
            'tom'        => 'nullable|string|max:10',
            'tema_ids'   => 'required|array|min:1',
            'tema_ids.*' => 'exists:temas,id',
            'tags'       => 'nullable|string',
            'ativo'      => 'boolean',
        ]);

        SolicitacaoMusica::create([
            'user_id'   => auth()->id(),
            'musica_id' => $musica->id,
            'tipo'      => 'edicao',
            'dados'     => $validated,
            'status'    => 'pendente',
        ]);

        return redirect()->route('colaborador.musicas.index')
            ->with('success', 'Solicitação de edição enviada para aprovação!');
    }

    public function solicitarExclusao(Musica $musica)
    {
        SolicitacaoMusica::create([
            'user_id'   => auth()->id(),
            'musica_id' => $musica->id,
            'tipo'      => 'exclusao',
            'dados'     => null,
            'status'    => 'pendente',
        ]);

        return redirect()->route('colaborador.musicas.index')
            ->with('success', 'Solicitação de exclusão enviada para aprovação!');
    }
}
