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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, SendHorizonal } from 'lucide-react';
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
    { title: 'Músicas', href: '/colaborador/musicas' },
];

export default function ColaboradorMusicasIndex({
    musicas,
    temas,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [temaId, setTemaId] = useState(filters.tema_id?.toString() || '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (temaId) params.tema_id = temaId;
            router.get('/colaborador/musicas', params, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 350);
        return () => clearTimeout(timer);
    }, [search, temaId]);

    const handleSolicitarExclusao = (id: number) => {
        router.post(`/colaborador/musicas/${id}/solicitar-exclusao`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Músicas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Músicas</h1>
                    <Button asChild>
                        <Link href="/colaborador/musicas/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Música
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Você está no painel colaborador. Novas músicas são salvas
                    diretamente. Edições e exclusões de músicas existentes
                    precisam de aprovação do administrador.
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
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none md:text-sm"
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
                                                    <h3 className="font-semibold">
                                                        {musica.titulo}
                                                    </h3>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {musica.temas?.map(
                                                            (t) => (
                                                                <Badge
                                                                    key={t.id}
                                                                    variant="secondary"
                                                                    style={{
                                                                        backgroundColor:
                                                                            t.cor,
                                                                        color: '#fff',
                                                                    }}
                                                                >
                                                                    {t.nome}
                                                                </Badge>
                                                            ),
                                                        )}
                                                        {musica.autor && (
                                                            <Badge variant="outline">
                                                                {musica.autor}
                                                            </Badge>
                                                        )}
                                                        {musica.tom && (
                                                            <Badge variant="outline">
                                                                Tom:{' '}
                                                                {musica.tom}
                                                            </Badge>
                                                        )}
                                                        {!musica.ativo && (
                                                            <Badge variant="destructive">
                                                                Inativa
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/colaborador/musicas/${musica.id}/edit`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <SendHorizonal className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Solicitar
                                                                exclusão
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Deseja enviar
                                                                uma solicitação
                                                                de exclusão para
                                                                "{musica.titulo}
                                                                "? O
                                                                administrador
                                                                precisará
                                                                aprovar antes de
                                                                ser excluída.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleSolicitarExclusao(
                                                                        musica.id,
                                                                    )
                                                                }
                                                            >
                                                                Enviar
                                                                solicitação
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
                                <div className="mt-4 flex justify-center gap-2">
                                    {Array.from(
                                        { length: musicas.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <Button
                                            key={page}
                                            variant={
                                                page === musicas.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    `/colaborador/musicas?page=${page}&search=${search}&tema_id=${temaId}`,
                                                )
                                            }
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
