<?php

namespace App\Http\Controllers;

use App\Models\Lista;
use App\Models\Musica;
use App\Models\Tema;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListaController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $listas = Lista::where('user_id', auth()->id())
            ->withCount('musicas')
            ->latest()
            ->get();

        $temas = Tema::with(['musicas' => function ($query) {
            $query->where('ativo', true)->orderBy('numero');
        }])->orderBy('ordem')->get();

        return Inertia::render('listas/index', [
            'listas' => $listas,
            'temas' => $temas,
        ]);
    }

    public function create()
    {
        return Inertia::render('listas/create');
    }

    public function storeGuiada(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'musicas' => 'array',
            'musicas.*' => 'exists:musicas,id',
        ]);

        $lista = auth()->user()->listas()->create([
            'nome' => $validated['nome'],
            'publica' => true,
        ]);

        foreach (array_values($validated['musicas'] ?? []) as $index => $musicaId) {
            $lista->musicas()->attach($musicaId, ['ordem' => $index + 1]);
        }

        return redirect()->route('listas.edit', $lista)
            ->with('success', 'Lista criada com sucesso!');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'publica' => 'boolean',
        ]);

        $lista = auth()->user()->listas()->create($validated);

        return redirect()->route('listas.edit', $lista)
            ->with('success', 'Lista criada com sucesso!');
    }

    public function edit(Lista $lista)
    {
        $this->authorize('update', $lista);

        $lista->load(['musicas.temas']);
        $todasMusicas = Musica::with('temas')
            ->where('ativo', true)
            ->orderBy('numero')
            ->get();

        // Buscar temas e autores para os filtros
        $temas = Tema::orderBy('nome')->get();
        $autores = Musica::whereNotNull('autor')
            ->where('ativo', true)
            ->distinct()
            ->pluck('autor')
            ->sort()
            ->values();

        return Inertia::render('listas/edit', [
            'lista' => $lista,
            'todasMusicas' => $todasMusicas,
            'temas' => $temas,
            'autores' => $autores,
        ]);
    }

    public function update(Request $request, Lista $lista)
    {
        $this->authorize('update', $lista);

        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'publica' => 'boolean',
        ]);

        $lista->update($validated);

        return back()->with('success', 'Lista atualizada com sucesso!');
    }

    public function adicionarMusica(Request $request, Lista $lista)
    {
        $this->authorize('update', $lista);

        $validated = $request->validate([
            'musica_id' => 'required|exists:musicas,id',
            'observacao' => 'nullable|string',
        ]);

        // Verificar se a música já está na lista
        if ($lista->musicas()->where('musica_id', $validated['musica_id'])->exists()) {
            return back()->with('info', 'Esta música já está na lista!');
        }

        // Calcula próxima ordem
        $ultimaOrdem = $lista->musicas()->max('ordem') ?? 0;

        $lista->musicas()->attach($validated['musica_id'], [
            'ordem' => $ultimaOrdem + 1,
            'observacao' => $validated['observacao'] ?? null,
        ]);

        return back()->with('success', 'Música adicionada à lista!');
    }

    public function removerMusica(Lista $lista, Musica $musica)
    {
        $this->authorize('update', $lista);

        $lista->musicas()->detach($musica->id);

        // Reordena as músicas restantes
        $musicasRestantes = $lista->musicas()
            ->orderBy('ordem')
            ->get();

        foreach ($musicasRestantes as $index => $m) {
            $lista->musicas()->updateExistingPivot($m->id, [
                'ordem' => $index + 1,
            ]);
        }

        return back()->with('success', 'Música removida da lista!');
    }

    public function reordenar(Request $request, Lista $lista)
    {
        $this->authorize('update', $lista);

        $validated = $request->validate([
            'musicas' => 'required|array',
            'musicas.*.id' => 'required|exists:musicas,id',
            'musicas.*.ordem' => 'required|integer',
        ]);

        foreach ($validated['musicas'] as $musica) {
            $lista->musicas()->updateExistingPivot($musica['id'], [
                'ordem' => $musica['ordem'],
            ]);
        }

        return back()->with('success', 'Ordem atualizada!');
    }

    public function destroy(Lista $lista)
    {
        $this->authorize('delete', $lista);

        $lista->delete();

        return redirect()->route('listas.index')
            ->with('success', 'Lista excluída com sucesso!');
    }

    // Método público para visualizar lista compartilhada
    public function compartilhada($token)
    {
        $lista = Lista::where('token', $token)
            ->where('publica', true)
            ->first();

        if (!$lista) {
            return Inertia::render('errors/404', [
                'status' => 404,
                'message' => 'Esta lista não existe ou não está mais disponível publicamente.',
            ])->toResponse(request())->setStatusCode(404);
        }

        $lista->incrementarVisualizacoes();
        $lista->load(['musicas.temas', 'user']);

        return Inertia::render('listas/compartilhada', [
            'lista' => $lista,
        ]);
    }
}
