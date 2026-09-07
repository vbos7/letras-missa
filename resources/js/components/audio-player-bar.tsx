import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatarTempo, type AudioPlayer } from '@/hooks/use-audio-player';
import {
    ExternalLink,
    Info,
    Pause,
    Play,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    player: AudioPlayer;
    /**
     * "fixed": barra fixa no rodapé da página (páginas públicas).
     * "inline": barra no fluxo do conteúdo (rodapé de modal/dialog).
     */
    variant?: 'fixed' | 'inline';
}

/**
 * Barra de player reutilizável. Renderiza sempre o elemento <audio> (para manter
 * a reprodução) e mostra a barra de controles quando há uma faixa carregada.
 */
export function AudioPlayerBar({ player, variant = 'fixed' }: Props) {
    const {
        faixa,
        tocando,
        tempoAtual,
        duracao,
        volume,
        mudo,
        alternar,
        fechar,
        buscar,
        definirVolume,
        alternarMudo,
        audioProps,
    } = player;

    const [infoAberto, setInfoAberto] = useState(false);
    const [volumeAberto, setVolumeAberto] = useState(false);

    const containerClass =
        variant === 'fixed'
            ? 'fixed inset-x-0 bottom-0 z-50 border-t shadow-[0_-2px_16px_rgba(0,0,0,0.10)]'
            : 'flex-shrink-0 border-t';

    const innerClass =
        variant === 'fixed' ? 'mx-auto max-w-3xl px-4 py-3.5' : 'px-5 py-3.5';

    const info = faixa?.info;
    const IconeVolume = mudo || volume === 0 ? VolumeX : Volume2;

    return (
        <>
            {faixa && (
                <div
                    className={containerClass}
                    style={{ backgroundColor: '#FDFAF4' }}
                >
                    <div className={innerClass}>
                        {/* Info da música */}
                        <div className="mb-2.5 flex items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-base font-semibold text-gray-800">
                                {faixa.numero != null && (
                                    <span
                                        className="mr-1.5 font-bold"
                                        style={{ color: '#C7AB65' }}
                                    >
                                        {faixa.numero}
                                    </span>
                                )}
                                {faixa.titulo}
                            </p>
                            {/* Botão de informações/créditos */}
                            <button
                                type="button"
                                onClick={() => setInfoAberto(true)}
                                title="Informações e créditos do áudio"
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-black/5 hover:text-gray-700"
                            >
                                <Info className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Play / Pause */}
                            <button
                                type="button"
                                onClick={alternar}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                                style={{ backgroundColor: '#C7AB65' }}
                            >
                                {tocando ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="ml-0.5 h-5 w-5" />
                                )}
                            </button>

                            {/* Tempo atual */}
                            <span className="w-9 flex-shrink-0 text-right text-xs text-gray-500 tabular-nums">
                                {formatarTempo(tempoAtual)}
                            </span>

                            {/* Scrubber */}
                            <input
                                type="range"
                                min={0}
                                max={duracao || 100}
                                value={tempoAtual}
                                onChange={(e) => buscar(Number(e.target.value))}
                                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
                                style={{ accentColor: '#C7AB65' }}
                            />

                            {/* Duração */}
                            <span className="w-9 flex-shrink-0 text-xs text-gray-500 tabular-nums">
                                {formatarTempo(duracao)}
                            </span>

                            {/* Volume — desktop: mute + slider horizontal */}
                            <div className="hidden items-center gap-2 sm:flex">
                                <button
                                    type="button"
                                    onClick={alternarMudo}
                                    title={mudo ? 'Ativar som' : 'Mutar'}
                                    className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                                >
                                    <IconeVolume className="h-5 w-5" />
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={mudo ? 0 : volume}
                                    onChange={(e) =>
                                        definirVolume(Number(e.target.value))
                                    }
                                    className="h-2 w-16 cursor-pointer appearance-none rounded-full bg-gray-200"
                                    style={{ accentColor: '#C7AB65' }}
                                />
                            </div>

                            {/* Volume — mobile: botão abre slider vertical */}
                            <div className="relative flex-shrink-0 sm:hidden">
                                <button
                                    type="button"
                                    onClick={() => setVolumeAberto((v) => !v)}
                                    title="Volume"
                                    className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
                                >
                                    <IconeVolume className="h-5 w-5" />
                                </button>

                                {volumeAberto && (
                                    <>
                                        {/* Fecha ao tocar fora */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setVolumeAberto(false)
                                            }
                                        />
                                        <div
                                            className="absolute bottom-11 left-1/2 z-50 -translate-x-1/2 rounded-xl border bg-white p-3 shadow-lg"
                                            style={{
                                                backgroundColor: '#FDFAF4',
                                            }}
                                        >
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                value={mudo ? 0 : volume}
                                                onChange={(e) =>
                                                    definirVolume(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-32 cursor-pointer"
                                                style={{
                                                    accentColor: '#C7AB65',
                                                    writingMode: 'vertical-lr',
                                                    direction: 'rtl',
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Fechar */}
                            <button
                                type="button"
                                onClick={fechar}
                                className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog de informações / créditos */}
            <Dialog open={infoAberto} onOpenChange={setInfoAberto}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Informações do áudio</DialogTitle>
                    </DialogHeader>

                    {faixa && (
                        <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm">
                            <LinhaCredito
                                rotulo="Música"
                                valor={faixa.titulo}
                            />
                            <LinhaCredito
                                rotulo="Artista"
                                valor={info?.artista}
                            />
                            <LinhaCredito
                                rotulo="Compositor"
                                valor={info?.compositor}
                            />
                            <LinhaCredito rotulo="Álbum" valor={info?.album} />
                            <LinhaCredito
                                rotulo="Gravadora (℗)"
                                valor={info?.gravadora}
                            />
                            <LinhaCredito
                                rotulo="Distribuidora"
                                valor={info?.distribuidora}
                            />
                            <LinhaCredito
                                rotulo="Lançamento"
                                valor={info?.dataLancamento}
                            />

                            {info?.descricao && (
                                <div className="border-t pt-3">
                                    <p className="text-xs font-medium text-gray-500">
                                        Descrição / créditos completos
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-gray-800">
                                        {info.descricao}
                                    </p>
                                </div>
                            )}

                            {info?.fonteUrl && (
                                <a
                                    href={info.fonteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: '#C7AB65' }}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Ver fonte original
                                </a>
                            )}

                            {!info?.artista &&
                                !info?.compositor &&
                                !info?.album &&
                                !info?.gravadora &&
                                !info?.distribuidora &&
                                !info?.dataLancamento &&
                                !info?.descricao &&
                                !info?.fonteUrl && (
                                    <p className="text-gray-500">
                                        Nenhuma informação de créditos
                                        cadastrada para este áudio.
                                    </p>
                                )}

                            <p className="border-t pt-3 text-xs text-gray-400">
                                Os créditos são exibidos para fins informativos.
                                Todos os direitos pertencem aos seus respectivos
                                autores, intérpretes, gravadoras e
                                distribuidoras.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Elemento de áudio (oculto) — sempre montado */}
            <audio {...audioProps} />
        </>
    );
}

function LinhaCredito({
    rotulo,
    valor,
}: {
    rotulo: string;
    valor?: string | null;
}) {
    if (!valor) return null;
    return (
        <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-xs font-medium text-gray-500">
                {rotulo}
            </span>
            <span className="text-gray-800">{valor}</span>
        </div>
    );
}
