<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Lista, Musica, SolicitacaoMusica, Tema, User};
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Estatísticas gerais
        $stats = [
            'total_musicas'          => Musica::count(),
            'total_musicas_ativas'   => Musica::where('ativo', true)->count(),
            'total_usuarios'         => User::count(),
            'total_admins'           => User::where('is_admin', true)->count(),
            'total_listas'           => Lista::count(),
            'total_listas_publicas'  => Lista::where('publica', true)->count(),
            'total_visualizacoes'    => Lista::sum('visualizacoes'),
            'total_temas'            => Tema::count(),
            'solicitacoes_pendentes' => SolicitacaoMusica::where('status', 'pendente')->count(),
        ];

        // Músicas mais usadas em listas
        $musicasMaisUsadas = Musica::withCount('listas')
            ->with('temas')
            ->orderBy('listas_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($musica) {
                return [
                    'id'          => $musica->id,
                    'numero'      => $musica->numero,
                    'titulo'      => $musica->titulo,
                    'autor'       => $musica->autor,
                    'tema'        => $musica->temas->first()?->nome,
                    'vezes_usada' => $musica->listas_count,
                ];
            });

        // Listas mais visualizadas
        $listasMaisVisualizadas = Lista::with('user')
            ->orderBy('visualizacoes', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($lista) {
                return [
                    'id'            => $lista->id,
                    'nome'          => $lista->nome,
                    'usuario'       => $lista->user->name,
                    'visualizacoes' => $lista->visualizacoes,
                    'publica'       => $lista->publica,
                    'created_at'    => $lista->created_at->format('d/m/Y'),
                ];
            });

        // Usuários mais ativos (com mais listas)
        $usuariosMaisAtivos = User::withCount('listas')
            ->orderBy('listas_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id'           => $user->id,
                    'nome'         => $user->name,
                    'email'        => $user->email,
                    'total_listas' => $user->listas_count,
                    'is_admin'     => $user->is_admin,
                ];
            });

        // Distribuição de músicas por tema
        $musicasPorTema = Tema::withCount('musicas')
            ->orderBy('musicas_count', 'desc')
            ->get()
            ->map(function ($tema) {
                return [
                    'nome'  => $tema->nome,
                    'cor'   => $tema->cor,
                    'total' => $tema->musicas_count,
                ];
            });

        // Crescimento nos últimos 30 dias
        $crescimentoUsuarios = User::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as data, COUNT(*) as total')
            ->groupBy('data')
            ->orderBy('data')
            ->get();

        $crescimentoListas = Lista::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as data, COUNT(*) as total')
            ->groupBy('data')
            ->orderBy('data')
            ->get();

        // Médias
        $totalUsuarios              = User::count();
        $totalListas                = Lista::count();
        $mediaListasPorUsuario      = $totalUsuarios > 0 ? round($totalListas / $totalUsuarios, 2) : 0;
        $mediaVisualizacoesPorLista = Lista::where('visualizacoes', '>', 0)->avg('visualizacoes') ?? 0;

        return Inertia::render('admin/dashboard', [
            'stats'                  => $stats,
            'musicasMaisUsadas'      => $musicasMaisUsadas,
            'listasMaisVisualizadas' => $listasMaisVisualizadas,
            'usuariosMaisAtivos'     => $usuariosMaisAtivos,
            'musicasPorTema'         => $musicasPorTema,
            'crescimentoUsuarios'    => $crescimentoUsuarios,
            'crescimentoListas'      => $crescimentoListas,
            'medias'                 => [
                'listas_por_usuario'      => round($mediaListasPorUsuario, 2),
                'visualizacoes_por_lista' => round($mediaVisualizacoesPorLista, 2),
            ],
        ]);
    }
}
