import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useRef, useState, useMemo } from 'react';

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

function normalizar(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

function formatarTempo(s: number) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    autor?: string;
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

    // Player de áudio
    const audioRef = useRef<HTMLAudioElement>(null);
    const [audioMusica, setAudioMusica] = useState<Musica | null>(null);
    const [tocando, setTocando] = useState(false);
    const [tempoAtual, setTempoAtual] = useState(0);
    const [duracao, setDuracao] = useState(0);
    const [volume, setVolume] = useState(1);

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

    // --- Player ---
    const playMusica = (musica: Musica) => {
        if (!audioRef.current) return;

        if (audioMusica?.id === musica.id) {
            // Mesma música: toggle
            tocando ? audioRef.current.pause() : audioRef.current.play();
        } else {
            // Nova música
            setAudioMusica(musica);
            setTempoAtual(0);
            setDuracao(0);
            audioRef.current.src = `/audio/${musica.id}.mp3`;
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

    // --- Navegação entre passos ---
    const trocarPasso = (delta: number) => {
        fecharPlayer();
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
        fecharPlayer();
        setPasso(0);
        setNome('');
        setSelecoes(Object.fromEntries(MOMENTOS_MISSA.map((_, i) => [i, null])));
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
                                    <Sparkles className="h-6 w-6" style={{ color: '#C7AB65' }} />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        Vamos começar!
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Dê um nome para sua lista e depois escolha
                                        as músicas de cada momento da missa.
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
                                    e.key === 'Enter' && nome.trim() && avancar()
                                }
                                placeholder="Ex: Missa do Domingo"
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-shadow focus:ring-2"
                                style={{ '--tw-ring-color': '#C7AB65' } as React.CSSProperties}
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

                            {temaDoMomento && temaDoMomento.musicas.length > 0 ? (
                                <>
                                    {/* Busca */}
                                    <div className="relative mb-3">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={busca}
                                            onChange={(e) => setBusca(e.target.value)}
                                            placeholder="Buscar música..."
                                            className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm outline-none focus:ring-2"
                                            style={{ '--tw-ring-color': '#C7AB65' } as React.CSSProperties}
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
                                                const selecionada = selecoes[passo - 1] === musica.id;
                                                const estaToando = audioMusica?.id === musica.id && tocando;

                                                return (
                                                    <div
                                                        key={musica.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => selecionarMusica(musica.id)}
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' && selecionarMusica(musica.id)
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
                                                                selecionada ? 'text-white' : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                            style={selecionada ? { backgroundColor: '#C7AB65' } : {}}
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
                                                                    {musica.autor}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Botão play */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playMusica(musica);
                                                            }}
                                                            title={estaToando ? 'Pausar' : 'Ouvir prévia'}
                                                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                                                                audioMusica?.id === musica.id
                                                                    ? 'text-white'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                            style={
                                                                audioMusica?.id === musica.id
                                                                    ? { backgroundColor: '#C7AB65' }
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
                                        Nenhuma música cadastrada para este momento
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

                {/* Mini player */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        audioMusica ? 'max-h-28 border-t' : 'max-h-0'
                    }`}
                    style={{ backgroundColor: '#FDFAF4' }}
                >
                    <div className="px-5 py-2.5">
                        {/* Info da música */}
                        <p className="mb-2 truncate text-sm font-medium text-gray-800">
                            {audioMusica?.numero && (
                                <span className="mr-1.5 font-bold" style={{ color: '#C7AB65' }}>
                                    {audioMusica.numero}
                                </span>
                            )}
                            {audioMusica?.titulo}
                        </p>

                        {/* Controles */}
                        <div className="flex items-center gap-2.5">
                            {/* Play / Pause */}
                            <button
                                onClick={() => audioMusica && playMusica(audioMusica)}
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                                style={{ backgroundColor: '#C7AB65' }}
                            >
                                {tocando ? (
                                    <Pause className="h-3.5 w-3.5" />
                                ) : (
                                    <Play className="ml-0.5 h-3.5 w-3.5" />
                                )}
                            </button>

                            {/* Tempo atual */}
                            <span className="w-8 flex-shrink-0 text-right text-xs tabular-nums text-gray-500">
                                {formatarTempo(tempoAtual)}
                            </span>

                            {/* Scrubber */}
                            <input
                                type="range"
                                min={0}
                                max={duracao || 100}
                                value={tempoAtual}
                                onChange={(e) => {
                                    const t = Number(e.target.value);
                                    setTempoAtual(t);
                                    if (audioRef.current) audioRef.current.currentTime = t;
                                }}
                                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
                                style={{ accentColor: '#C7AB65' }}
                            />

                            {/* Duração */}
                            <span className="w-8 flex-shrink-0 text-xs tabular-nums text-gray-500">
                                {formatarTempo(duracao)}
                            </span>

                            {/* Volume */}
                            <button
                                onClick={() => handleVolume(volume > 0 ? 0 : 1)}
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
                                onChange={(e) => handleVolume(Number(e.target.value))}
                                className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-gray-200"
                                style={{ accentColor: '#C7AB65' }}
                            />

                            {/* Fechar player */}
                            <button
                                onClick={fecharPlayer}
                                className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

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
                                {totalSelecionadas === 1 ? 'música' : 'músicas'}
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
                                (e.currentTarget.style.backgroundColor = '#B89B55')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = '#C7AB65')
                            }
                        >
                            {isUltimoPasso ? (
                                enviando ? 'Criando...' : 'Concluir'
                            ) : (
                                <>
                                    Próximo
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                </div>{/* fim da área inferior */}

                {/* Elemento de áudio (oculto) */}
                <audio
                    ref={audioRef}
                    onTimeUpdate={() => setTempoAtual(audioRef.current?.currentTime ?? 0)}
                    onLoadedMetadata={() => setDuracao(audioRef.current?.duration ?? 0)}
                    onPlay={() => setTocando(true)}
                    onPause={() => setTocando(false)}
                    onEnded={() => { setTocando(false); setTempoAtual(0); }}
                />
            </DialogContent>
        </Dialog>
    );
}
