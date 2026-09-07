import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, List, Music, Palette, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface Stats {
    total_musicas: number;
    total_musicas_ativas: number;
    total_usuarios: number;
    total_admins: number;
    total_listas: number;
    total_listas_publicas: number;
    total_visualizacoes: number;
    total_temas: number;
}

interface MusicaMaisUsada {
    id: number;
    numero: number;
    titulo: string;
    autor: string | null;
    tema: string | null;
    vezes_usada: number;
}

interface ListaMaisVisualizada {
    id: number;
    nome: string;
    usuario: string;
    visualizacoes: number;
    publica: boolean;
    created_at: string;
}

interface UsuarioMaisAtivo {
    id: number;
    nome: string;
    email: string;
    total_listas: number;
    is_admin: boolean;
}

interface MusicaPorTema {
    nome: string;
    cor: string;
    total: number;
}

interface CrescimentoData {
    data: string;
    total: number;
}

interface Medias {
    listas_por_usuario: number;
    visualizacoes_por_lista: number;
}

interface DashboardProps {
    stats: Stats;
    musicasMaisUsadas: MusicaMaisUsada[];
    listasMaisVisualizadas: ListaMaisVisualizada[];
    usuariosMaisAtivos: UsuarioMaisAtivo[];
    musicasPorTema: MusicaPorTema[];
    crescimentoUsuarios: CrescimentoData[];
    crescimentoListas: CrescimentoData[];
    medias: Medias;
}

export default function AdminDashboard({
    stats,
    musicasMaisUsadas,
    listasMaisVisualizadas,
    usuariosMaisAtivos,
    musicasPorTema,
    crescimentoUsuarios,
    crescimentoListas,
    medias,
}: DashboardProps) {
    const statCards = [
        {
            title: 'Total de Músicas',
            value: stats.total_musicas,
            description: `${stats.total_musicas_ativas} ativas`,
            icon: Music,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Usuários',
            value: stats.total_usuarios,
            description: `${stats.total_admins} administradores`,
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Listas',
            value: stats.total_listas,
            description: `${stats.total_listas_publicas} públicas`,
            icon: List,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Visualizações',
            value: stats.total_visualizacoes.toLocaleString('pt-BR'),
            description: `Média de ${medias.visualizacoes_por_lista} por lista`,
            icon: Eye,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Temas',
            value: stats.total_temas,
            description: 'Categorias de músicas',
            icon: Palette,
            color: 'text-pink-600',
            bgColor: 'bg-pink-100',
        },
        {
            title: 'Média de Listas',
            value: medias.listas_por_usuario,
            description: 'Por usuário',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div
                                    className={`rounded-lg p-2 ${stat.bgColor}`}
                                >
                                    <stat.icon
                                        className={`h-4 w-4 ${stat.color}`}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Músicas Mais Usadas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Músicas Mais Usadas</CardTitle>
                            <CardDescription>
                                Top 10 músicas adicionadas em listas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nº</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Tema</TableHead>
                                        <TableHead className="text-right">
                                            Vezes Usada
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {musicasMaisUsadas.map((musica) => (
                                        <TableRow key={musica.id}>
                                            <TableCell className="font-medium">
                                                {musica.numero}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {musica.titulo}
                                                    </div>
                                                    {musica.autor && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {musica.autor}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {musica.tema && (
                                                    <Badge variant="secondary">
                                                        {musica.tema}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge>
                                                    {musica.vezes_usada}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Listas Mais Visualizadas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Listas Mais Visualizadas</CardTitle>
                            <CardDescription>
                                Top 10 listas com mais acessos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead className="text-right">
                                            Visualizações
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listasMaisVisualizadas.map((lista) => (
                                        <TableRow key={lista.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {lista.nome}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        {lista.publica && (
                                                            <Badge
                                                                variant="outline"
                                                                className="h-4 px-1 text-[10px]"
                                                            >
                                                                Pública
                                                            </Badge>
                                                        )}
                                                        {lista.created_at}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {lista.usuario}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge>
                                                    {lista.visualizacoes}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Usuários Mais Ativos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usuários Mais Ativos</CardTitle>
                            <CardDescription>
                                Top 10 usuários com mais listas criadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-right">
                                            Listas
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuariosMaisAtivos.map((usuario) => (
                                        <TableRow key={usuario.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {usuario.nome}
                                                    </span>
                                                    {usuario.is_admin && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="h-4 px-1 text-[10px]"
                                                        >
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {usuario.email}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge>
                                                    {usuario.total_listas}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Distribuição por Tema */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição por Tema</CardTitle>
                            <CardDescription>
                                Quantidade de músicas por tema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {musicasPorTema.map((tema, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor: tema.cor,
                                                }}
                                            />
                                            <span className="text-sm font-medium">
                                                {tema.nome}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">
                                            {tema.total}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Crescimento */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Novos Usuários (últimos 30 dias)
                            </CardTitle>
                            <CardDescription>
                                Total:{' '}
                                {crescimentoUsuarios.reduce(
                                    (acc, item) => acc + item.total,
                                    0,
                                )}{' '}
                                novos usuários
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {crescimentoUsuarios.length > 0 ? (
                                <div className="space-y-2">
                                    {crescimentoUsuarios
                                        .slice(-10)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="text-muted-foreground">
                                                    {new Date(
                                                        item.data,
                                                    ).toLocaleDateString(
                                                        'pt-BR',
                                                    )}
                                                </span>
                                                <Badge variant="secondary">
                                                    {item.total}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum novo usuário nos últimos 30 dias
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Novas Listas (últimos 30 dias)
                            </CardTitle>
                            <CardDescription>
                                Total:{' '}
                                {crescimentoListas.reduce(
                                    (acc, item) => acc + item.total,
                                    0,
                                )}{' '}
                                novas listas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {crescimentoListas.length > 0 ? (
                                <div className="space-y-2">
                                    {crescimentoListas
                                        .slice(-10)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="text-muted-foreground">
                                                    {new Date(
                                                        item.data,
                                                    ).toLocaleDateString(
                                                        'pt-BR',
                                                    )}
                                                </span>
                                                <Badge variant="secondary">
                                                    {item.total}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma nova lista nos últimos 30 dias
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
