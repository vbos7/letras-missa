<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Verifica se está autenticado
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Verifica se é admin
        if (!auth()->user()->is_admin) {
            // Se for requisição Inertia/AJAX, retorna 403
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                abort(403, 'Você não tem permissão de administrador.');
            }

            // Se for navegação normal, redireciona
            return redirect('/')->with('error', 'Acesso negado.');
        }

        return $next($request);
    }
}
