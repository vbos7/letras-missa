import AppLayout from '@/components/app-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, FolderOpen, Music2, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Tema {
    id: number;
    nome: string;
    cor: string;
}

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    letra?: string;
    autor?: string;
    tom?: string;
}

interface PaginatedMusicas {
    data: Musica[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    tema: Tema;
    musicas: PaginatedMusicas;
}

export default function Show({ tema, musicas }: Props) {
    const [busca, setBusca] = useState('');
    const [autorSelecionado, setAutorSelecionado] = useState('');

    // Extrair lista de autores únicos
    const autores = useMemo(() => {
        const autoresSet = new Set(
            musicas.data.filter((m) => m.autor).map((m) => m.autor as string),
        );
        return Array.from(autoresSet).sort();
    }, [musicas.data]);

    // Filtrar músicas
    const musicasFiltradas = useMemo(() => {
        return musicas.data.filter((musica) => {
            const matchBusca =
                !busca ||
                musica.numero.toString().includes(busca) ||
                musica.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                musica.autor?.toLowerCase().includes(busca.toLowerCase()) ||
                musica.letra?.toLowerCase().includes(busca.toLowerCase());

            const matchAutor =
                !autorSelecionado || musica.autor === autorSelecionado;

            return matchBusca && matchAutor;
        });
    }, [musicas.data, busca, autorSelecionado]);

    const limparFiltros = () => {
        setBusca('');
        setAutorSelecionado('');
    };

    const temFiltrosAtivos = busca || autorSelecionado;

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl">
                {/* Botão Voltar */}
                <div className="mb-6">
                    <Link
                        href="/temas"
                        className="inline-flex items-center transition-colors"
                        style={{ color: '#C7AB65' }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = '#B89B55')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = '#C7AB65')
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para temas
                    </Link>
                </div>

                {/* Header do Tema */}
                <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-lg">
                    <div
                        className="p-8"
                        style={{
                            background: `linear-gradient(135deg, ${tema.cor || '#3B82F6'} 0%, ${tema.cor || '#3B82F6'}dd 100%)`,
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <FolderOpen className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 text-white">
                                <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                                    {tema.nome}
                                </h1>
                                <p className="text-white/90">
                                    {musicasFiltradas.length} de {musicas.total}{' '}
                                    {musicas.total === 1 ? 'música' : 'músicas'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Busca e Filtros */}
                <div className="mb-4 space-y-3">
                    {/* Barra de Busca */}
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar por número, título, autor ou letra..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 shadow-sm transition-shadow focus:shadow-md"
                            style={{ borderColor: '#d1d5db' }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#C7AB65';
                                e.currentTarget.style.outline =
                                    '2px solid #C7AB65';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.outline = 'none';
                            }}
                        />
                    </div>

                    {/* Filtro por Autor */}
                    {autores.length > 0 && (
                        <div className="flex items-center gap-3">
                            <select
                                value={autorSelecionado}
                                onChange={(e) =>
                                    setAutorSelecionado(e.target.value)
                                }
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition-colors"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor =
                                        '#C7AB65';
                                    e.currentTarget.style.outline =
                                        '2px solid #C7AB65';
                                    e.currentTarget.style.outlineOffset = '2px';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor =
                                        '#d1d5db';
                                    e.currentTarget.style.outline = 'none';
                                }}
                            >
                                <option value="">Todos os autores</option>
                                {autores.map((autor) => (
                                    <option key={autor} value={autor}>
                                        {autor}
                                    </option>
                                ))}
                            </select>
                            {temFiltrosAtivos && (
                                <button
                                    onClick={limparFiltros}
                                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                    Limpar
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Lista de Músicas */}
                <div className="space-y-3">
                    {musicasFiltradas.length === 0 ? (
                        <div className="rounded-xl bg-white py-12 text-center shadow-sm">
                            <Music2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                            <p className="text-gray-600">
                                {musicas.data.length === 0
                                    ? 'Nenhuma música cadastrada neste tema ainda.'
                                    : 'Nenhuma música encontrada com esses filtros.'}
                            </p>
                            {temFiltrosAtivos && (
                                <button
                                    onClick={limparFiltros}
                                    className="mt-4 underline transition-colors"
                                    style={{ color: '#C7AB65' }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color =
                                            '#B89B55')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.color =
                                            '#C7AB65')
                                    }
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        musicasFiltradas.map((musica) => (
                            <Link
                                key={musica.id}
                                href={`/musicas/${musica.id}`}
                                className="block rounded-lg bg-white p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg font-bold"
                                        style={{
                                            backgroundColor: `${tema.cor || '#3B82F6'}20`,
                                            color: tema.cor || '#3B82F6',
                                        }}
                                    >
                                        {musica.numero}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="mb-1 text-lg font-semibold text-gray-900">
                                            {musica.titulo}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                            {musica.autor && (
                                                <span className="text-gray-500">
                                                    {musica.autor}
                                                </span>
                                            )}
                                            {musica.tom && (
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                                    Tom: {musica.tom}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Music2 className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Paginação */}
                {musicas.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {Array.from(
                            { length: musicas.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <Link
                                key={page}
                                href={`/temas/${tema.id}?page=${page}`}
                                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                                    page === musicas.current_page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
