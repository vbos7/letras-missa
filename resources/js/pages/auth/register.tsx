import AppLayout from '@/components/app-layout';
import { useForm } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { FormEvent } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <AppLayout>
            <div className="mx-auto max-w-md py-12">
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <UserPlus className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Criar Conta
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Cadastre-se para criar e compartilhar suas listas
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Nome Completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                placeholder="Seu nome"
                                required
                                autoFocus
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                placeholder="seu@email.com"
                                required
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Confirmar Senha
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                                placeholder="Digite a senha novamente"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl disabled:opacity-50"
                        >
                            {processing ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <a
                                href="/login"
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Faça login
                            </a>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Voltar para o início
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
