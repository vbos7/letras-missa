import AppLayout from '@/components/app-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Home, Music } from 'lucide-react';

interface Props {
    status?: number;
    message?: string;
}

export default function NotFound({ status = 404, message }: Props) {
    const defaultMessage =
        'A página ou lista que você está procurando não existe ou foi removida.';
    const displayMessage = message || defaultMessage;

    return (
        <AppLayout>
            <Head title="Página não encontrada" />
            <div className="flex min-h-[60vh] items-center justify-center py-12">
                <div className="mx-auto max-w-2xl px-4 text-center">
                    {/* Ícone */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-red-200 blur-2xl" />
                            <AlertCircle className="relative h-24 w-24 text-red-500" />
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <h1 className="mb-4 text-6xl font-bold text-gray-900">
                        {status}
                    </h1>
                    <h2 className="mb-4 text-3xl font-bold text-gray-800">
                        Página não encontrada
                    </h2>
                    <p className="mb-8 text-lg text-gray-600">
                        {displayMessage}
                    </p>

                    {/* Botões */}
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
                        >
                            <Home className="h-5 w-5" />
                            Voltar ao início
                        </Link>
                        <Link
                            href="/musicas"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-8 py-4 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                        >
                            <Music className="h-5 w-5" />
                            Ver músicas
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
