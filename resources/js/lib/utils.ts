import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Normaliza um texto para busca: remove acentuação, converte pontuação
 * (vírgulas, pontos, etc.) em espaços e colapsa espaços em branco.
 * Assim "Senhor, que vieste salvar..." e "senhor que vieste salvar"
 * geram a mesma string comparável.
 */
export function normalizarBusca(texto: string): string {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Mn}/gu, '') // remove marcas de acentuação
        .replace(/[^\p{L}\p{N}\s]/gu, ' ') // pontuação vira espaço
        .replace(/\s+/g, ' ') // colapsa espaços
        .trim();
}
