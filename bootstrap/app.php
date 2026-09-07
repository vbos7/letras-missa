<?php

use App\Http\Middleware\{EnsureUserIsAdmin, EnsureUserIsColaborador, HandleAppearance, HandleInertiaRequests};
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\{Exceptions, Middleware};
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\{AccessDeniedHttpException, NotFoundHttpException};

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin'       => EnsureUserIsAdmin::class,
            'colaborador' => EnsureUserIsColaborador::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Renderiza página de erro customizada para Inertia
        $exceptions->respond(function ($response, $exception, $request) {
            // Apenas para requisições Inertia
            if (!$request->header('X-Inertia')) {
                return $response;
            }

            // Erro 404 - Não encontrado
            if ($exception instanceof NotFoundHttpException ||
                $exception instanceof ModelNotFoundException) {
                return Inertia::render('errors/404', [
                    'status' => 404,
                ])
                ->toResponse($request)
                ->setStatusCode(404);
            }

            // Erro 403 - Acesso negado
            if ($exception instanceof AccessDeniedHttpException ||
                $exception instanceof AuthorizationException) {
                return Inertia::render('errors/403', [
                    'status'  => 403,
                    'message' => $exception->getMessage() ?: 'Você não tem permissão para acessar este recurso.',
                ])
                ->toResponse($request)
                ->setStatusCode(403);
            }

            return $response;
        });
    })->create();
