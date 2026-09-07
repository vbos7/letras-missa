import { Code2, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
    id?: string;
}

function markdownToHtml(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function serializeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(serializeNode).join('');

    if (tag === 'strong' || tag === 'b')
        return children
            .split('\n')
            .map((line) => (line ? `**${line}**` : ''))
            .join('\n');
    if (tag === 'em' || tag === 'i')
        return children
            .split('\n')
            .map((line) => (line ? `*${line}*` : ''))
            .join('\n');
    if (tag === 'br') return '\n';
    if (tag === 'div' || tag === 'p') return '\n' + children;
    return children;
}

function htmlToMarkdown(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return Array.from(doc.body.childNodes).map(serializeNode).join('');
}

function autoFormatVersos(markdown: string): string {
    return markdown
        .split('\n')
        .map((line) => {
            if (/^\*\*\d+\.\*\*/.test(line)) return line;
            return line.replace(/^(\d+\.)\s/, '**$1** ');
        })
        .join('\n');
}

export default function LetraEditor({
    value,
    onChange,
    placeholder = 'Digite a letra da música...',
    rows = 15,
    error,
    id,
}: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    // Initialized to '' so the first useEffect always populates the div
    const lastMarkdown = useRef<string>('');
    const [sourceMode, setSourceMode] = useState(false);

    useEffect(() => {
        if (sourceMode) return; // Don't touch contenteditable while in source mode
        const el = editorRef.current;
        if (!el) return;
        if (value === lastMarkdown.current) return;
        el.innerHTML = markdownToHtml(value);
        lastMarkdown.current = value;
    }, [value, sourceMode]);

    const toggleSourceMode = () => {
        if (sourceMode) {
            // Switching back to visual: force contenteditable to re-render from value
            lastMarkdown.current = '';
        }
        setSourceMode((prev) => !prev);
    };

    const applyCommand = (command: string) => {
        editorRef.current?.focus();
        document.execCommand(command);
        const md = htmlToMarkdown(editorRef.current?.innerHTML ?? '');
        lastMarkdown.current = md;
        onChange(md);
    };

    const handleBoldMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        applyCommand('bold');
    };

    const handleItalicMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        applyCommand('italic');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                applyCommand('bold');
                return;
            }
            if (e.key === 'i') {
                e.preventDefault();
                applyCommand('italic');
                return;
            }
        }
        // Insert <br> on Enter instead of <div> or <p>
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertLineBreak');
        }
    };

    const handleInput = () => {
        const el = editorRef.current;
        if (!el) return;
        const md = htmlToMarkdown(el.innerHTML);
        lastMarkdown.current = md;
        onChange(md);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const handleBlur = () => {
        const el = editorRef.current;
        if (!el) return;
        const md = htmlToMarkdown(el.innerHTML);
        const formatted = autoFormatVersos(md);
        if (formatted !== md) {
            el.innerHTML = markdownToHtml(formatted);
            lastMarkdown.current = formatted;
            onChange(formatted);
        }
    };

    return (
        <div className="space-y-0">
            <div className="flex items-center gap-1 rounded-t-md border border-b-0 border-input bg-muted/50 px-2 py-1.5">
                <button
                    type="button"
                    onMouseDown={handleBoldMouseDown}
                    title="Negrito (Ctrl+B)"
                    disabled={sourceMode}
                    className="rounded px-2 py-0.5 text-sm font-bold transition-colors select-none hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                    N
                </button>
                <button
                    type="button"
                    onMouseDown={handleItalicMouseDown}
                    title="Itálico (Ctrl+I)"
                    disabled={sourceMode}
                    className="rounded px-2 py-0.5 text-sm italic transition-colors select-none hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                    I
                </button>
                <div className="ml-2 h-4 w-px bg-border" />
                <span className="ml-2 text-xs text-muted-foreground">
                    {sourceMode
                        ? 'Modo código — edite o markdown diretamente'
                        : 'Selecione e clique • Ctrl+B / Ctrl+I • "1. " vira negrito ao sair do campo'}
                </span>
                <button
                    type="button"
                    onClick={toggleSourceMode}
                    title={
                        sourceMode ? 'Visualização (Ctrl+Alt+V)' : 'Ver código'
                    }
                    className={`ml-auto rounded p-1 transition-colors hover:bg-accent ${sourceMode ? 'bg-accent text-primary' : 'text-muted-foreground'}`}
                >
                    {sourceMode ? (
                        <Eye className="h-4 w-4" />
                    ) : (
                        <Code2 className="h-4 w-4" />
                    )}
                </button>
            </div>

            {sourceMode ? (
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => {
                        lastMarkdown.current = e.target.value;
                        onChange(e.target.value);
                    }}
                    placeholder={placeholder}
                    className={`w-full resize-none rounded-b-md border border-input bg-transparent px-3 py-2 font-mono text-sm leading-relaxed shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none ${error ? 'border-destructive' : ''}`}
                    style={{ minHeight: `${rows * 1.5}rem` }}
                />
            ) : (
                <div
                    ref={editorRef}
                    id={id}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onBlur={handleBlur}
                    data-placeholder={placeholder}
                    className={`letra-editor-content w-full rounded-b-md border border-input bg-transparent px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none ${error ? 'border-destructive' : ''}`}
                    style={{ minHeight: `${rows * 1.5}rem` }}
                />
            )}
        </div>
    );
}
