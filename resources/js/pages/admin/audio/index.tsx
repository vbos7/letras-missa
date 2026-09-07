import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Download, Info, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioInfo {
    artista: string | null;
    compositor: string | null;
    album: string | null;
    gravadora: string | null;
    distribuidora: string | null;
    data_lancamento: string | null;
    fonte_url: string | null;
    descricao: string | null;
}

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    autor: string | null;
    has_audio: boolean;
    audio_info: AudioInfo | null;
}

type CreditosForm = {
    artista: string;
    compositor: string;
    album: string;
    gravadora: string;
    distribuidora: string;
    data_lancamento: string;
    fonte_url: string;
    descricao: string;
};

interface PaginatedMusicas {
    data: Musica[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    musicas: PaginatedMusicas;
    filters: {
        search: string | null;
        status: string | null;
    };
    stats: {
        total: number;
        com_audio: number;
    };
    ytdlpInstalled: boolean;
    ffmpegInstalled: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Áudio', href: '/admin/audio' },
];

export default function AudioIndex({
    musicas,
    filters,
    stats,
    ytdlpInstalled,
    ffmpegInstalled,
}: Props) {
    const [urls, setUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState<Record<number, boolean>>({});
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const isFirstRender = useRef(true);

    // Edição de créditos do áudio
    const [creditoMusica, setCreditoMusica] = useState<Musica | null>(null);
    const [creditoForm, setCreditoForm] = useState<CreditosForm>({
        artista: '',
        compositor: '',
        album: '',
        gravadora: '',
        distribuidora: '',
        data_lancamento: '',
        fonte_url: '',
        descricao: '',
    });
    const [salvandoCreditos, setSalvandoCreditos] = useState(false);

    const abrirCreditos = (musica: Musica) => {
        setCreditoMusica(musica);
        const info = musica.audio_info;
        setCreditoForm({
            artista: info?.artista ?? '',
            compositor: info?.compositor ?? '',
            album: info?.album ?? '',
            gravadora: info?.gravadora ?? '',
            distribuidora: info?.distribuidora ?? '',
            data_lancamento: info?.data_lancamento ?? '',
            fonte_url: info?.fonte_url ?? '',
            descricao: info?.descricao ?? '',
        });
    };

    const salvarCreditos = () => {
        if (!creditoMusica) return;
        setSalvandoCreditos(true);
        router.put(`/admin/audio/${creditoMusica.id}/creditos`, creditoForm, {
            preserveScroll: true,
            onSuccess: () => setCreditoMusica(null),
            onFinish: () => setSalvandoCreditos(false),
        });
    };

    const dependenciasFaltando = !ytdlpInstalled || !ffmpegInstalled;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (status) params.status = status;
            router.get('/admin/audio', params, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 350);
        return () => clearTimeout(timer);
    }, [search, status]);

