import AppLayout from '@/components/app-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        publica: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/listas');
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/listas"
                        className="mb-4 inline-flex items-center transition-colors"
                        style={{ color: '#C7AB65' }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = '#B89B55')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = '#C7AB65')
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para minhas listas
                    </Link>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        Nova Lista de Músicas
                    </h1>
                    <p className="text-gray-600">
                        Crie uma lista personalizada para sua missa
                    </p>
                </div>

                {/* Formulário */}
                <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nome */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Nome da Lista *
                            </label>
                            <input
                                type="text"
                                value={data.nome}
                                onChange={(e) =>
                                    setData('nome', e.target.value)
                                }
                                placeholder="Ex: Missa Domingo 15/10"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                style={{ borderColor: '#d1d5db' }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor =
                                        '#C7AB65';
                                    e.currentTarget.style.outline =
                                        '2px solid #C7AB65';
                                    e.currentTarget.style.outlineOffset = '2px';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor =
                                        '#d1d5db';
                                    e.currentTarget.style.outline = 'none';
                                }}
                                required
                            />
                            {errors.nome && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.nome}
                                </p>
                            )}
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    backgroundColor: processing
                                        ? '#9CA3AF'
                                        : '#C7AB65',
                                }}
                                onMouseEnter={(e) => {
                                    if (!processing)
                                        e.currentTarget.style.backgroundColor =
                                            '#B89B55';
                                }}
                                onMouseLeave={(e) => {
                                    if (!processing)
                                        e.currentTarget.style.backgroundColor =
                                            '#C7AB65';
                                }}
                            >
                                <Save className="h-5 w-5" />
                                {processing ? 'Criando...' : 'Criar Lista'}
                            </button>
                            <Link
                                href="/listas"
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                            >
                                Cancelar
                            </Link>
                        </div>

                        {/* Info */}
                        <div
                            className="rounded-lg border p-4"
                            style={{
                                borderColor: '#E5DFD0',
                                backgroundColor: '#F5F0E8',
                            }}
                        >
                            <p className="text-sm" style={{ color: '#8B7A45' }}>
                                💡 <strong>Dica:</strong> Após criar a lista,
                                você poderá adicionar as músicas e compartilhar
                                com seu grupo pelo WhatsApp.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
