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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Tema {
    id: number;
    nome: string;
    cor: string;
}

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    autor: string | null;
    tom: string | null;
    ativo: boolean;
    temas: Tema[];
}

interface PaginatedMusicas {
    data: Musica[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    musicas: PaginatedMusicas;
    temas: Tema[];
    filters: {
        search: string | null;
        tema_id: number | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Músicas', href: '/admin/musicas' },
];

export default function MusicasIndex({ musicas, temas, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [temaId, setTemaId] = useState(filters.tema_id?.toString() || '');
    const isFirstRender = useRef(true);

    const handleDelete = (id: number) => {
        router.delete(`/admin/musicas/${id}`);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (temaId) params.tema_id = temaId;
            router.get('/admin/musicas', params, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 350);
        return () => clearTimeout(timer);
    }, [search, temaId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Músicas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Músicas</h1>
                    <Button asChild>
                        <Link href="/admin/musicas/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Música
                        </Link>
                    </Button>
                </div>

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
                                    placeholder="Número, título, letra ou autor..."
                                />
                            </div>
                            <div className="w-64 space-y-2">
                                <Label htmlFor="tema">Tema</Label>
                                <select
                                    id="tema"
                                    value={temaId}
                                    onChange={(e) => setTemaId(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                >
                                    <option value="">Todos os temas</option>
                                    {temas.map((tema) => (
                                        <option key={tema.id} value={tema.id}>
                                            {tema.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Lista de Músicas ({musicas.total} total)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {musicas.data.length === 0 ? (
                                <p className="py-8 text-center text-muted-foreground">
                                    Nenhuma música encontrada.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {musicas.data.map((musica) => (
                                        <div
                                            key={musica.id}
                                            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex flex-1 items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">
                                                        {musica.numero}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-baseline gap-3">
                                                        <h3 className="font-semibold">
                                                            {musica.titulo}
                                                        </h3>
                                                        {musica.autor && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {musica.autor}
                                                            </span>
                                                        )}
                                                        {musica.tom && (
                                                            <Badge variant="outline">
                                                                {musica.tom}
                                                            </Badge>
                                                            // <span className="text-sm text-muted-foreground">
                                                            //     Tom:{' '}
                                                            //     {musica.tom}
                                                            // </span>
                                                        )}
                                                        {!musica.ativo && (
                                                            <Badge variant="destructive">
                                                                Inativa
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {musica.temas?.length >
                                                        0 && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {musica.temas.map(
                                                                (t) => (
                                                                    <Badge
                                                                        key={
                                                                            t.id
                                                                        }
                                                                        variant="outline"
                                                                    >
                                                                        {t.nome}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={`/musicas/${musica.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Visualizar música</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/musicas/${musica.id}/edit`}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar música</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <AlertDialog>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Excluir música
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Excluir música
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tem certeza que
                                                                deseja excluir a
                                                                música "
                                                                {musica.titulo}
                                                                "? Esta ação não
                                                                pode ser
                                                                desfeita.
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
                                                                        musica.id,
                                                                    )
                                                                }
                                                            >
                                                                Excluir
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {musicas.last_page > 1 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={
                                                    musicas.current_page > 1
                                                        ? `/admin/musicas?page=${musicas.current_page - 1}&search=${search}&tema_id=${temaId}`
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
                                            const current =
                                                musicas.current_page;
                                            const last = musicas.last_page;
                                            const pages: (
                                                | number
                                                | 'ellipsis'
                                            )[] = [];

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
                                                    Math.min(
                                                        last - 1,
                                                        current + 1,
                                                    );
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
                                                            href={`/admin/musicas?page=${p}&search=${search}&tema_id=${temaId}`}
                                                            isActive={
                                                                p === current
                                                            }
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
                                                        ? `/admin/musicas?page=${musicas.current_page + 1}&search=${search}&tema_id=${temaId}`
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
