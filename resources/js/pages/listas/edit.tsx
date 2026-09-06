import AppLayout from '@/components/app-layout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { normalizarBusca } from '@/lib/utils';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router, useForm } from '@inertiajs/react';
import {
    Check,
    GripVertical,
    Pause,
    Play,
    Plus,
    Save,
    Search,
    Share2,
    Trash2,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

function formatarTempo(s: number) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

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
    temas?: Tema[];
    has_audio?: boolean;
}

interface Lista {
    id: number;
    nome: string;
    token: string;
    publica: boolean;
    musicas: Musica[];
}

interface Props {
    lista: Lista;
    todasMusicas: Musica[];
    temas: Tema[];
    autores: string[];
}

// Componente para item arrastável
function SortableItem({
    musica,
    removerMusica,
}: {
    musica: Musica;
    removerMusica: (musica: Musica) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: musica.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
        >
            <div
                {...attributes}
                {...listeners}
                className="touch-none cursor-grab p-1 active:cursor-grabbing"
            >
                <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-sm font-bold"
                style={{ backgroundColor: '#F5F0E8', color: '#C7AB65' }}
            >
                {musica.numero}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                    {musica.titulo}
                </p>
                {musica.temas && musica.temas.length > 0 && (
                    <p className="text-xs text-gray-500">
                        {musica.temas.map((t) => t.nome).join(', ')}
                    </p>
                )}
            </div>
            <button
                onClick={() => removerMusica(musica)}
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function Edit({ lista, todasMusicas, temas, autores }: Props) {
    const [copiado, setCopiado] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [buscaMusica, setBuscaMusica] = useState('');
    const [temaSelecionado, setTemaSelecionado] = useState('');
    const [autorSelecionado, setAutorSelecionado] = useState('');
    const [musicas, setMusicas] = useState(lista.musicas);

    // Player de áudio (igual ao da lista guiada)
    const audioRef = useRef<HTMLAudioElement>(null);
    const [audioMusica, setAudioMusica] = useState<Musica | null>(null);
    const [tocando, setTocando] = useState(false);
    const [tempoAtual, setTempoAtual] = useState(0);
    const [duracao, setDuracao] = useState(0);
    const [volume, setVolume] = useState(1);

    const playMusica = (musica: Musica) => {
        if (!audioRef.current) return;

        if (audioMusica?.id === musica.id) {
            // Mesma música: alterna play/pause
            if (tocando) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        } else {
            // Nova música
            setAudioMusica(musica);
            setTempoAtual(0);
            setDuracao(0);
            audioRef.current.src = `/audio/${musica.numero}.mp3`;
            audioRef.current.play().catch(() => {
                setAudioMusica(null);
            });
        }
    };

    const fecharPlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setAudioMusica(null);
        setTocando(false);
        setTempoAtual(0);
        setDuracao(0);
    };

    const handleVolume = (v: number) => {
        setVolume(v);
        if (audioRef.current) audioRef.current.volume = v;
    };

    const fecharModal = () => {
        setModalAberto(false);
        fecharPlayer();
    };

    const sensors = useSensors(
        // Mouse: arrasta ao mover 8px (evita conflito com cliques)
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
        // Touch (celular/iPad): pressiona e segura ~200ms para arrastar,
        // assim o scroll normal da lista continua funcionando
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const { data, setData, put, processing, errors } = useForm({
        nome: lista.nome,
        publica: lista.publica,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/listas/${lista.id}`);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = musicas.findIndex((m) => m.id === active.id);
            const newIndex = musicas.findIndex((m) => m.id === over.id);

            const newMusicas = arrayMove(musicas, oldIndex, newIndex);
            setMusicas(newMusicas);

            // Enviar nova ordem ao backend
            router.post(
                `/${lista.id}/reordenar`,
                {
                    musicas: newMusicas.map((m, index) => ({
                        id: m.id,
                        ordem: index + 1,
                    })),
                },
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const adicionarMusica = (musica: Musica) => {
        router.post(
            `/${lista.id}/musicas`,
            {
                musica_id: musica.id,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    fecharModal();
                    setBuscaMusica('');
                    // Atualizar lista local
                    const props = page.props as unknown as {
                        lista: { musicas: Musica[] };
                    };
                    setMusicas(props.lista.musicas);
                },
            },
        );
    };

    const removerMusica = (musica: Musica) => {
        if (confirm('Remover esta música da lista?')) {
            router.delete(`/${lista.id}/musicas/${musica.id}`, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Atualizar lista local
                    const props = page.props as unknown as {
                        lista: { musicas: Musica[] };
                    };
                    setMusicas(props.lista.musicas);
                },
            });
        }
    };

    const copiarLink = () => {
        const url = `${window.location.origin}/lista/${lista.token}`;
        navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const buscaNorm = normalizarBusca(buscaMusica);
    const musicasFiltradas = todasMusicas.filter((m: Musica) => {
        // Filtro de busca (número, título, autor e letra) — ignora acentuação e pontuação
        const matchBusca =
            !buscaMusica ||
            m.numero.toString().includes(buscaNorm) ||
            normalizarBusca(m.titulo).includes(buscaNorm) ||
            normalizarBusca(m.autor ?? '').includes(buscaNorm) ||
            normalizarBusca(m.letra ?? '').includes(buscaNorm);

        // Filtro de tema
        const matchTema =
            !temaSelecionado ||
            m.temas?.some((t) => t.id === parseInt(temaSelecionado));

        // Filtro de autor
        const matchAutor = !autorSelecionado || m.autor === autorSelecionado;

        return matchBusca && matchTema && matchAutor;
    });

    const musicasNaLista = musicas.map((m: Musica) => m.id);

    return (
        <AppLayout>
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Editar Lista
                    </h1>
                    <p className="text-gray-600">
                        Monte a sequência de músicas para sua missa
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Informações da Lista */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-xl bg-white p-6 shadow-md">
                            <h2 className="mb-4 text-lg font-semibold">
                                Informações
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Nome da Lista *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nome}
                                        onChange={(e) =>
                                            setData('nome', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        style={{ borderColor: '#d1d5db' }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor =
                                                '#C7AB65';
                                            e.currentTarget.style.outline =
                                                '2px solid #C7AB65';
                                            e.currentTarget.style.outlineOffset =
                                                '2px';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor =
                                                '#d1d5db';
                                            e.currentTarget.style.outline =
                                                'none';
                                        }}
                                        required
                                    />
                                    {errors.nome && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.nome}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50"
                                    style={{
                                        backgroundColor: processing
                                            ? '#9CA3AF'
                                            : '#C7AB65',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!processing)
                                            e.currentTarget.style.backgroundColor =
                                                '#B89B55';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!processing)
                                            e.currentTarget.style.backgroundColor =
                                                '#C7AB65';
                                    }}
                                >
                                    <Save className="h-4 w-4" />
                                    Salvar
                                </button>
                            </form>

                            {/* Compartilhar */}
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                                    Compartilhar Lista
                                </h3>
                                <button
                                    onClick={copiarLink}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                                >
                                    {copiado ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Link Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="h-4 w-4" />
                                            Copiar Link
                                        </>
                                    )}
                                </button>
                                <p className="mt-2 text-center text-xs text-gray-500">
                                    Qualquer pessoa com o link poderá visualizar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Músicas */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Músicas ({musicas.length})
                                </h2>
                                <button
                                    onClick={() => setModalAberto(true)}
                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
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
                                    <Plus className="h-4 w-4" />
                                    Adicionar
                                </button>
                            </div>

                            {/* Músicas */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={musicas.map((m: Musica) => m.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {musicas.length === 0 ? (
                                            <div className="py-12 text-center text-gray-500">
                                                <p>
                                                    Nenhuma música adicionada
                                                    ainda.
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    Clique em "Adicionar" para
                                                    começar
                                                </p>
                                            </div>
                                        ) : (
                                            musicas.map((musica: Musica) => (
                                                <SortableItem
                                                    key={musica.id}
                                                    musica={musica}
                                                    removerMusica={
                                                        removerMusica
                                                    }
                                                />
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>

                {/* Modal Adicionar Música */}
                {modalAberto && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white">
                            <div className="flex items-center justify-between border-b border-gray-200 p-6">
                                <h3 className="text-xl font-bold">
                                    Adicionar Música
                                </h3>
                                <button
                                    onClick={fecharModal}
                                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="border-b border-gray-200 p-6">
                                <div className="space-y-3">
                                    {/* Busca */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <input
                                            type="text"
                                            value={buscaMusica}
                                            onChange={(e) =>
                                                setBuscaMusica(e.target.value)
                                            }
                                            placeholder="Buscar por número, título, autor ou letra..."
                                            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10"
                                            style={{ borderColor: '#d1d5db' }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor =
                                                    '#C7AB65';
                                                e.currentTarget.style.outline =
                                                    '2px solid #C7AB65';
                                                e.currentTarget.style.outlineOffset =
                                                    '2px';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor =
                                                    '#d1d5db';
                                                e.currentTarget.style.outline =
                                                    'none';
                                            }}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Filtros */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Select
                                            value={temaSelecionado || '__all__'}
                                            onValueChange={(v) =>
                                                setTemaSelecionado(
                                                    v === '__all__' ? '' : v,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Todos os temas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">
                                                    Todos os temas
                                                </SelectItem>
                                                {temas.map((tema: Tema) => (
                                                    <SelectItem
                                                        key={tema.id}
                                                        value={String(tema.id)}
                                                    >
                                                        {tema.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={
                                                autorSelecionado || '__all__'
                                            }
                                            onValueChange={(v) =>
                                                setAutorSelecionado(
                                                    v === '__all__' ? '' : v,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Todos os autores" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">
                                                    Todos os autores
                                                </SelectItem>
                                                {autores.map(
                                                    (autor: string) => (
                                                        <SelectItem
                                                            key={autor}
                                                            value={autor}
                                                        >
                                                            {autor}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Contador de resultados */}
                                    <p className="text-xs text-gray-500">
                                        {musicasFiltradas.length}{' '}
                                        {musicasFiltradas.length === 1
                                            ? 'música encontrada'
                                            : 'músicas encontradas'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-2">
                                    {musicasFiltradas.map((musica: Musica) => {
                                        const jaAdicionada =
                                            musicasNaLista.includes(musica.id);
                                        const estaTocando =
                                            audioMusica?.id === musica.id &&
                                            tocando;

                                        return (
                                            <div
                                                key={musica.id}
                                                role="button"
                                                tabIndex={jaAdicionada ? -1 : 0}
                                                aria-disabled={jaAdicionada}
                                                onClick={() =>
                                                    !jaAdicionada &&
                                                    adicionarMusica(musica)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        !jaAdicionada &&
                                                        e.key === 'Enter'
                                                    ) {
                                                        adicionarMusica(musica);
                                                    }
                                                }}
                                                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                                                    jaAdicionada
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'cursor-pointer hover:bg-[#F5F0E8]'
                                                }`}
                                            >
                                                <div
                                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold"
                                                    style={{
                                                        backgroundColor:
                                                            '#F5F0E8',
                                                        color: '#C7AB65',
                                                    }}
                                                >
                                                    {musica.numero}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900">
                                                        {musica.titulo}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                                        {musica.temas &&
                                                            musica.temas
                                                                .length > 0 && (
                                                                <span className="text-gray-500">
                                                                    {musica.temas
                                                                        .map(
                                                                            (
                                                                                t,
                                                                            ) =>
                                                                                t.nome,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                </span>
                                                            )}
                                                        {musica.autor && (
                                                            <>
                                                                {musica.temas &&
                                                                    musica.temas
                                                                        .length >
                                                                        0 && (
                                                                        <span className="text-gray-400">
                                                                            •
                                                                        </span>
                                                                    )}
                                                                <span className="text-gray-600">
                                                                    {
                                                                        musica.autor
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Botão play (só se tiver áudio) */}
                                                {musica.has_audio && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playMusica(musica);
                                                        }}
                                                        title={
                                                            estaTocando
                                                                ? 'Pausar'
                                                                : 'Ouvir'
                                                        }
                                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                                                            audioMusica?.id ===
                                                            musica.id
                                                                ? 'text-white'
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                        style={
                                                            audioMusica?.id ===
                                                            musica.id
                                                                ? {
                                                                      backgroundColor:
                                                                          '#C7AB65',
                                                                  }
                                                                : {}
                                                        }
                                                    >
                                                        {estaTocando ? (
                                                            <Pause className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Play className="ml-0.5 h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                )}

                                                {jaAdicionada && (
                                                    <span className="text-xs font-medium text-green-600">
                                                        Já adicionada
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mini player (fixo no rodapé do modal) */}
                            {audioMusica && (
                                <div
                                    className="flex-shrink-0 border-t"
                                    style={{ backgroundColor: '#FDFAF4' }}
                                >
                                    <div className="px-5 py-2.5">
                                        <p className="mb-2 truncate text-sm font-medium text-gray-800">
                                            <span
                                                className="mr-1.5 font-bold"
                                                style={{ color: '#C7AB65' }}
                                            >
                                                {audioMusica.numero}
                                            </span>
                                            {audioMusica.titulo}
                                        </p>

                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    playMusica(audioMusica)
                                                }
                                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                                                style={{
                                                    backgroundColor: '#C7AB65',
                                                }}
                                            >
                                                {tocando ? (
                                                    <Pause className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Play className="ml-0.5 h-3.5 w-3.5" />
                                                )}
                                            </button>

                                            <span className="w-9 flex-shrink-0 text-right text-xs text-gray-500 tabular-nums">
                                                {formatarTempo(tempoAtual)}
                                            </span>

                                            <input
                                                type="range"
                                                min={0}
                                                max={duracao || 100}
                                                value={tempoAtual}
                                                onChange={(e) => {
                                                    const t = Number(
                                                        e.target.value,
                                                    );
                                                    setTempoAtual(t);
                                                    if (audioRef.current)
                                                        audioRef.current.currentTime =
                                                            t;
                                                }}
                                                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
                                                style={{
                                                    accentColor: '#C7AB65',
                                                }}
                                            />

                                            <span className="w-9 flex-shrink-0 text-xs text-gray-500 tabular-nums">
                                                {formatarTempo(duracao)}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleVolume(
                                                        volume > 0 ? 0 : 1,
                                                    )
                                                }
                                                className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                                            >
                                                {volume === 0 ? (
                                                    <VolumeX className="h-4 w-4" />
                                                ) : (
                                                    <Volume2 className="h-4 w-4" />
                                                )}
                                            </button>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                value={volume}
                                                onChange={(e) =>
                                                    handleVolume(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="hidden h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-gray-200 sm:block"
                                                style={{
                                                    accentColor: '#C7AB65',
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={fecharPlayer}
                                                className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Elemento de áudio (oculto) */}
                            <audio
                                ref={audioRef}
                                onTimeUpdate={() =>
                                    setTempoAtual(
                                        audioRef.current?.currentTime ?? 0,
                                    )
                                }
                                onLoadedMetadata={() =>
                                    setDuracao(audioRef.current?.duration ?? 0)
                                }
                                onPlay={() => setTocando(true)}
                                onPause={() => setTocando(false)}
                                onEnded={() => {
                                    setTocando(false);
                                    setTempoAtual(0);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
