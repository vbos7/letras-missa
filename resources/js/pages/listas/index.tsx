import AppLayout from '@/components/app-layout';
import { ListaGuiadaDialog } from '@/components/lista-guiada-dialog';
import { Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Edit,
    List,
    Music2,
    Plus,
    Share2,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ listas, temas }) {
    const [modalEscolha, setModalEscolha] = useState(false);
    const [dialogGuiado, setDialogGuiado] = useState(false);

    const handleCompartilhar = async (lista) => {
        const url = `${window.location.origin}/lista/${lista.token}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: lista.nome,
                    text: `Confira a lista de músicas: ${lista.nome}`,
                    url,
                });
            } catch {
                // cancelado
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                alert('Link copiado para a área de transferência!');
            } catch {
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Link copiado para a área de transferência!');
                } catch {
                    alert('Não foi possível copiar o link. URL: ' + url);
                }
                document.body.removeChild(textArea);
            }
        }
    };

    const abrirLista = (token) => {
        window.open(`/lista/${token}`, '_blank');
    };

    const abrirGuiada = () => {
        setModalEscolha(false);
        setDialogGuiado(true);
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
                            Minhas Listas
                        </h1>
                        <p className="text-gray-600">
                            Gerencie suas listas de músicas para missas
                        </p>
                    </div>
                    <button
                        onClick={() => setModalEscolha(true)}
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-lg transition-colors hover:shadow-xl"
                        style={{ backgroundColor: '#C7AB65' }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#B89B55')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = '#C7AB65')
                        }
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline">Nova Lista</span>
                    </button>
                </div>

                {/* Lista */}
                {listas.length > 0 ? (
                    <div className="overflow-hidden rounded-xl bg-white shadow-md">
                        <div className="divide-y divide-gray-200">
                            {listas.map((lista) => (
                                <div key={lista.id}>
                                    <div
                                        onClick={() => abrirLista(lista.token)}
                                        className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-gray-50 md:gap-4"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate font-semibold text-gray-900">
                                                {lista.nome}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Music2 className="h-3 w-3" />
                                                    {lista.musicas_count}{' '}
                                                    {lista.musicas_count === 1
                                                        ? 'música'
                                                        : 'músicas'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(
                                                        lista.created_at,
                                                    ).toLocaleDateString(
                                                        'pt-BR',
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 gap-2">
                                            <Link
                                                href={`/listas/${lista.id}/edit`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
                                                style={{
                                                    backgroundColor: '#C7AB65',
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#B89B55')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#C7AB65')
                                                }
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="hidden md:inline">
                                                    Editar
                                                </span>
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCompartilhar(lista);
                                                }}
                                                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                                title="Compartilhar"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span className="hidden md:inline">
                                                    Compartilhar
                                                </span>
                                            </button>
                                            <Link
                                                href={`/listas/${lista.id}`}
                                                method="delete"
                                                as="button"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onBefore={() =>
                                                    confirm(
                                                        'Tem certeza que deseja excluir esta lista?',
                                                    )
                                                }
                                                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="hidden md:inline">
                                                    Excluir
                                                </span>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
                                        {lista.visualizacoes}{' '}
                                        {lista.visualizacoes === 1
                                            ? 'visualização'
                                            : 'visualizações'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl bg-white p-12 text-center shadow-md">
                        <Music2 className="mx-auto mb-4 h-20 w-20 text-gray-300" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">
                            Nenhuma lista criada ainda
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Comece criando sua primeira lista de músicas para a
                            missa
                        </p>
                        <button
                            onClick={() => setModalEscolha(true)}
                            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors"
                            style={{ backgroundColor: '#C7AB65' }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    '#B89B55')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                    '#C7AB65')
                            }
                        >
                            <Plus className="h-5 w-5" />
                            Criar Primeira Lista
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de escolha de tipo de lista */}
            {modalEscolha && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Como deseja criar sua lista?
                            </h2>
                            <button
                                onClick={() => setModalEscolha(false)}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Lista Guiada */}
                            <button
                                onClick={abrirGuiada}
                                className="flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all hover:shadow-md"
                                style={{ borderColor: '#C7AB65' }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        '#FDFAF4')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        'transparent')
                                }
                            >
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full"
                                    style={{ backgroundColor: '#F5F0E8' }}
                                >
                                    <Sparkles
                                        className="h-6 w-6"
                                        style={{ color: '#C7AB65' }}
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Lista Guiada
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Siga os momentos da missa passo a passo
                                    </p>
                                </div>
                            </button>

                            {/* Lista Manual */}
                            <Link
                                href="/listas/create"
                                className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 p-5 text-center transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <List className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Lista Manual
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Adicione as músicas livremente
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog de lista guiada */}
            <ListaGuiadaDialog
                aberto={dialogGuiado}
                onFechar={() => setDialogGuiado(false)}
                temas={temas}
            />
        </AppLayout>
    );
}
