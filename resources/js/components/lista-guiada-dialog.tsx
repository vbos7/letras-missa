import { AudioPlayerBar } from '@/components/audio-player-bar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    creditosDeMusica,
    useAudioPlayer,
    type AudioInfoRaw,
} from '@/hooks/use-audio-player';
import { normalizarBusca } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Music2,
    Pause,
    Play,
    Search,
    SkipForward,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const MOMENTOS_MISSA: { label: string; temaNome: string }[] = [
    { label: 'Entrada', temaNome: 'Entrada' },
    { label: 'Ato Penitencial', temaNome: 'Ato Penitencial' },
    { label: 'Glória', temaNome: 'Hino de Louvor' },
    { label: 'Aclamação ao Evangelho', temaNome: 'Aclamação ao Evangelho' },
    { label: 'Ofertório', temaNome: 'Ofertório' },
    { label: 'Santo', temaNome: 'Santo' },
    { label: 'Cordeiro', temaNome: 'Cordeiro' },
    { label: 'Comunhão', temaNome: 'Comunhão' },
    { label: 'Ação de Graças', temaNome: 'Ação de Graças' },
    { label: 'Final', temaNome: 'Final' },
];

const TOTAL_PASSOS = MOMENTOS_MISSA.length + 1;

const normalizar = normalizarBusca;

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    autor?: string;
    audio_info?: AudioInfoRaw | null;
}

interface Tema {
    id: number;
    nome: string;
    ordem: number;
    musicas: Musica[];
}

interface Props {
    aberto: boolean;
    onFechar: () => void;
    temas: Tema[];
}

