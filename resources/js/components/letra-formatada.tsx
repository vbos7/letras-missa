import { Minus, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export default function LetraFormatada({
    letra,
    className = '',
    acaoDireita = null,
}: {
    letra?: string;
    className?: string;
    acaoDireita?: ReactNode;
}) {
    const [fontSize, setFontSize] = useState(16);

    const aumentarFonte = () => {
        setFontSize((prev) => Math.min(prev + 2, 32));
    };

    const diminuirFonte = () => {
        setFontSize((prev) => Math.max(prev - 2, 12));
    };

    // Converte marcações simples para HTML
    const formatarLetra = (texto) => {
        if (!texto) return '';

        // **texto** -> negrito
        texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // *texto* -> itálico
        texto = texto.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // __texto__ -> sublinhado
        texto = texto.replace(/__(.*?)__/g, '<u>$1</u>');

        // [Refrão] ou [Intro] -> badge
        texto = texto.replace(
            /\[(.*?)\]/g,
            '<span class="inline-block rounded bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-700 my-1">$1</span>',
        );

        return texto;
    };

    return (
        <div className={className}>
            {/* Controles de Zoom */}
            <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                    Tamanho da letra:
                </span>
                <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white">
                    <button
                        onClick={diminuirFonte}
                        disabled={fontSize <= 12}
                        className="rounded-l-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Diminuir fonte"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm font-medium text-gray-700">
                        {fontSize}px
                    </span>
                    <button
                        onClick={aumentarFonte}
                        disabled={fontSize >= 32}
                        className="rounded-r-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Aumentar fonte"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                {acaoDireita}
            </div>

            {/* Letra Formatada */}
            <div
                className="leading-relaxed whitespace-pre-line text-gray-800"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: formatarLetra(letra) }}
            />
        </div>
    );
}
