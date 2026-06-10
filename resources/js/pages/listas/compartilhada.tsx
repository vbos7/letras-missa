import AppLayout from '@/components/app-layout';
import LetraFormatada from '@/components/letra-formatada';
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    MapPin,
    Music2,
    Printer,
    User,
} from 'lucide-react';
import { useState } from 'react';

function esc(s: string) {
    return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatarLetraHtml(texto: string) {
    if (!texto) return '';
    return esc(texto)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\[(.*?)\]/g, '<span class="badge">$1</span>');
}

export default function Compartilhada({ lista }) {
    const [musicaExpandida, setMusicaExpandida] = useState(null);

    const handlePrintLista = () => {
        const win = window.open('', '_blank');
        if (!win) return;

        const musicasHtml = lista.musicas.map((musica, i) => {
            const isLast = i === lista.musicas.length - 1;
            const meta = [musica.autor, musica.tom ? `Tom: ${musica.tom}` : null]
                .filter(Boolean).map(esc).join(' · ');
            const obs = musica.pivot?.observacao
                ? `<div style="margin-top:14px;padding:10px 12px;border-left:3px solid #C7AB65;background:#fffbf0;font-size:12px"><strong>Obs.:</strong> ${esc(musica.pivot.observacao)}</div>`
                : '';
            return `<div style="page-break-after:${isLast ? 'avoid' : 'always'}">
  <div style="display:flex;gap:18px;align-items:flex-start;border-bottom:1px solid #ddd;padding-bottom:12px;margin-bottom:22px">
    <span style="font-size:38px;font-weight:bold;color:#ccc;line-height:1;flex-shrink:0">${musica.numero}</span>
    <div>
      <h2 style="font-size:21px;font-weight:bold;margin:0 0 5px">${esc(musica.titulo)}</h2>
      <p style="font-size:13px;color:#555;margin:0">${meta}</p>
    </div>
  </div>
  <div style="font-size:14px;line-height:1.85;white-space:pre-line">${formatarLetraHtml(musica.letra)}</div>
  ${obs}
</div>`;
        }).join('\n');

        win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${esc(lista.nome)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, serif; margin: 0; padding: 2cm; color: #000; line-height: 1.7; }
  .badge { display: inline-block; border: 1px solid #aaa; border-radius: 4px; padding: 0 5px; font-size: 12px; font-weight: 600; margin: 2px 0; }
  @page { margin: 2cm; size: A4; }
</style>
</head>
<body>
${musicasHtml}
<script>window.addEventListener('load',()=>{window.print();});<\/script>
</body>
</html>`);
        win.document.close();
    };

    const toggleMusica = (musicaId) => {
        setMusicaExpandida(musicaExpandida === musicaId ? null : musicaId);
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-3xl">
                {/* Header da Lista */}
                <div className="mb-6 rounded-xl p-6 text-white shadow-lg md:p-8" style={{ background: 'linear-gradient(135deg, #C7AB65 0%, #B89B55 100%)' }}>
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
                            <span>Criado por {lista.user.name}</span>
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
                                {lista.musicas.length === 1 ? 'música' : 'músicas'}
                            </span>
                        </div>
                        {lista.musicas.length > 0 && (
                            <button
                                onClick={handlePrintLista}
                                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm font-medium transition-all hover:bg-white/30"
                            >
                                <Printer className="h-4 w-4" />
                                Imprimir Lista
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de Músicas */}
                <div className="space-y-3">
                    {lista.musicas.map((musica, index) => (
                        <div
                            key={musica.id}
                            className="overflow-hidden rounded-lg bg-white shadow-sm"
                        >
                            {/* Header da Música */}
                            <button
                                onClick={() => toggleMusica(musica.id)}
                                className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold" style={{ backgroundColor: '#F5F0E8', color: '#C7AB65' }}>
                                    {musica.numero}
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                    <h3 className="mb-1 font-semibold text-gray-900">
                                        {musica.titulo}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {musica.tema && (
                                            <span className="rounded-full px-2 py-1" style={{ backgroundColor: '#F5F0E8', color: '#8B7A45' }}>
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
                                    <LetraFormatada letra={musica.letra} />
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
                    ))}
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                    >
                        Criar Minha Lista
                    </a>
                </div>
            </div>

        </AppLayout>
    );
}
