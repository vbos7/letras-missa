import { Link, usePage } from '@inertiajs/react';
import {
    FileText,
    FolderOpen,
    Heart,
    Home,
    Info,
    List,
    LogOut,
    Menu,
    Music,
    Shield,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sobreModalAberto, setSobreModalAberto] = useState(false);
    const [termosModalAberto, setTermosModalAberto] = useState(false);
    const [privacidadeModalAberto, setPrivacidadeModalAberto] = useState(false);
    const [mostrarQRCode, setMostrarQRCode] = useState(false);
    const [cookieConsentVisible, setCookieConsentVisible] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !localStorage.getItem('cookie_consent');
    });

    const aceitarCookies = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setCookieConsentVisible(false);
    };

    const navigation = [
        { name: 'Início', href: '/', icon: Home },
        { name: 'Músicas', href: '/musicas', icon: Music },
        { name: 'Temas', href: '/temas', icon: FolderOpen },
    ];

    const authNavigation = auth.user
        ? [{ name: 'Minhas Listas', href: '/listas', icon: List }]
        : [];

    // Fecha o menu ao pressionar ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Previne scroll quando menu está aberto
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FEFEFD' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <img
                                src="/images/logo.png"
                                alt="Cânticos de Missa"
                                className="h-10 w-10"
                            />
                            <span className="text-xl font-bold text-gray-900">
                                Cânticos de Missa
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden space-x-4 lg:flex">
                            {[...navigation, ...authNavigation].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors"
                                    style={{
                                        color: 'rgb(55, 65, 81)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F5F0E8';
                                        e.currentTarget.style.color = '#C7AB65';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.color = 'rgb(55, 65, 81)';
                                    }}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* User Menu Desktop */}
                        <div className="hidden items-center space-x-4 lg:flex">
                            {auth.user ? (
                                <>
                                    <span className="text-sm text-gray-700">
                                        Olá, {auth.user.name}
                                    </span>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sair</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-gray-700 transition-colors"
                                        style={{ color: 'rgb(55, 65, 81)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#C7AB65'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(55, 65, 81)'}
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
                                        style={{ backgroundColor: '#C7AB65' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                                    >
                                        Cadastrar
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="fixed top-0 right-0 bottom-0 z-50 w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden"
                        style={{ animation: 'slideInRight 0.3s ease-out' }}
                    >
                        <div className="flex h-full flex-col">
                            {/* Header do Sidebar */}
                            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                                <span className="text-lg font-bold text-gray-900">
                                    Menu
                                </span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Conteúdo do Sidebar */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {/* User Info */}
                                {auth.user && (
                                    <div className="mb-4 rounded-lg p-4" style={{ backgroundColor: '#F5F0E8' }}>
                                        <p className="text-sm text-gray-600">
                                            Olá,
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {auth.user.name}
                                        </p>
                                    </div>
                                )}

                                {/* Navigation */}
                                <nav className="space-y-2">
                                    {[...navigation, ...authNavigation].map(
                                        (item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors"
                                                style={{ color: 'rgb(55, 65, 81)' }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#F5F0E8';
                                                    e.currentTarget.style.color = '#C7AB65';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '';
                                                    e.currentTarget.style.color = 'rgb(55, 65, 81)';
                                                }}
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ),
                                    )}
                                </nav>
                            </div>

                            {/* Footer do Sidebar */}
                            <div className="border-t border-gray-200 p-4">
                                {auth.user ? (
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-50 px-4 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-100"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Sair</span>
                                    </Link>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            href="/login"
                                            className="block rounded-lg border-2 bg-white px-4 py-3 text-center text-base font-medium transition-colors"
                                            style={{ borderColor: '#C7AB65', color: '#C7AB65' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F0E8'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block rounded-lg px-4 py-3 text-center text-base font-medium text-white transition-colors"
                                            style={{ backgroundColor: '#C7AB65' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            Cadastrar
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-12 border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                        <p className="text-center text-sm text-gray-500">
                            © 2025 Cânticos de Missa. Feito para a comunidade.
                        </p>
                        <button
                            onClick={() => setSobreModalAberto(true)}
                            className="flex items-center gap-1 text-sm transition-colors"
                            style={{ color: '#C7AB65' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#B89B55'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#C7AB65'}
                        >
                            <Info className="h-4 w-4" />
                            Sobre
                        </button>
                        <button
                            onClick={() => setTermosModalAberto(true)}
                            className="flex items-center gap-1 text-sm transition-colors"
                            style={{ color: '#C7AB65' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#B89B55'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#C7AB65'}
                        >
                            <FileText className="h-4 w-4" />
                            Termos de Uso
                        </button>
                        <button
                            onClick={() => setPrivacidadeModalAberto(true)}
                            className="flex items-center gap-1 text-sm transition-colors"
                            style={{ color: '#C7AB65' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#B89B55'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#C7AB65'}
                        >
                            <Shield className="h-4 w-4" />
                            Política de Privacidade
                        </button>
                    </div>
                </div>
            </footer>

            {/* Modal Termos de Uso */}
            {termosModalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={() => setTermosModalAberto(false)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6">
                            <h3 className="text-2xl font-bold text-gray-900">Termos de Uso</h3>
                            <button
                                onClick={() => setTermosModalAberto(false)}
                                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <div className="space-y-5 text-sm text-gray-700">
                                <p className="text-xs text-gray-400">Última atualização: junho de 2026</p>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">1. Aceitação dos Termos</h4>
                                    <p>Ao acessar e utilizar o <strong>Cânticos de Missa</strong>, você concorda com estes Termos de Uso. Caso não concorde, por favor, não utilize o serviço.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">2. Sobre o Serviço</h4>
                                    <p>O Cânticos de Missa é uma plataforma <strong>gratuita, sem fins lucrativos</strong>, criada para auxiliar a comunidade católica no acesso às letras e repertório de cânticos litúrgicos. Não há interesses comerciais envolvidos.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">3. Direitos Autorais e Conteúdo</h4>
                                    <p>As letras dos cânticos e os áudios disponíveis nesta plataforma são de propriedade de seus respectivos autores, compositores e editoras. O Cânticos de Missa <strong>não reivindica qualquer propriedade</strong> sobre este conteúdo.</p>
                                    <p>O conteúdo é disponibilizado exclusivamente para <strong>fins religiosos, litúrgicos e educacionais</strong>, em caráter não comercial, no espírito do serviço à comunidade católica.</p>
                                    <p>Se você é titular de direitos autorais sobre algum conteúdo presente nesta plataforma e deseja sua remoção, entre em contato conosco e providenciaremos a retirada imediatamente.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">4. Uso dos Áudios</h4>
                                    <p>Os áudios disponíveis na plataforma são fornecidos <strong>exclusivamente para referência musical</strong> durante o estudo de repertório e preparação de celebrações litúrgicas. É expressamente proibido:</p>
                                    <ul className="list-inside list-disc space-y-1 pl-4">
                                        <li>Baixar ou redistribuir os áudios</li>
                                        <li>Utilizar os áudios para fins comerciais</li>
                                        <li>Reproduzir publicamente os áudios fora do contexto religioso</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">5. Contas de Usuário</h4>
                                    <p>Ao criar uma conta, você é responsável pela segurança de suas credenciais e por todas as atividades realizadas em sua conta. É proibido utilizar a plataforma para qualquer finalidade ilícita ou que viole direitos de terceiros.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">6. Limitação de Responsabilidade</h4>
                                    <p>O Cânticos de Missa é fornecido "como está", sem garantias de disponibilidade ininterrupta. Não nos responsabilizamos por eventuais imprecisões nas letras ou pelo uso indevido do conteúdo por parte dos usuários.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">7. Alterações nos Termos</h4>
                                    <p>Reservamo-nos o direito de atualizar estes termos a qualquer momento. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">8. Contato</h4>
                                    <p>Para dúvidas, solicitações de remoção de conteúdo ou qualquer questão relacionada a estes termos, entre em contato pelo e-mail <strong>contato@viniciusboschetti.com.br</strong>.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => setTermosModalAberto(false)}
                                className="w-full rounded-lg px-4 py-2 font-medium text-white transition-colors"
                                style={{ backgroundColor: '#C7AB65' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Política de Privacidade */}
            {privacidadeModalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={() => setPrivacidadeModalAberto(false)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6">
                            <h3 className="text-2xl font-bold text-gray-900">Política de Privacidade</h3>
                            <button
                                onClick={() => setPrivacidadeModalAberto(false)}
                                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <div className="space-y-5 text-sm text-gray-700">
                                <p className="text-xs text-gray-400">Última atualização: junho de 2026</p>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">1. Introdução</h4>
                                    <p>O <strong>Cânticos de Missa</strong> está comprometido com a proteção dos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>. Esta política explica como coletamos, usamos e protegemos suas informações.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">2. Dados Coletados</h4>
                                    <p>Coletamos apenas o mínimo necessário para o funcionamento da plataforma:</p>
                                    <ul className="list-inside list-disc space-y-1 pl-4">
                                        <li><strong>Cadastro:</strong> nome e endereço de e-mail</li>
                                        <li><strong>Uso:</strong> listas criadas e preferências de navegação dentro da plataforma</li>
                                    </ul>
                                    <p>Não coletamos dados de pagamento, documentos pessoais ou informações sensíveis.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">3. Finalidade do Tratamento</h4>
                                    <p>Seus dados são utilizados exclusivamente para:</p>
                                    <ul className="list-inside list-disc space-y-1 pl-4">
                                        <li>Permitir o acesso à plataforma e suas funcionalidades</li>
                                        <li>Salvar e gerenciar suas listas de músicas</li>
                                        <li>Comunicações relacionadas ao serviço, quando necessário</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">4. Compartilhamento de Dados</h4>
                                    <p>Seus dados <strong>não são vendidos, alugados ou compartilhados</strong> com terceiros para fins comerciais. Podemos compartilhá-los apenas quando exigido por lei ou por ordem judicial.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">5. Cookies</h4>
                                    <p>Utilizamos apenas cookies técnicos, estritamente necessários para autenticação e funcionamento da plataforma. Não utilizamos cookies de rastreamento ou publicidade.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">6. Segurança</h4>
                                    <p>Adotamos medidas técnicas de segurança para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">7. Seus Direitos (LGPD)</h4>
                                    <p>Conforme a LGPD, você tem direito a:</p>
                                    <ul className="list-inside list-disc space-y-1 pl-4">
                                        <li>Confirmar a existência de tratamento dos seus dados</li>
                                        <li>Acessar, corrigir ou atualizar seus dados</li>
                                        <li>Solicitar a exclusão dos seus dados pessoais</li>
                                        <li>Revogar o consentimento a qualquer momento</li>
                                        <li>Portabilidade dos dados</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">8. Como Exercer Seus Direitos</h4>
                                    <p>Para exercer qualquer um dos direitos acima ou tirar dúvidas sobre o tratamento dos seus dados, entre em contato conosco pelo e-mail <strong>contato@viniciusboschetti.com.br</strong>. Responderemos em até 15 dias úteis.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">9. Encarregado de Dados (DPO)</h4>
                                    <p>Responsável pelo tratamento de dados: <strong>Vinicius Chagas</strong>, desenvolvedor e mantenedor da plataforma.</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">10. Alterações nesta Política</h4>
                                    <p>Esta política pode ser atualizada periodicamente. Recomendamos revisitá-la ocasionalmente. Alterações significativas serão comunicadas através da plataforma.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => setPrivacidadeModalAberto(false)}
                                className="w-full rounded-lg px-4 py-2 font-medium text-white transition-colors"
                                style={{ backgroundColor: '#C7AB65' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Barra de Consentimento de Cookies */}
            {cookieConsentVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-600">
                                Utilizamos cookies para melhorar sua experiência e exibir anúncios relevantes via Google AdSense.
                                Ao continuar navegando, você concorda com nossa{' '}
                                <button
                                    onClick={() => setPrivacidadeModalAberto(true)}
                                    className="underline transition-colors"
                                    style={{ color: '#C7AB65' }}
                                >
                                    Política de Privacidade
                                </button>
                                .
                            </p>
                            <button
                                onClick={aceitarCookies}
                                className="flex-shrink-0 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors"
                                style={{ backgroundColor: '#C7AB65' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                            >
                                Aceitar e continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sobre */}
            {sobreModalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={() => setSobreModalAberto(false)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Sobre o Cânticos de Missa
                            </h3>
                            <button
                                onClick={() => setSobreModalAberto(false)}
                                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <div className="space-y-4 text-gray-700">
                                <p className="text-lg">
                                    Olá! Meu nome é <strong>Vinicius Chagas</strong> e
                                    criei este site com muito carinho para
                                    facilitar a vida de quem participa e organiza
                                    as celebrações litúrgicas.
                                </p>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">
                                        Por que criei o Cânticos de Missa?
                                    </h4>
                                    <p>
                                        Como católico praticante e desenvolvedor,
                                        percebi que muitas pessoas tinham
                                        dificuldade em encontrar as letras dos
                                        cânticos durante a missa ou ao preparar as
                                        celebrações. Havia a necessidade de uma
                                        ferramenta simples, organizada e acessível
                                        para consultar o repertório completo do
                                        Hinário Litúrgico da CNBB.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">
                                        Objetivo do Projeto
                                    </h4>
                                    <p>
                                        Este site foi desenvolvido para servir a
                                        comunidade católica, oferecendo:
                                    </p>
                                    <ul className="list-inside list-disc space-y-2 pl-4">
                                        <li>
                                            Acesso rápido e fácil às letras dos
                                            cânticos
                                        </li>
                                        <li>
                                            Organização por temas litúrgicos
                                        </li>
                                        <li>
                                            Busca avançada por palavras-chave
                                        </li>
                                        <li>
                                            Possibilidade de criar listas
                                            personalizadas para cada celebração
                                        </li>
                                        <li>
                                            Compartilhamento fácil das listas com
                                            a equipe de liturgia
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">
                                        Gratuito e Sem Fins Lucrativos
                                    </h4>
                                    <p>
                                        Este projeto é totalmente gratuito e feito
                                        como serviço à comunidade. Não há
                                        interesses comerciais, apenas o desejo de
                                        facilitar a participação ativa nas
                                        celebrações litúrgicas.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">
                                        Apoie Este Projeto
                                    </h4>
                                    <p>
                                        Se este site está sendo útil para você e sua
                                        comunidade, considere fazer uma doação
                                        voluntária. Qualquer valor ajuda a manter o
                                        projeto funcionando e sempre gratuito para
                                        todos!
                                    </p>
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setMostrarQRCode(!mostrarQRCode)}
                                            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                                        >
                                            <Heart className="h-5 w-5" />
                                            {mostrarQRCode ? 'Fechar' : 'Doar via PIX'}
                                        </button>
                                    </div>
                                    {mostrarQRCode && (
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <p className="mb-3 text-center text-sm font-medium text-gray-700">
                                                Escaneie o QR Code com seu app de banco:
                                            </p>
                                            <div className="flex justify-center">
                                                {/* Substitua o src abaixo pelo caminho da sua imagem QR Code */}
                                                <img
                                                    src="/images/qrcode-pix.png"
                                                    alt="QR Code PIX"
                                                    className="h-64 w-64 rounded-lg border-2 border-gray-200"
                                                />
                                            </div>
                                            <p className="mt-3 text-center text-xs text-gray-600">
                                                Ou copie a chave PIX:
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value="d5b18a8e-481a-4e46-aaeb-32d64ead16ad"
                                                    readOnly
                                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('d5b18a8e-481a-4e46-aaeb-32d64ead16ad');
                                                        alert('Chave PIX copiada!');
                                                    }}
                                                    className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                                                    style={{ backgroundColor: '#C7AB65' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                                                >
                                                    Copiar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg p-4" style={{ backgroundColor: '#F5F0E8' }}>
                                    <p className="text-center text-sm italic" style={{ color: '#8B7A45' }}>
                                        "Cantai ao Senhor um cântico novo, cantai
                                        ao Senhor, terra inteira!" - Salmo 96:1
                                    </p>
                                </div>

                                <p className="text-center text-sm text-gray-600">
                                    Que este site possa ajudar a elevar nossos
                                    corações em louvor e oração!
                                </p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => setSobreModalAberto(false)}
                                className="w-full rounded-lg px-4 py-2 font-medium text-white transition-colors"
                                style={{ backgroundColor: '#C7AB65' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B89B55'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7AB65'}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
