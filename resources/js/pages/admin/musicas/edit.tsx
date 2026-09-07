import GuiaFormatacao from '@/components/guia-formatacao';
import LetraEditor from '@/components/letra-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface Tema {
    id: number;
    nome: string;
    cor: string;
}

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    letra: string;
    autor: string | null;
    tom: string | null;
    tags: string | null;
    ativo: boolean;
    temas: Tema[];
}

interface Props {
    musica: Musica;
    temas: Tema[];
}

export default function MusicasEdit({ musica, temas }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Músicas', href: '/admin/musicas' },
        { title: musica.titulo, href: `/admin/musicas/${musica.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        numero: musica.numero.toString(),
        titulo: musica.titulo,
        letra: musica.letra,
        autor: musica.autor || '',
        tom: musica.tom || '',
        tema_ids: musica.temas.map((t) => t.id),
        tags: musica.tags || '',
        ativo: musica.ativo,
    });

    const toggleTema = (id: number, checked: boolean) =>
        setData(
            'tema_ids',
            checked
                ? [...data.tema_ids, id]
                : data.tema_ids.filter((t) => t !== id),
        );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/musicas/${musica.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${musica.titulo}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card className="max-w-5xl">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle>Editar Informações da Música</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-[auto_1fr] items-start gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">
                                        Número{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="numero"
                                        type="number"
                                        value={data.numero}
                                        onChange={(e) =>
                                            setData('numero', e.target.value)
                                        }
                                        placeholder="Ex: 001"
                                        className="w-28"
                                        autoFocus
                                    />
                                    {errors.numero && (
                                        <p className="text-sm text-destructive">
                                            {errors.numero}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Temas{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                            >
                                                <span className="flex flex-wrap gap-1">
                                                    {data.tema_ids.length ===
                                                    0 ? (
                                                        <span className="text-muted-foreground">
                                                            Selecione os
                                                            temas...
                                                        </span>
                                                    ) : (
                                                        temas
                                                            .filter((t) =>
                                                                data.tema_ids.includes(
                                                                    t.id,
                                                                ),
                                                            )
                                                            .map((t) => (
                                                                <span
                                                                    key={t.id}
                                                                    className="inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium"
                                                                >
                                                                    {t.nome}
                                                                </span>
                                                            ))
                                                    )}
                                                </span>
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="max-h-[calc(10*2.25rem)] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">
                                            {temas.map((tema) => (
                                                <DropdownMenuItem
                                                    key={tema.id}
                                                    onSelect={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onClick={() =>
                                                        toggleTema(
                                                            tema.id,
                                                            !data.tema_ids.includes(
                                                                tema.id,
                                                            ),
                                                        )
                                                    }
                                                    className="flex cursor-pointer items-center gap-2"
                                                >
                                                    <Checkbox
                                                        checked={data.tema_ids.includes(
                                                            tema.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            toggleTema(
                                                                tema.id,
                                                                !!checked,
                                                            )
                                                        }
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                    {tema.nome}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {errors.tema_ids && (
                                        <p className="text-sm text-destructive">
                                            {errors.tema_ids}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="titulo">
                                    Título{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="titulo"
                                    value={data.titulo}
                                    onChange={(e) =>
                                        setData('titulo', e.target.value)
                                    }
                                    placeholder="Ex: Maria, Mãe de Deus"
                                />
                                {errors.titulo && (
                                    <p className="text-sm text-destructive">
                                        {errors.titulo}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="letra">
                                    Letra{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <GuiaFormatacao />
                                <LetraEditor
                                    id="letra"
                                    value={data.letra}
                                    onChange={(v) => setData('letra', v)}
                                    error={errors.letra}
                                />
                                {errors.letra && (
                                    <p className="text-sm text-destructive">
                                        {errors.letra}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="autor">Autor</Label>
                                    <Input
                                        id="autor"
                                        value={data.autor}
                                        onChange={(e) =>
                                            setData('autor', e.target.value)
                                        }
                                        placeholder="Ex: João Silva"
                                    />
                                    {errors.autor && (
                                        <p className="text-sm text-destructive">
                                            {errors.autor}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tom">Tom</Label>
                                    <Input
                                        id="tom"
                                        value={data.tom}
                                        onChange={(e) =>
                                            setData('tom', e.target.value)
                                        }
                                        placeholder="Ex: C, G, Am"
                                    />
                                    {errors.tom && (
                                        <p className="text-sm text-destructive">
                                            {errors.tom}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (opcional)</Label>
                                <Input
                                    id="tags"
                                    value={data.tags}
                                    onChange={(e) =>
                                        setData('tags', e.target.value)
                                    }
                                    placeholder="Ex: natal, páscoa"
                                />
                                {errors.tags && (
                                    <p className="text-sm text-destructive">
                                        {errors.tags}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ativo"
                                    checked={data.ativo}
                                    onCheckedChange={(checked) =>
                                        setData('ativo', checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor="ativo"
                                    className="cursor-pointer"
                                >
                                    Música ativa
                                </Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Salvando...'
                                        : 'Atualizar Música'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/musicas">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
