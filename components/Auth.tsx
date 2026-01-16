import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Lock, Mail, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Verifique seu e-mail para o link de confirmação!' });
            }
        } catch (error: any) {
            let errorMsg = error.message;
            if (errorMsg === 'Invalid login credentials') {
                errorMsg = 'Credenciais de login inválidas.';
            } else if (errorMsg === 'User already registered') {
                errorMsg = 'Usuário já cadastrado.';
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 selection:bg-slate-900 selection:text-white font-sans">
            {/* Branding */}
            <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tighter mb-2">
                    BSB<span className="text-slate-400 font-light">Core</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm tracking-wide">SISTEMA OPERACIONAL & FINANCEIRO</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
                <div className="p-8 sm:p-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {isLogin ? 'Acesse sua conta' : 'Criar nova conta'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {isLogin
                                ? 'Insira suas credenciais corporativas abaixo.'
                                : 'Preencha os dados abaixo para começar seu cadastro.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                                E-mail Corporativo
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white outline-none transition-all duration-200 placeholder:text-slate-300"
                                    placeholder="admin@bsbmedia.com"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                                Senha de Acesso
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 focus:bg-white outline-none transition-all duration-200 placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-start gap-3 ${message.type === 'error'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${message.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                {message.text}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        {/* Entrar no Sistema */}
                                        {isLogin ? (
                                            <>Entrar no Sistema <ArrowRight size={18} className="ml-2" /></>
                                        ) : (
                                            <>Cadastrar Usuário <UserPlus size={18} className="ml-2" /></>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            {isLogin ? "Não possui uma conta?" : "Já possui registro?"}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setMessage(null);
                                }}
                                className="ml-2 text-slate-900 font-bold hover:underline underline-offset-4 decoration-2"
                            >
                                {isLogin ? 'Solicitar Acesso' : 'Fazer Login'}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100/50 text-center">
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                        Acesso Restrito à Equipe BSB Media
                    </p>
                </div>
            </div>
        </div>
    );
}
