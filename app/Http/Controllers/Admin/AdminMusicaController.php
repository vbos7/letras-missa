<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Musica, Tema};
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminMusicaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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

        return Inertia::render('admin/musicas/index', [
            'musicas' => $musicas,
            'temas'   => $temas,
            'filters' => [
                'search'  => $request->search,
                'tema_id' => $request->tema_id,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $temas = Tema::orderBy('ordem')->get();

        return Inertia::render('admin/musicas/create', [
            'temas' => $temas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
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

        return redirect()->route('admin.musicas.index')
            ->with('success', 'Música criada com sucesso!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Musica $musica)
    {
        $temas = Tema::orderBy('ordem')->get();

        return Inertia::render('admin/musicas/edit', [
            'musica' => $musica->load('temas'),
            'temas'  => $temas,
        ]);
    }

    public function update(Request $request, Musica $musica)
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

        $temaIds = $validated['tema_ids'];
        unset($validated['tema_ids']);

        $musica->update($validated);
        $musica->temas()->sync($temaIds);

        return redirect()->route('admin.musicas.index')
            ->with('success', 'Música atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Musica $musica)
    {
        // Verifica se está em alguma lista
        if ($musica->listas()->count() > 0) {
            return back()->with('error', 'Não é possível excluir uma música que está sendo usada em listas.');
        }

        $musica->delete();

        return redirect()->route('admin.musicas.index')
            ->with('success', 'Música excluída com sucesso!');
    }
}
