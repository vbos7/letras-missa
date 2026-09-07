<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tema;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminTemaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $temas = Tema::withCount('musicas')
            ->orderBy('ordem')
            ->get();

        return Inertia::render('admin/temas/index', [
            'temas' => $temas,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/temas/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome'  => 'required|string|max:255',
            'cor'   => 'required|string|max:7',
            'ordem' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['nome']);

        // Se não informou ordem, pega a próxima
        if (!isset($validated['ordem'])) {
            $validated['ordem'] = Tema::max('ordem') + 1;
        }

        Tema::create($validated);

        return redirect()->route('admin.temas.index')
            ->with('success', 'Tema criado com sucesso!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tema $tema)
    {
        return Inertia::render('admin/temas/edit', [
            'tema' => $tema,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tema $tema)
    {
        $validated = $request->validate([
            'nome'  => 'required|string|max:255',
            'cor'   => 'required|string|max:7',
            'ordem' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['nome']);

        $tema->update($validated);

        return redirect()->route('admin.temas.index')
            ->with('success', 'Tema atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tema $tema)
    {
        // Verifica se tem músicas associadas
        if ($tema->musicas()->count() > 0) {
            return back()->with('error', 'Não é possível excluir um tema que possui músicas associadas.');
        }

        $tema->delete();

        return redirect()->route('admin.temas.index')
            ->with('success', 'Tema excluído com sucesso!');
    }
}
