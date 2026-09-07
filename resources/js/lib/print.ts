/** Escapa caracteres especiais de HTML. */
export function esc(s: string): string {
    return (s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Converte a marcação simples da letra (**negrito**, *itálico*, __sublinhado__,
 * [Refrão]) em HTML seguro para impressão.
 */
export function formatarLetraHtml(texto: string): string {
    if (!texto) return '';
    return esc(texto)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\[(.*?)]/g, '<span class="badge">$1</span>');
}

/**
 * Abre uma nova janela com o documento HTML montado e dispara a impressão.
 * `corpoHtml` é o conteúdo do <body> (use [[esc]] / [[formatarLetraHtml]] ao montar).
 */
export function imprimirDocumento(titulo: string, corpoHtml: string): void {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${esc(titulo)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, serif; margin: 0; padding: 2cm; color: #000; line-height: 1.7; }
  .header { display: flex; gap: 20px; align-items: flex-start; border-bottom: 1px solid #ddd; padding-bottom: 14px; margin-bottom: 24px; }
  .numero { font-size: 42px; font-weight: bold; color: #ccc; line-height: 1; flex-shrink: 0; }
  h1 { font-size: 24px; font-weight: bold; margin: 0 0 6px; }
  h2 { font-size: 21px; font-weight: bold; margin: 0 0 5px; }
  .meta { font-size: 13px; color: #555; }
  .letra { font-size: 14px; line-height: 1.85; white-space: pre-line; }
  .badge { display: inline-block; border: 1px solid #aaa; border-radius: 4px; padding: 0 5px; font-size: 12px; font-weight: 600; margin: 2px 0; }
  @page { margin: 2cm; size: A4; }
</style>
</head>
<body>
${corpoHtml}
<script>window.addEventListener('load',()=>{window.print();});</script>
</body>
</html>`);
    win.document.close();
}
