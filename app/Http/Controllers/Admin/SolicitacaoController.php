<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SolicitacaoMusica;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SolicitacaoController extends Controller
{
    public function index()
    {
        $solicitacoes = SolicitacaoMusica::with(['user', 'musica.temas', 'reviewer'])
            ->orderByRaw("CASE WHEN status = 'pendente' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/solicitacoes/index', [
            'solicitacoes' => $solicitacoes,
        ]);
    }

    public function aprovar(SolicitacaoMusica $solicitacao)
    {
        if (!$solicitacao->isPendente()) {
            return back()->with('error', 'Esta solicitação já foi processada.');
        }

        if ($solicitacao->tipo === 'edicao') {
            $dados   = $solicitacao->dados;
            $temaIds = $dados['tema_ids'] ?? [];
            unset($dados['tema_ids']);

            $solicitacao->musica->update($dados);

            if ($temaIds) {
                $solicitacao->musica->temas()->sync($temaIds);
            }
        } elseif ($solicitacao->tipo === 'exclusao') {
            // Não exclui se estiver em listas
            if ($solicitacao->musica->listas()->count() > 0) {
                return back()->with('error', 'Não é possível excluir: música está em uso em listas.');
            }

            $solicitacao->musica->delete();
        }

        $solicitacao->update([
            'status'      => 'aprovado',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Solicitação aprovada com sucesso!');
    }

    public function rejeitar(Request $request, SolicitacaoMusica $solicitacao)
    {
        if (!$solicitacao->isPendente()) {
            return back()->with('error', 'Esta solicitação já foi processada.');
        }

        $validated = $request->validate([
            'nota_admin' => 'nullable|string|max:500',
        ]);

        $solicitacao->update([
            'status'      => 'rejeitado',
            'nota_admin'  => $validated['nota_admin'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Solicitação rejeitada.');
    }
}
