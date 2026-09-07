import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

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
    temas: Tema[];
}

interface DadosEdicao {
    numero?: number;
    titulo?: string;
    letra?: string;
    autor?: string;
    tom?: string;
    tema_ids?: number[];
    tags?: string;
    ativo?: boolean;
}

interface Solicitacao {
    id: number;
    tipo: 'edicao' | 'exclusao';
    dados: DadosEdicao | null;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    nota_admin: string | null;
    created_at: string;
    reviewed_at: string | null;
    user: User;
    musica: Musica;
    reviewer: User | null;
}

interface PaginatedSolicitacoes {
    data: Solicitacao[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    solicitacoes: PaginatedSolicitacoes;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Solicitações', href: '/admin/solicitacoes' },
];

function StatusBadge({ status }: { status: string }) {
    if (status === 'pendente')
        return <Badge variant="secondary">Pendente</Badge>;
    if (status === 'aprovado')
        return <Badge className="bg-green-600">Aprovado</Badge>;
    return <Badge variant="destructive">Rejeitado</Badge>;
}

function TipoBadge({ tipo }: { tipo: string }) {
    if (tipo === 'edicao') return <Badge variant="outline">Edição</Badge>;
    return <Badge variant="destructive">Exclusão</Badge>;
}

function RejeitarDialog({ solicitacao }: { solicitacao: Solicitacao }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        nota_admin: '',
    });

    const handleRejeitar = () => {
        post(`/admin/solicitacoes/${solicitacao.id}/rejeitar`, {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <X className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rejeitar solicitação</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Música: <strong>{solicitacao.musica.titulo}</strong>
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="nota">
                            Motivo da rejeição (opcional)
                        </Label>
                        <textarea
                            id="nota"
                            value={data.nota_admin}
                            onChange={(e) =>
                                setData('nota_admin', e.target.value)
                            }
                            placeholder="Explique o motivo para o colaborador..."
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleRejeitar}
                        disabled={processing}
                    >
                        {processing ? 'Rejeitando...' : 'Rejeitar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function SolicitacoesIndex({ solicitacoes }: Props) {
    const handleAprovar = (id: number) => {
        router.post(`/admin/solicitacoes/${id}/aprovar`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitações" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        Solicitações dos Colaboradores
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        {solicitacoes.total} solicitação(ões)
                    </span>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Todas as Solicitações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {solicitacoes.data.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                Nenhuma solicitação encontrada.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {solicitacoes.data.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`rounded-lg border p-4 ${s.status === 'pendente' ? 'border-amber-300 bg-amber-50/50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <TipoBadge tipo={s.tipo} />
                                                    <StatusBadge
                                                        status={s.status}
                                                    />
                                                    <span className="font-semibold">
                                                        #{s.musica.numero} —{' '}
                                                        {s.musica.titulo}
                                                    </span>
                                                    {s.musica.temas?.map(
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
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    Solicitado por{' '}
                                                    <strong>
                                                        {s.user.name}
                                                    </strong>{' '}
                                                    em{' '}
                                                    {new Date(
                                                        s.created_at,
                                                    ).toLocaleDateString(
                                                        'pt-BR',
                                                    )}
                                                </p>

                                                {s.tipo === 'edicao' &&
                                                    s.dados && (
                                                        <details className="mt-2">
                                                            <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:underline">
                                                                Ver alterações
                                                                propostas
                                                            </summary>
                                                            <div className="mt-2 overflow-x-auto rounded border bg-white p-3">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                                                            <th className="pr-4 pb-1">
                                                                                Campo
                                                                            </th>
                                                                            <th className="pr-4 pb-1">
                                                                                Atual
                                                                            </th>
                                                                            <th className="pb-1">
                                                                                Proposto
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y">
                                                                        {Object.entries(
                                                                            s.dados,
                                                                        ).map(
                                                                            ([
                                                                                campo,
                                                                                valor,
                                                                            ]) => {
                                                                                const atual =
                                                                                    (
                                                                                        s.musica as unknown as Record<
                                                                                            string,
                                                                                            unknown
                                                                                        >
                                                                                    )[
                                                                                        campo
                                                                                    ];
                                                                                const proposto =
                                                                                    String(
                                                                                        valor ??
                                                                                            '',
                                                                                    );
                                                                                const mudou =
                                                                                    String(
                                                                                        atual ??
                                                                                            '',
                                                                                    ) !==
                                                                                    proposto;
                                                                                return (
                                                                                    <tr
                                                                                        key={
                                                                                            campo
                                                                                        }
                                                                                        className={
                                                                                            mudou
                                                                                                ? 'bg-yellow-50'
                                                                                                : ''
                                                                                        }
                                                                                    >
                                                                                        <td className="py-1 pr-4 font-mono text-xs text-muted-foreground">
                                                                                            {
                                                                                                campo
                                                                                            }
                                                                                        </td>
                                                                                        <td className="py-1 pr-4 text-muted-foreground line-through">
                                                                                            {String(
                                                                                                atual ??
                                                                                                    '—',
                                                                                            )}
                                                                                        </td>
                                                                                        <td
                                                                                            className={`py-1 ${mudou ? 'font-medium text-green-700' : ''}`}
                                                                                        >
                                                                                            {proposto ||
                                                                                                '—'}
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </details>
                                                    )}

                                                {s.nota_admin && (
                                                    <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                                        <strong>
                                                            Nota admin:
                                                        </strong>{' '}
                                                        {s.nota_admin}
                                                    </p>
                                                )}

                                                {s.reviewer &&
                                                    s.reviewed_at && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Revisado por{' '}
                                                            {s.reviewer.name} em{' '}
                                                            {new Date(
                                                                s.reviewed_at,
                                                            ).toLocaleDateString(
                                                                'pt-BR',
                                                            )}
                                                        </p>
                                                    )}
                                            </div>

                                            {s.status === 'pendente' && (
                                                <div className="flex shrink-0 gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() =>
                                                            handleAprovar(s.id)
                                                        }
                                                        title="Aprovar"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <RejeitarDialog
                                                        solicitacao={s}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {solicitacoes.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {Array.from(
                                    { length: solicitacoes.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === solicitacoes.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                `/admin/solicitacoes?page=${page}`,
                                            )
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
