import AppLayout from '@/components/app-layout';
import { Link } from '@inertiajs/react';
import { Heart, List, Music, Search, Share2 } from 'lucide-react';
import { useState } from 'react';

export default function Welcome() {
    const [mostrarQRCode, setMostrarQRCode] = useState(false);

    const features = [
        {
            icon: Music,
            title: 'Catálogo Completo',
            description:
                'Acesso a centenas de músicas organizadas por número, como no livro Louvemos o Senhor',
        },
        {
            icon: Search,
            title: 'Busca Inteligente',
            description:
                'Encontre músicas por número, título, tema ou até mesmo trechos da letra',
        },
        {
            icon: List,
            title: 'Crie suas Listas',
            description:
                'Monte a sequência de músicas para sua missa de forma rápida e organizada',
        },
        {
            icon: Share2,
            title: 'Compartilhe Facilmente',
            description:
                'Gere um link e compartilhe com seu grupo sem necessidade de login',
        },
    ];

    return (
        <AppLayout>
            {/* Hero Section */}
            <div className="py-12 text-center md:py-20">
                <div className="mb-6 flex justify-center">
                    <img
                        src="/images/logo-2.png"
                        alt="Cânticos de Missa"
                        className="h-56 w-56"
                    />
                </div>
                <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-6xl">
                    Cânticos de Missa
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 md:text-2xl">
                    Todas as letras das músicas da missa na palma da sua mão
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/musicas"
                        className="rounded-lg px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:shadow-xl"
                        style={{ backgroundColor: '#C7AB65' }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#B89B55')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = '#C7AB65')
                        }
                    >
                        Ver Músicas
                    </Link>
                    <Link
                        href="/temas"
                        className="rounded-lg border-2 bg-white px-8 py-4 font-semibold transition-colors"
                        style={{ borderColor: '#C7AB65', color: '#C7AB65' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F5F0E8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                        }}
                    >
                        Explorar Temas
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                    >
                        <feature.icon
                            className="mb-4 h-12 w-12"
                            style={{ color: '#C7AB65' }}
                        />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div
                className="mt-16 rounded-2xl p-8 text-center text-white md:p-12"
                style={{
                    background:
                        'linear-gradient(135deg, #C7AB65 0%, #B89B55 100%)',
                }}
            >
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Organize suas Missas com Facilidade
                </h2>
                <p className="mb-8 text-lg opacity-90 md:text-xl">
                    Cadastre-se gratuitamente e comece a criar suas listas de
                    músicas hoje mesmo
                </p>
                <Link
                    href="/register"
                    className="inline-block rounded-lg bg-white px-8 py-4 font-semibold shadow-lg transition-colors hover:bg-gray-100"
                    style={{ color: '#C7AB65' }}
                >
                    Criar Conta Grátis
                </Link>
            </div>

            {/* How it Works */}
            <div className="mt-16">
                <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
                    Como Funciona
                </h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                            style={{
                                backgroundColor: '#F5F0E8',
                                color: '#C7AB65',
                            }}
                        >
                            1
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                            Explore o Catálogo
                        </h3>
                        <p className="text-gray-600">
                            Navegue por todas as músicas organizadas por número
                            ou tema
                        </p>
                    </div>
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                            style={{
                                backgroundColor: '#F5F0E8',
                                color: '#C7AB65',
                            }}
                        >
                            2
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                            Crie sua Lista
                        </h3>
                        <p className="text-gray-600">
                            Monte a sequência de músicas para sua missa
                        </p>
                    </div>
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                            style={{
                                backgroundColor: '#F5F0E8',
                                color: '#C7AB65',
                            }}
                        >
                            3
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                            Compartilhe
                        </h3>
                        <p className="text-gray-600">
                            Envie o link para seu grupo pelo WhatsApp
                        </p>
                    </div>
                </div>
            </div>

            {/* Donation Section */}
            <div className="mt-16">
                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-lg md:p-12">
                    <div className="text-center">
                        <Heart className="mx-auto mb-4 h-12 w-12 text-green-600" />
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">
                            Apoie Este Projeto
                        </h2>
                        <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-700">
                            Este site é totalmente gratuito e sem fins
                            lucrativos. Se está sendo útil para você e sua
                            comunidade, considere fazer uma doação voluntária.
                            Qualquer valor ajuda a manter o projeto funcionando!
                        </p>
                        <button
                            onClick={() => setMostrarQRCode(!mostrarQRCode)}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
                        >
                            <Heart className="h-5 w-5" />
                            {mostrarQRCode ? 'Fechar' : 'Doar via PIX'}
                        </button>

                        {mostrarQRCode && (
                            <div className="mx-auto mt-8 max-w-md rounded-xl bg-white p-6 shadow-lg">
                                <p className="mb-4 text-center font-medium text-gray-700">
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
                                <p className="mt-4 text-center text-sm text-gray-600">
                                    Ou copie a chave PIX:
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value="d5b18a8e-481a-4e46-aaeb-32d64ead16ad"
                                        readOnly
                                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                'd5b18a8e-481a-4e46-aaeb-32d64ead16ad',
                                            );
                                            alert('Chave PIX copiada!');
                                        }}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                                        style={{ backgroundColor: '#C7AB65' }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                '#B89B55')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                '#C7AB65')
                                        }
                                    >
                                        Copiar
                                    </button>
                                </div>
                                <p className="mt-4 text-center text-xs text-gray-500">
                                    Muito obrigado pelo seu apoio! 🙏
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
