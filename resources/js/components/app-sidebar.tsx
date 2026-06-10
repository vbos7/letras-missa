import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, FileAudio, Folder, LayoutGrid, Music, Palette } from 'lucide-react';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth, solicitacoes_pendentes } = usePage<SharedData & { solicitacoes_pendentes: number }>().props;
    const user = auth.user;
    const isAdmin = Boolean(user?.is_admin);
    const isColaborador = Boolean(user?.is_colaborador);

    const adminNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
        { title: 'Temas', href: '/admin/temas', icon: Palette },
        { title: 'Músicas', href: '/admin/musicas', icon: Music },
        { title: 'Áudio', href: '/admin/audio', icon: FileAudio },
        {
            title: 'Solicitações',
            href: '/admin/solicitacoes',
            icon: ClipboardList,
            badge: solicitacoes_pendentes ?? 0,
        },
    ];

    const colaboradorNavItems: NavItem[] = [
        { title: 'Músicas', href: '/colaborador/musicas', icon: Music },
    ];

    const navItems = isAdmin
        ? adminNavItems
        : isColaborador
          ? colaboradorNavItems
          : [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader></SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
