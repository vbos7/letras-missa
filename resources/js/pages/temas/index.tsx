import AppLayout from '@/components/app-layout';
import { Link } from '@inertiajs/react';
import { ChevronRight, FolderOpen } from 'lucide-react';

interface Tema {
    id: number;
    nome: string;
    cor?: string | null;
    musicas_count: number;
}

export default function Index({ temas }: { temas: Tema[] }) {
    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
                        Músicas por Tema
                    </h1>
                    <p className="text-gray-600">
                        Explore o catálogo organizado por momentos da missa
                    </p>
                </div>

                {/* Grid de Temas */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {temas.map((tema) => (
                        <Link
                            key={tema.id}
                            href={`/temas/${tema.id}`}
                            className="group rounded-xl border-2 border-transparent bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            style={{ borderColor: 'transparent' }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.borderColor = '#E5DFD0')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.borderColor =
                                    'transparent')
                            }
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                                    style={{
                                        backgroundColor: tema.cor || '#3B82F6',
                                        opacity: 0.1,
                                    }}
                                >
                                    <FolderOpen
                                        className="h-6 w-6"
                                        style={{ color: tema.cor || '#3B82F6' }}
                                    />
                                </div>
                                <ChevronRight
                                    className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600"
                                    style={{ color: '#9CA3AF' }}
                                />
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-gray-900">
                                {tema.nome}
                            </h3>

                            <p className="text-sm text-gray-600">
                                {tema.musicas_count}{' '}
                                {tema.musicas_count === 1
                                    ? 'música'
                                    : 'músicas'}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Mensagem se não houver temas */}
                {temas.length === 0 && (
                    <div className="rounded-xl bg-white py-12 text-center shadow-sm">
                        <FolderOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <p className="text-gray-600">
                            Nenhum tema cadastrado ainda.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
