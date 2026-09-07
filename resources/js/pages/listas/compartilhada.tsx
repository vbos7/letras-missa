import AppLayout from '@/components/app-layout';
import { AudioPlayerBar } from '@/components/audio-player-bar';
import LetraFormatada from '@/components/letra-formatada';
import {
    creditosDeMusica,
    useAudioPlayer,
    type AudioInfoRaw,
} from '@/hooks/use-audio-player';
import { esc, formatarLetraHtml, imprimirDocumento } from '@/lib/print';
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    MapPin,
    Music2,
    Pause,
    Play,
    Printer,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    letra: string;
    autor?: string | null;
    tom?: string | null;
    tema?: { nome: string } | null;
    pivot?: { observacao?: string | null };
    has_audio?: boolean;
    audio_info?: AudioInfoRaw | null;
}

interface Lista {
    nome: string;
    descricao?: string | null;
    data_missa?: string | null;
    horario_missa?: string | null;
    local?: string | null;
    user: { name: string };
    musicas: Musica[];
}

export default function Compartilhada({ lista }: { lista: Lista }) {
    const [musicaExpandida, setMusicaExpandida] = useState<number | null>(null);

    // Player de áudio (componente compartilhado)
    const player = useAudioPlayer();

    const handlePrintLista = () => {
        const corpo = lista.musicas
            .map((musica: Musica, i: number) => {
                const isLast = i === lista.musicas.length - 1;
                const meta = [
                    musica.autor,
                    musica.tom ? `Tom: ${musica.tom}` : null,
                ]
                    .filter((x): x is string => Boolean(x))
                    .map(esc)
                    .join(' · ');
                const obs = musica.pivot?.observacao
                    ? `<div style="margin-top:14px;padding:10px 12px;border-left:3px solid #C7AB65;background:#fffbf0;font-size:12px"><strong>Obs.:</strong> ${esc(musica.pivot.observacao)}</div>`
                    : '';
                return `<div style="page-break-after:${isLast ? 'avoid' : 'always'}">
  <div style="display:flex;gap:18px;align-items:flex-start;border-bottom:1px solid #ddd;padding-bottom:12px;margin-bottom:22px">
    <span style="font-size:38px;font-weight:bold;color:#ccc;line-height:1;flex-shrink:0">${musica.numero}</span>
    <div>
      <h2 style="margin:0 0 5px">${esc(musica.titulo)}</h2>
      <p style="font-size:13px;color:#555;margin:0">${meta}</p>
    </div>
  </div>
  <div style="font-size:14px;line-height:1.85;white-space:pre-line">${formatarLetraHtml(musica.letra)}</div>
  ${obs}
</div>`;
            })
            .join('\n');

        imprimirDocumento(lista.nome, corpo);
    };

    const toggleMusica = (musicaId: number) => {
        setMusicaExpandida(musicaExpandida === musicaId ? null : musicaId);
    };

    return (
        <AppLayout>
            <div className={`mx-auto max-w-3xl ${player.faixa ? 'pb-28' : ''}`}>
                {/* Header da Lista */}
                <div
                    className="mb-6 rounded-xl p-6 text-white shadow-lg md:p-8"
                    style={{
                        background:
                            'linear-gradient(135deg, #C7AB65 0%, #B89B55 100%)',
                    }}
                >
                    <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                        {lista.nome}
                    </h1>

                    {/* Informações da Missa */}
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                        {lista.data_missa && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date(
                                        lista.data_missa + 'T00:00:00',
                                    ).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}
                        {lista.horario_missa && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{lista.horario_missa}</span>
                            </div>
                        )}
                        {lista.local && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{lista.local}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Lista criada por {lista.user.name}</span>
                        </div>
                    </div>

                    {lista.descricao && (
                        <p className="mt-4 opacity-90">{lista.descricao}</p>
                    )}

                    {/* Total de Músicas + Imprimir */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                            <Music2 className="h-4 w-4" />
                            <span className="font-medium">
                                {lista.musicas.length}{' '}
                                {lista.musicas.length === 1
                                    ? 'música'
                                    : 'músicas'}
                            </span>
                        </div>
                        {lista.musicas.length > 0 && (
                            <button
                                onClick={handlePrintLista}
                                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-medium backdrop-blur-sm transition-all hover:bg-white/30"
                            >
                                <Printer className="h-4 w-4" />
                                Imprimir Lista
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de Músicas */}
                <div className="space-y-3">
                    {lista.musicas.map((musica: Musica) => {
                        const faixa = {
                            id: musica.id,
                            numero: musica.numero,
                            titulo: musica.titulo,
                            src: `/audio/${musica.numero}.mp3`,
                            info: creditosDeMusica(musica),
                        };
                        const noPlayer = player.eAtual(faixa);

                        return (
                            <div
                                key={musica.id}
                                className="overflow-hidden rounded-lg bg-white shadow-sm"
                            >
                                {/* Header da Música */}
                                <button
                                    onClick={() => toggleMusica(musica.id)}
                                    className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                                >
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold"
                                        style={{
                                            backgroundColor: '#F5F0E8',
                                            color: '#C7AB65',
                                        }}
                                    >
                                        {musica.numero}
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <h3 className="mb-1 font-semibold text-gray-900">
                                            {musica.titulo}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {musica.tema && (
                                                <span
                                                    className="rounded-full px-2 py-1"
                                                    style={{
                                                        backgroundColor:
                                                            '#F5F0E8',
                                                        color: '#8B7A45',
                                                    }}
                                                >
                                                    {musica.tema.nome}
                                                </span>
                                            )}
                                            {musica.autor && (
                                                <span className="text-gray-500">
                                                    {musica.autor}
                                                </span>
                                            )}
                                            {musica.tom && (
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-700">
                                                    {musica.tom}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {musicaExpandida === musica.id ? (
                                        <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                    )}
                                </button>

                                {/* Letra da Música (Expansível) */}
                                {musicaExpandida === musica.id && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                                        <LetraFormatada
                                            letra={musica.letra}
                                            acaoDireita={
                                                musica.has_audio ? (
                                                    <button
                                                        onClick={() =>
                                                            player.tocar(faixa)
                                                        }
                                                        title={
                                                            noPlayer &&
                                                            player.tocando
                                                                ? 'Pausar'
                                                                : 'Ouvir'
                                                        }
                                                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                                            noPlayer
                                                                ? 'border-transparent text-white'
                                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
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
                                                        {noPlayer &&
                                                        player.tocando ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                        Ouvir
                                                    </button>
                                                ) : null
                                            }
                                        />
                                        {musica.pivot?.observacao && (
                                            <div className="mt-4 rounded border-l-4 border-yellow-400 bg-yellow-50 p-3">
                                                <p className="text-sm text-yellow-800">
                                                    <strong>Observação:</strong>{' '}
                                                    {musica.pivot.observacao}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Mensagem se não houver músicas */}
                {lista.musicas.length === 0 && (
                    <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                        <Music2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <p className="text-gray-600">
                            Esta lista ainda não possui músicas.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="mb-4 text-sm text-gray-500">
                        Gostou? Crie sua própria lista de músicas!
                    </p>
                    <a
                        href="/register"
                        className="inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
                        style={{ backgroundColor: '#C7AB65' }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#B89B55')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = '#C7AB65')
                        }
                    >
                        Criar Minha Lista
                    </a>
                </div>
            </div>

            {/* Player fixo no rodapé (componente compartilhado) */}
            <AudioPlayerBar player={player} variant="fixed" />
        </AppLayout>
    );
}
