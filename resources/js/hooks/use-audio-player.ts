import { useRef, useState } from 'react';

export interface CreditosAudio {
    artista?: string | null; // intérprete
    compositor?: string | null; // autor da obra
    album?: string | null;
    gravadora?: string | null; // ℗ (selo / detentor do fonograma)
    distribuidora?: string | null; // "Provided to YouTube by"
    dataLancamento?: string | null;
    fonteUrl?: string | null;
    descricao?: string | null; // texto bruto completo (respaldo)
}

export interface FaixaAudio {
    /** Identificador para comparar faixas (ex.: id da música). Cai no src se ausente. */
    id?: number | string;
    numero?: number;
    titulo: string;
    /** URL do arquivo de áudio (ex.: /audio/123.mp3) */
    src: string;
    /** Créditos do áudio (para o dialog de informações). */
    info?: CreditosAudio;
}

/** Formato da relação `audio_info` (tabela audio_infos) vinda do backend. */
export interface AudioInfoRaw {
    artista?: string | null;
    compositor?: string | null;
    album?: string | null;
    gravadora?: string | null;
    distribuidora?: string | null;
    data_lancamento?: string | null;
    fonte_url?: string | null;
    descricao?: string | null;
}

/** Monta os créditos a partir de uma música vinda do backend (relação audio_info). */
export function creditosDeMusica(m: {
    autor?: string | null;
    audio_info?: AudioInfoRaw | null;
}): CreditosAudio {
    const a = m.audio_info;
    return {
        artista: a?.artista ?? null,
        // usa o compositor do crédito do áudio; se ausente, cai no autor da música
        compositor: a?.compositor ?? m.autor ?? null,
        album: a?.album ?? null,
        gravadora: a?.gravadora ?? null,
        distribuidora: a?.distribuidora ?? null,
        dataLancamento: a?.data_lancamento ?? null,
        fonteUrl: a?.fonte_url ?? null,
        descricao: a?.descricao ?? null,
    };
}

/**
 * Estado e controles de um player de áudio único, compartilhado entre as telas.
 * Inclui a correção de mute para iOS: no iOS `audio.volume` é somente-leitura,
 * então o mudo é feito via `audio.muted` (que funciona no iPhone/iPad).
 *
 * Renderize o elemento de áudio com `<audio {...player.audioProps} />` (o
 * componente [[AudioPlayerBar]] já faz isso).
 */
export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [faixa, setFaixa] = useState<FaixaAudio | null>(null);
    const [tocando, setTocando] = useState(false);
    const [tempoAtual, setTempoAtual] = useState(0);
    const [duracao, setDuracao] = useState(0);
    const [volume, setVolume] = useState(1);
    const [mudo, setMudo] = useState(false);

    const chave = (f: FaixaAudio) => f.id ?? f.src;

    /** Toca uma faixa. Se for a mesma que já está no player, alterna play/pause. */
    const tocar = (nova: FaixaAudio) => {
        if (!audioRef.current) return;

        if (faixa && chave(faixa) === chave(nova)) {
            if (tocando) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            return;
        }

        setFaixa(nova);
        setTempoAtual(0);
        setDuracao(0);
        audioRef.current.src = nova.src;
        audioRef.current.play().catch(() => setFaixa(null));
    };

    /** Alterna play/pause da faixa atual. */
    const alternar = () => {
        if (!audioRef.current || !faixa) return;
        if (tocando) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    /** Fecha o player e reseta o estado. */
    const fechar = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setFaixa(null);
        setTocando(false);
        setTempoAtual(0);
        setDuracao(0);
    };

    /** Move o cursor de reprodução (scrubber). */
    const buscar = (t: number) => {
        setTempoAtual(t);
        if (audioRef.current) audioRef.current.currentTime = t;
    };

    /** Define o volume (0..1). No iOS `.volume` é ignorado, mas mantemos o mudo em sincronia. */
    const definirVolume = (v: number) => {
        setVolume(v);
        setMudo(v === 0);
        if (audioRef.current) {
            audioRef.current.volume = v;
            audioRef.current.muted = v === 0;
        }
    };

    /** Alterna mudo via `audio.muted` (funciona no iOS, ao contrário de volume = 0). */
    const alternarMudo = () => {
        const novo = !mudo;
        setMudo(novo);
        if (audioRef.current) audioRef.current.muted = novo;
    };

    const audioProps = {
        ref: audioRef,
        onTimeUpdate: () => setTempoAtual(audioRef.current?.currentTime ?? 0),
        onLoadedMetadata: () => setDuracao(audioRef.current?.duration ?? 0),
        onPlay: () => setTocando(true),
        onPause: () => setTocando(false),
        onEnded: () => {
            setTocando(false);
            setTempoAtual(0);
        },
    };

    /** True se a faixa informada é a que está carregada no player. */
    const eAtual = (f: FaixaAudio) => !!faixa && chave(faixa) === chave(f);

    return {
        faixa,
        tocando,
        tempoAtual,
        duracao,
        volume,
        mudo,
        tocar,
        alternar,
        fechar,
        buscar,
        definirVolume,
        alternarMudo,
        eAtual,
        audioProps,
    };
}

export type AudioPlayer = ReturnType<typeof useAudioPlayer>;

export function formatarTempo(s: number) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}
