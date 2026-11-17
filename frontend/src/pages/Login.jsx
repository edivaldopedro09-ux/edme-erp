import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/companies');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Verifique o e-mail e a palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc]">
      {/* COLUNA ESQUERDA: BRANDING & DESTAQUES (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#06233b] via-[#0B3B60] to-[#008da6] text-white p-12 flex-col justify-between">
        {/* Efeitos de luz decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#00A8C6]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#F39200]/20 blur-3xl pointer-events-none" />

        {/* Logotipo Topo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/logo.jpg"
            alt="EDME ERP"
            className="h-12 w-12 object-cover rounded-2xl shadow-lg ring-2 ring-white/20"
          />
          <div>
            <span className="font-extrabold text-2xl tracking-tight">
              EDME <span className="text-[#00A8C6]">ERP</span>
            </span>
            <p className="text-xs text-cyan-200/80 font-medium">
              Gestão completa, vendas sem barreiras
            </p>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-cyan-200">
            <Sparkles size={14} className="text-[#F39200]" /> Acesso Seguro ao Ecossistema
          </div>

          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Bem-vindo de volta ao centro de comando das suas <span className="text-[#00A8C6]">empresas</span>.
          </h2>

          <p className="text-sm text-cyan-100/80 leading-relaxed">
            Acompanhe a faturação em tempo real, feche o caixa com precisão e mantenha a contabilidade e o inventário sempre sincronizados.
          </p>

          <div className="space-y-3.5 pt-2">
            {[
              'Alternância instantânea entre até 5 empresas',
              'PDV ágil com emissão de faturas e baixa automática de stock',
              'Controlo bancário, tesouraria e diário contabilístico integrado',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm font-medium text-white/95">
                <div className="p-1 rounded-full bg-[#00A8C6]/20 text-[#00A8C6]">
                  <CheckCircle2 size={16} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10 flex items-center justify-between text-xs text-cyan-200/60 border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} EDME Solutions</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Ligação Encriptada SSL/JWT
          </span>
        </div>
      </div>

      {/* COLUNA DIREITA: FORMULÁRIO DE LOGIN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/70 border border-slate-200/80">
          {/* Cabeçalho */}
          <div className="text-center lg:text-left mb-8">
            <img
              src="/logo.jpg"
              alt="EDME ERP"
              className="h-14 w-14 mx-auto lg:mx-0 rounded-2xl mb-4 shadow-md lg:hidden"
            />
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3B60] tracking-tight">
              Iniciar Sessão
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Introduza as suas credenciais para aceder ao painel de gestão.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl font-semibold flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="exemplo@empresa.co.ao"
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30 focus:border-[#00A8C6] transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Palavra-passe *
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30 focus:border-[#00A8C6] transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0B3B60] to-[#008da6] hover:brightness-105 text-white font-extrabold text-sm transition shadow-lg shadow-cyan-900/20 cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                'A autenticar...'
              ) : (
                <>
                  Entrar na Conta <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Ainda não tem uma conta no EDME ERP?{' '}
              <Link
                to="/register"
                className="text-[#F39200] hover:text-[#d98200] font-extrabold transition"
              >
                Criar Conta Gratuita
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}