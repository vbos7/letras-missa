<?php

namespace App\Http\Middleware;

use App\Models\SolicitacaoMusica;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name'  => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth'  => [
                'user' => $request->user(),
            ],
            'solicitacoes_pendentes' => $request->user()?->is_admin
                ? SolicitacaoMusica::where('status', 'pendente')->count()
                : 0,
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'toast'       => $this->getFlashMessage($request),
        ];
    }

    /**
     * Converte mensagens flash do Laravel para o formato do toast
     */
    protected function getFlashMessage(Request $request): ?array
    {
        if ($request->session()->has('success')) {
            return [
                'type'    => 'success',
                'message' => $request->session()->get('success'),
            ];
        }

        if ($request->session()->has('error')) {
            return [
                'type'    => 'error',
                'message' => $request->session()->get('error'),
            ];
        }

        if ($request->session()->has('warning')) {
            return [
                'type'    => 'warning',
                'message' => $request->session()->get('warning'),
            ];
        }

        if ($request->session()->has('info')) {
            return [
                'type'    => 'info',
                'message' => $request->session()->get('info'),
            ];
        }

        return null;
    }
}