    const pageHref = (page: number) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        return `/admin/audio?${params.toString()}`;
    };

    const handleDownload = (musica: Musica) => {
        setLoading((prev) => ({ ...prev, [musica.id]: true }));
        router.post(
            `/admin/audio/${musica.id}/download`,
            { youtube_url: urls[musica.id] ?? '' },
            {
                onFinish: () =>
                    setLoading((prev) => ({ ...prev, [musica.id]: false })),
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (musica: Musica) => {
        router.delete(`/admin/audio/${musica.id}`, { preserveScroll: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent, musica: Musica) => {
        if (
            e.key === 'Enter' &&
            urls[musica.id]?.trim() &&
            !loading[musica.id]
        ) {
            handleDownload(musica);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Áudio" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Gerenciamento de Áudio
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {stats.com_audio} de {stats.total} músicas com áudio
                        </p>
                    </div>
                </div>

                {dependenciasFaltando && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Dependências ausentes</AlertTitle>
                        <AlertDescription className="space-y-1">
                            {!ytdlpInstalled && (
                                <p>
                                    <strong>yt-dlp</strong> não instalado —{' '}
                                    <code className="rounded bg-destructive/20 px-1">
                                        pip install yt-dlp
                                    </code>
                                </p>
                            )}
                            {!ffmpegInstalled && (
                                <p>
                                    <strong>ffmpeg</strong> não instalado —{' '}
                                    <code className="rounded bg-destructive/20 px-1">
                                        brew install ffmpeg
                                    </code>
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="search">Buscar</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Número ou título..."
                                />
                            </div>
                            <div className="w-56 space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="com">Com áudio</option>
                                    <option value="sem">Sem áudio</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Músicas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {musicas.data.length === 0 ? (
                            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                Nenhuma música encontrada.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {musicas.data.map((musica) => (
                                    <div
                                        key={musica.id}
                                        className="flex flex-wrap items-center gap-3 px-6 py-3"
                                    >
                                        <span className="w-10 text-right text-lg font-bold text-muted-foreground tabular-nums">
                                            {musica.numero}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {musica.titulo}
                                            </p>
                                            {musica.autor && (
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {musica.autor}
                                                </p>
                                            )}
                                        </div>

                                        <Badge
                                            variant={
                                                musica.has_audio
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {musica.has_audio
                                                ? 'Com áudio'
                                                : 'Sem áudio'}
                                        </Badge>

                                        <Input
                                            className="w-72"
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={urls[musica.id] ?? ''}
                                            onChange={(e) =>
                                                setUrls((prev) => ({
                                                    ...prev,
                                                    [musica.id]: e.target.value,
                                                }))
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(e, musica)
                                            }
                                            disabled={loading[musica.id]}
                                        />

                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleDownload(musica)
                                            }
                                            disabled={
                                                loading[musica.id] ||
                                                !urls[musica.id]?.trim()
                                            }
                                        >
                                            {loading[musica.id] ? (
                                                <>
                                                    <Spinner className="mr-1.5" />
                                                    Baixando...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-1.5 h-4 w-4" />
                                                    Baixar
                                                </>
                                            )}
                                        </Button>

                                        {musica.has_audio && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    abrirCreditos(musica)
                                                }
                                                title="Créditos do áudio"
                                            >
                                                <Info className="mr-1.5 h-4 w-4" />
                                                Créditos
                                                {musica.audio_info?.album ||
                                                musica.audio_info?.artista ||
                                                musica.audio_info?.gravadora ? (
                                                    <span className="ml-1.5 h-2 w-2 rounded-full bg-green-500" />
                                                ) : null}
                                            </Button>
                                        )}

                                        {musica.has_audio && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Excluir áudio
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que
                                                            deseja excluir o
                                                            áudio de{' '}
                                                            <strong>
                                                                {musica.titulo}
                                                            </strong>
                                                            ? Esta ação não pode
                                                            ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    musica,
                                                                )
                                                            }
                                                        >
                                                            Excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {musicas.last_page > 1 && (
                            <Pagination className="border-t py-4">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                musicas.current_page > 1
                                                    ? pageHref(
                                                          musicas.current_page -
                                                              1,
                                                      )
                                                    : '#'
                                            }
                                            aria-disabled={
                                                musicas.current_page === 1
                                            }
                                            className={
                                                musicas.current_page === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {(() => {
                                        const current = musicas.current_page;
                                        const last = musicas.last_page;
                                        const pages: (number | 'ellipsis')[] =
                                            [];

                                        if (last <= 7) {
                                            for (let i = 1; i <= last; i++)
                                                pages.push(i);
                                        } else {
                                            pages.push(1);
                                            if (current > 3)
                                                pages.push('ellipsis');
                                            for (
                                                let i = Math.max(
                                                    2,
                                                    current - 1,
                                                );
                                                i <=
                                                Math.min(last - 1, current + 1);
                                                i++
                                            )
                                                pages.push(i);
                                            if (current < last - 2)
                                                pages.push('ellipsis');
                                            pages.push(last);
                                        }

                                        return pages.map((p, i) =>
                                            p === 'ellipsis' ? (
                                                <PaginationItem
                                                    key={`ellipsis-${i}`}
                                                >
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={p}>
                                                    <PaginationLink
                                                        href={pageHref(p)}
                                                        isActive={p === current}
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ),
                                        );
                                    })()}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                musicas.current_page <
                                                musicas.last_page
                                                    ? pageHref(
                                                          musicas.current_page +
                                                              1,
                                                      )
                                                    : '#'
                                            }
                                            aria-disabled={
                                                musicas.current_page ===
                                                musicas.last_page
                                            }
                                            className={
                                                musicas.current_page ===
                                                musicas.last_page
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog de créditos do áudio */}
            <Dialog
                open={creditoMusica !== null}
                onOpenChange={(open) => !open && setCreditoMusica(null)}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Créditos do áudio
                            {creditoMusica && (
                                <span className="ml-1 font-normal text-muted-foreground">
                                    — #{creditoMusica.numero}{' '}
                                    {creditoMusica.titulo}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="c_artista">
                                    Artista / Intérprete
                                </Label>
                                <Input
                                    id="c_artista"
                                    value={creditoForm.artista}
                                    onChange={(e) =>
                                        setCreditoForm((f) => ({
                                            ...f,
                                            artista: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c_compositor">Compositor</Label>
                                <Input
                                    id="c_compositor"
                                    value={creditoForm.compositor}
                                    onChange={(e) =>
                                        setCreditoForm((f) => ({
                                            ...f,
                                            compositor: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c_album">Álbum</Label>
                                <Input
                                    id="c_album"
                                    value={creditoForm.album}
                                    onChange={(e) =>
                                        setCreditoForm((f) => ({
                                            ...f,
                                            album: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c_gravadora">
                                    Gravadora (℗)
                                </Label>
                                <Input
                                    id="c_gravadora"
                                    placeholder="Ex.: Edições Shalom"
                                    value={creditoForm.gravadora}
                                    onChange={(e) =>
                                        setCreditoForm((f) => ({
                                            ...f,
                                            gravadora: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c_distribuidora">
                                    Distribuidora
                                </Label>
                                <Input
                                    id="c_distribuidora"
                                    placeholder="Ex.: ONErpm"
                                    value={creditoForm.distribuidora}
                                    onChange={(e) =>
                                        setCreditoForm((f) => ({
                                            ...f,
                                            distribuidora: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c_lancamento">
                                    Data de lançamento
                                </Label>
                                <Input
                                    id="c_lancamento"
                                    placeholder="Ex.: 2021-04-16"
                                    value={creditoForm.data_lancamento}
                                    onChange={(e) =>
                                        setCreditoForm((f) => ({
                                            ...f,
                                            data_lancamento: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="c_fonte">
                                Link da fonte (YouTube, etc.)
                            </Label>
                            <Input
                                id="c_fonte"
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                value={creditoForm.fonte_url}
                                onChange={(e) =>
                                    setCreditoForm((f) => ({
                                        ...f,
                                        fonte_url: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="c_descricao">
                                Descrição completa (respaldo)
                            </Label>
                            <textarea
                                id="c_descricao"
                                rows={6}
                                placeholder="Cole aqui a descrição completa do YouTube (Provided to YouTube by..., ℗..., Released on..., Auto-generated by YouTube.)"
                                value={creditoForm.descricao}
                                onChange={(e) =>
                                    setCreditoForm((f) => ({
                                        ...f,
                                        descricao: e.target.value,
                                    }))
                                }
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Dica: cole o texto inteiro da descrição do
                                YouTube para ter o registro verbatim dos
                                créditos.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreditoMusica(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={salvarCreditos}
                            disabled={salvandoCreditos}
                        >
                            {salvandoCreditos ? (
                                <>
                                    <Spinner className="mr-1.5" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar créditos'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