export function ListaGuiadaDialog({ aberto, onFechar, temas }: Props) {
    // Navegação
    const [passo, setPasso] = useState(0);
    const [nome, setNome] = useState('');
    const [selecoes, setSelecoes] = useState<Record<number, number | null>>(
        Object.fromEntries(MOMENTOS_MISSA.map((_, i) => [i, null])),
    );
    const [busca, setBusca] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Player de áudio (componente compartilhado)
    const player = useAudioPlayer();

    const faixaDe = (musica: Musica) => ({
        id: musica.id,
        numero: musica.numero,
        titulo: musica.titulo,
        src: `/audio/${musica.numero}.mp3`,
        info: creditosDeMusica(musica),
    });

    const momentoAtual = passo > 0 ? MOMENTOS_MISSA[passo - 1] : null;

    const temaDoMomento = useMemo(() => {
        if (!momentoAtual) return null;
        const norm = normalizar(momentoAtual.temaNome);
        return temas.find((t) => normalizar(t.nome) === norm) ?? null;
    }, [momentoAtual, temas]);

    const musicasDoPasso = useMemo(() => {
        const lista = temaDoMomento?.musicas ?? [];
        if (!busca.trim()) return lista;
        const buscaNorm = normalizar(busca);
        return lista.filter(
            (m) =>
                normalizar(m.titulo).includes(buscaNorm) ||
                m.numero.toString().includes(buscaNorm) ||
                normalizar(m.autor ?? '').includes(buscaNorm),
        );
    }, [temaDoMomento, busca]);

    // --- Seleção de música ---
    const selecionarMusica = (id: number) => {
        const idx = passo - 1;
        setSelecoes((prev) => ({
            ...prev,
            [idx]: prev[idx] === id ? null : id,
        }));
    };

    // --- Navegação entre passos ---
    const trocarPasso = (delta: number) => {
        player.fechar();
        setBusca('');
        setPasso((p) => p + delta);
    };

    const avancar = () => {
        if (passo < TOTAL_PASSOS - 1) {
            trocarPasso(1);
        } else {
            concluir();
        }
    };

    const concluir = () => {
        if (!nome.trim() || enviando) return;
        const musicasIds = MOMENTOS_MISSA.map((_m, i) => selecoes[i]).filter(
            (id): id is number => id !== null,
        );
        setEnviando(true);
        router.post(
            '/listas/guiada',
            { nome: nome.trim(), musicas: musicasIds },
            { onFinish: () => setEnviando(false) },
        );
    };

    const fechar = () => {
        if (enviando) return;
        player.fechar();
        setPasso(0);
        setNome('');
        setSelecoes(
            Object.fromEntries(MOMENTOS_MISSA.map((_, i) => [i, null])),
        );
        setBusca('');
        onFechar();
    };

    const isUltimoPasso = passo === TOTAL_PASSOS - 1;
    const podeAvancar = passo === 0 ? nome.trim().length > 0 : true;
    const totalSelecionadas = Object.values(selecoes).filter(Boolean).length;

    return (
        <Dialog open={aberto} onOpenChange={(open) => !open && fechar()}>
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
                {/* Header */}
                <DialogHeader className="border-b px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <DialogTitle className="text-xl font-bold">
                            Lista Guiada
                        </DialogTitle>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            {passo + 1} / {TOTAL_PASSOS}
                        </span>
                    </div>
                    {/* Barra de progresso */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                                width: `${((passo + 1) / TOTAL_PASSOS) * 100}%`,
                                backgroundColor: '#C7AB65',
                            }}
                        />
                    </div>
                </DialogHeader>

                {/* Conteúdo (rolável) */}
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    {passo === 0 ? (
                        <div>
                            <div className="mb-6 flex items-center gap-3">
                                <div
                                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                                    style={{ backgroundColor: '#F5F0E8' }}
                                >
                                    <Sparkles
                                        className="h-6 w-6"
                                        style={{ color: '#C7AB65' }}
                                    />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Vamos começar!
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Dê um nome para sua lista e depois
                                        escolha as músicas de cada momento da
                                        missa.
                                    </p>
                                </div>
                            </div>
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                Nome da lista
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    nome.trim() &&
                                    avancar()
                                }
                                placeholder="Ex: Missa do Domingo"
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-shadow outline-none focus:ring-2"
                                style={
                                    {
                                        '--tw-ring-color': '#C7AB65',
                                    } as React.CSSProperties
                                }
                            />
                        </div>
                    ) : (
                        <div>
                            {/* Cabeçalho do momento */}
                            <div className="mb-4 flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                    style={{ backgroundColor: '#C7AB65' }}
                                >
                                    {passo}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {momentoAtual!.label}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {temaDoMomento
                                            ? 'Selecione uma música para este momento'
                                            : 'Nenhuma música cadastrada para este momento'}
                                    </p>
                                </div>
                                {selecoes[passo - 1] !== null && (
                                    <span
                                        className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                                        style={{ backgroundColor: '#C7AB65' }}
                                    >
                                        <Check className="h-3 w-3" />
                                        Selecionada
                                    </span>
                                )}
                            </div>

                            {temaDoMomento &&
                            temaDoMomento.musicas.length > 0 ? (
                                <>
                                    {/* Busca */}
                                    <div className="relative mb-3">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={busca}
                                            onChange={(e) =>
                                                setBusca(e.target.value)
                                            }
                                            placeholder="Buscar música..."
                                            className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm outline-none focus:ring-2"
                                            style={
                                                {
                                                    '--tw-ring-color':
                                                        '#C7AB65',
                                                } as React.CSSProperties
                                            }
                                        />
                                    </div>

                                    {/* Lista de músicas */}
                                    <div className="space-y-2">
                                        {musicasDoPasso.length === 0 ? (
                                            <p className="py-10 text-center text-sm text-gray-400">
                                                Nenhuma música encontrada
                                            </p>
                                        ) : (
                                            musicasDoPasso.map((musica) => {
                                                const selecionada =
                                                    selecoes[passo - 1] ===
                                                    musica.id;
                                                const faixa = faixaDe(musica);
                                                const noPlayer =
                                                    player.eAtual(faixa);
                                                const estaToando =
                                                    noPlayer && player.tocando;

                                                return (
                                                    <div
                                                        key={musica.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() =>
                                                            selecionarMusica(
                                                                musica.id,
                                                            )
                                                        }
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' &&
                                                            selecionarMusica(
                                                                musica.id,
                                                            )
                                                        }
                                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                                                            selecionada
                                                                ? 'border-[#C7AB65] bg-[#F5F0E8]'
                                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {/* Badge número / check */}
                                                        <span
                                                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-sm font-bold ${
                                                                selecionada
                                                                    ? 'text-white'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                            style={
                                                                selecionada
                                                                    ? {
                                                                          backgroundColor:
                                                                              '#C7AB65',
                                                                      }
                                                                    : {}
                                                            }
                                                        >
                                                            {selecionada ? (
                                                                <Check className="h-4 w-4" />
                                                            ) : (
                                                                musica.numero
                                                            )}
                                                        </span>

                                                        {/* Título + autor */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium text-gray-900">
                                                                {musica.titulo}
                                                            </p>
                                                            {musica.autor && (
                                                                <p className="truncate text-xs text-gray-500">
                                                                    {
                                                                        musica.autor
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Botão play */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                player.tocar(
                                                                    faixa,
                                                                );
                                                            }}
                                                            title={
                                                                estaToando
                                                                    ? 'Pausar'
                                                                    : 'Ouvir prévia'
                                                            }
                                                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                                                                noPlayer
                                                                    ? 'text-white'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                            style={
                                                                noPlayer
                                                                    ? {
                                                                          backgroundColor:
                                                                              '#C7AB65',
                                                                      }
                                                                    : {}
                                                            }
                                                        >
                                                            {estaToando ? (
                                                                <Pause className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <Play className="ml-0.5 h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-lg border border-dashed border-gray-200 py-14 text-center">
                                    <Music2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                                    <p className="text-sm text-gray-400">
                                        Nenhuma música cadastrada para este
                                        momento
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Você pode pular e adicionar depois
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Área inferior: player + footer — nunca rola, sempre ancorada no fundo */}
                <div className="flex-shrink-0">
                    {/* Mini player (componente compartilhado) */}
                    <AudioPlayerBar player={player} variant="inline" />

                    {/* Rodapé */}
                    <div className="flex items-center justify-between border-t px-6 py-4">
                        <button
                            onClick={() => trocarPasso(-1)}
                            disabled={passo === 0}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </button>

                        <div className="flex items-center gap-2">
                            {totalSelecionadas > 0 && (
                                <span className="text-xs text-gray-400">
                                    {totalSelecionadas}{' '}
                                    {totalSelecionadas === 1
                                        ? 'música'
                                        : 'músicas'}
                                </span>
                            )}

                            {passo > 0 && !isUltimoPasso && (
                                <button
                                    onClick={() => trocarPasso(1)}
                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100"
                                >
                                    <SkipForward className="h-4 w-4" />
                                    Pular
                                </button>
                            )}

                            <button
                                onClick={isUltimoPasso ? concluir : avancar}
                                disabled={!podeAvancar || enviando}
                                className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
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
                                {isUltimoPasso ? (
                                    enviando ? (
                                        'Criando...'
                                    ) : (
                                        'Concluir'
                                    )
                                ) : (
                                    <>
                                        Próximo
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {/* fim da área inferior */}
            </DialogContent>
        </Dialog>
    );
}
