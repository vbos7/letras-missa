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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Musica {
    id: number;
    numero: number;
    titulo: string;
    has_audio: boolean;
}

interface Props {
    musicas: Musica[];
    ytdlpInstalled: boolean;
    ffmpegInstalled: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Áudio', href: '/admin/audio' },
];

export default function AudioIndex({ musicas, ytdlpInstalled, ffmpegInstalled }: Props) {
    const [urls, setUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState<Record<number, boolean>>({});

    const comAudio = musicas.filter((m) => m.has_audio).length;
    const dependenciasFaltando = !ytdlpInstalled || !ffmpegInstalled;

    const handleDownload = (musica: Musica) => {
        setLoading((prev) => ({ ...prev, [musica.id]: true }));
        router.post(
            `/admin/audio/${musica.id}/download`,
            { youtube_url: urls[musica.id] ?? '' },
            {
                onFinish: () => setLoading((prev) => ({ ...prev, [musica.id]: false })),
                preserveScroll: true,
            },
        );
    };

    const handleDelete = (musica: Musica) => {
        router.delete(`/admin/audio/${musica.id}`, { preserveScroll: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent, musica: Musica) => {
        if (e.key === 'Enter' && urls[musica.id]?.trim() && !loading[musica.id]) {
            handleDownload(musica);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Áudio" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gerenciamento de Áudio</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {comAudio} de {musicas.length} músicas com áudio
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
                        <CardTitle>Músicas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {musicas.map((musica) => (
                                <div
                                    key={musica.id}
                                    className="flex flex-wrap items-center gap-3 px-6 py-3"
                                >
                                    <span className="w-10 text-right text-lg font-bold tabular-nums text-muted-foreground">
                                        {musica.numero}
                                    </span>

                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {musica.titulo}
                                    </span>

                                    <Badge variant={musica.has_audio ? 'default' : 'secondary'}>
                                        {musica.has_audio ? 'Com áudio' : 'Sem áudio'}
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
                                        onKeyDown={(e) => handleKeyDown(e, musica)}
                                        disabled={loading[musica.id]}
                                    />

                                    <Button
                                        size="sm"
                                        onClick={() => handleDownload(musica)}
                                        disabled={loading[musica.id] || !urls[musica.id]?.trim()}
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
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Excluir áudio
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja excluir o áudio de{' '}
                                                        <strong>{musica.titulo}</strong>? Esta ação
                                                        não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() => handleDelete(musica)}
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
