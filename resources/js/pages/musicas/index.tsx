import AppLayout from '@/components/app-layout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { Filter, Music2, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Index({ musicas, temas, autores }) {
    const [busca, setBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [temaSelecionado, setTemaSelecionado] = useState('');
    const [autorSelecionado, setAutorSelecionado] = useState('');
    const [ordenacao, setOrdenacao] = useState('numero');

    // Filtragem e ordenação no frontend
    const musicasFiltradas = useMemo(() => {
        let resultado = [...musicas];

        // Filtro de busca
        if (busca.trim()) {
            const buscaLower = busca.toLowerCase();
            resultado = resultado.filter(
                (musica) =>
                    musica.numero.toString().includes(buscaLower) ||
                    musica.titulo.toLowerCase().includes(buscaLower) ||
                    musica.letra.toLowerCase().includes(buscaLower) ||
                    musica.autor?.toLowerCase().includes(buscaLower),
            );
        }

        // Filtro por tema
        if (temaSelecionado) {
            resultado = resultado.filter((musica) =>
                musica.temas?.some((t) => t.id === parseInt(temaSelecionado)),
            );
        }

        // Filtro por autor
        if (autorSelecionado) {
            resultado = resultado.filter(
                (musica) => musica.autor === autorSelecionado,
            );
        }

        // Ordenação
        switch (ordenacao) {
            case 'numero':
                resultado.sort((a, b) => a.numero - b.numero);
                break;
            case 'numero_desc':
                resultado.sort((a, b) => b.numero - a.numero);
                break;
            case 'titulo':
                resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
                break;
            case 'titulo_desc':
                resultado.sort((a, b) => b.titulo.localeCompare(a.titulo));
                break;
        }

        return resultado;
    }, [musicas, busca, temaSelecionado, autorSelecionado, ordenacao]);

    const limparFiltros = () => {
        setBusca('');
        setTemaSelecionado('');
        setAutorSelecionado('');
        setOrdenacao('numero');
        setModalAberto(false);
    };

    const temFiltrosAtivos =
        busca || temaSelecionado || autorSelecionado || ordenacao !== 'numero';

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
                            Catálogo de Músicas
                        </h1>
                        <p className="text-gray-600">
                            {musicasFiltradas.length} de {musicas.length}{' '}
                            músicas
                        </p>
                    </div>
                    <button
                        onClick={() => setModalAberto(true)}
                        className="relative rounded-lg px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                        style={{ backgroundColor: '#C7AB65' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <span>Filtrar</span>
                        </div>
                        {temFiltrosAtivos && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                !
                            </span>
                        )}
                    </button>
                </div>

                {/* Busca Rápida */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar por número, título, letra ou autor..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 shadow-sm transition-shadow focus:shadow-md"
                            style={{
                                borderColor: '#d1d5db'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#C7AB65';
                                e.currentTarget.style.outline = '2px solid #C7AB65';
                                e.currentTarget.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.outline = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Tags de Filtros Ativos */}
                {temFiltrosAtivos && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {temaSelecionado && (
                            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: '#F5F0E8', color: '#8B7A45' }}>
                                Tema:{' '}
                                {
                                    temas.find(
                                        (t) => t.id === parseInt(temaSelecionado),
                                    )?.nome
                                }
                                <button
                                    onClick={() => setTemaSelecionado('')}
                                    className="rounded-full"
                                    style={{ backgroundColor: 'transparent' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5DFD0'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {autorSelecionado && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                Autor: {autorSelecionado}
                                <button
                                    onClick={() => setAutorSelecionado('')}
                                    className="rounded-full hover:bg-green-200"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {ordenacao !== 'numero' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                                Ordenação:{' '}
                                {ordenacao === 'numero_desc'
                                    ? 'Nº Decrescente'
                                    : ordenacao === 'titulo'
                                      ? 'A-Z'
                                      : 'Z-A'}
                                <button
                                    onClick={() => setOrdenacao('numero')}
                                    className="rounded-full hover:bg-purple-200"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={limparFiltros}
                            className="text-sm text-gray-600 underline hover:text-gray-900"
                        >
                            Limpar todos
                        </button>
                    </div>
                )}

                {/* Lista de Músicas */}
                <div className="space-y-3">
                    {musicasFiltradas.map((musica) => (
                        <Link
                            key={musica.id}
                            href={`/musicas/${musica.id}`}
                            className="block rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg font-bold" style={{ backgroundColor: '#F5F0E8', color: '#C7AB65' }}>
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
                    ))}
                </div>

                {/* Mensagem quando não há resultados */}
                {musicasFiltradas.length === 0 && (
                    <div className="py-12 text-center">
                        <Music2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <p className="text-gray-600">
                            Nenhuma música encontrada com esses filtros.
                        </p>
                        <button
                            onClick={limparFiltros}
                            className="mt-4 underline transition-colors"
                            style={{ color: '#C7AB65' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#B89B55'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#C7AB65'}
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de Filtros */}
            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        {/* Header do Modal */}
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Filtros
                            </h2>
                            <button
                                onClick={() => setModalAberto(false)}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="space-y-4">
                            {/* Filtro por Tema */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Tema Litúrgico
                                </label>
                                <Select
                                    value={temaSelecionado || '__all__'}
                                    onValueChange={(v) =>
                                        setTemaSelecionado(v === '__all__' ? '' : v)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Todos os temas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Todos os temas</SelectItem>
                                        {temas.map((tema) => (
                                            <SelectItem key={tema.id} value={String(tema.id)}>
                                                {tema.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtro por Autor */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Autor/Compositor
                                </label>
                                <Select
                                    value={autorSelecionado || '__all__'}
                                    onValueChange={(v) =>
                                        setAutorSelecionado(v === '__all__' ? '' : v)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Todos os autores" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Todos os autores</SelectItem>
                                        {autores.map((autor, index) => (
                                            <SelectItem key={index} value={autor}>
                                                {autor}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Ordenação */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Ordenar por
                                </label>
                                <Select
                                    value={ordenacao}
                                    onValueChange={setOrdenacao}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="numero">Número Crescente</SelectItem>
                                        <SelectItem value="numero_desc">Número Decrescente</SelectItem>
                                        <SelectItem value="titulo">Título (A-Z)</SelectItem>
                                        <SelectItem value="titulo_desc">Título (Z-A)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Botões do Modal */}
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={limparFiltros}
                                className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={() => setModalAberto(false)}
                                className="flex-1 rounded-lg px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                                style={{ backgroundColor: '#C7AB65' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
