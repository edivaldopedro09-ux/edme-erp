import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import {
  Building2,
  Plus,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  X,
  Briefcase,
  Phone,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCompany } from '../context/CompanyContext';

const PLAN_OPTIONS = [
  { id: 'DEMO_3D', label: 'Demo Gratuita', duration: '3 Dias', badge: 'Teste' },
  { id: '1_MONTH', label: 'Mensal', duration: '1 Mês', badge: null },
  { id: '3_MONTHS', label: 'Trimestral', duration: '3 Meses', badge: null },
  { id: '6_MONTHS', label: 'Semestral', duration: '6 Meses', badge: 'Popular' },
  { id: '1_YEAR', label: 'Anual', duration: '1 Ano', badge: 'Melhor Valor' },
];

export default function MyCompanies() {
  const { companies, activeCompany, fetchCompanies, selectCompany } = useCompany();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nif: '',
    sector: 'Comércio Geral',
    phone: '',
    plan: 'DEMO_3D',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/companies', form);
      await fetchCompanies();
      selectCompany(data.company);
      setShowModal(false);
      setForm({ name: '', nif: '', sector: 'Comércio Geral', phone: '', plan: 'DEMO_3D' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCompany = (company) => {
    selectCompany(company);
    navigate('/dashboard');
  };

  const usagePercentage = Math.min(100, (companies.length / 5) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* CABEÇALHO DO HUB DE EMPRESAS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#0B3B60]">Hub Multi-Empresa</h1>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-cyan-50 text-[#00A8C6] border border-cyan-100">
                {companies.length} de 5 empresas
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Gerencie até 5 empresas de forma totalmente isolada, com subscrições e contabilidade independentes.
            </p>

            {/* Barra de Progresso de Capacidade */}
            <div className="w-full max-w-xs pt-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B3B60] to-[#00A8C6] rounded-full transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {companies.length < 5 ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A8C6] to-[#008da6] hover:brightness-105 text-white px-6 py-3.5 rounded-xl text-sm font-extrabold shadow-md shadow-cyan-500/20 transition cursor-pointer shrink-0"
            >
              <Plus size={19} /> Registar Nova Empresa
            </button>
          ) : (
            <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              Limite máximo de 5 empresas atingido nesta conta.
            </div>
          )}
        </div>

        {/* LISTA DE EMPRESAS */}
        {companies.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-[#00A8C6] flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-[#0B3B60] mb-2">
              Nenhuma empresa registada ainda
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Crie a sua primeira empresa agora mesmo com 3 dias de acesso gratuito (Demo) e explore todos os módulos.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#F39200] hover:bg-[#e08200] text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-md transition cursor-pointer"
            >
              <Plus size={18} /> Criar Primeira Empresa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {companies.map((comp) => {
              const isExpired =
                comp.subscription.status === 'EXPIRED' ||
                new Date() > new Date(comp.subscription.expiresAt);
              const isSelected = activeCompany?._id === comp._id;
              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(comp.subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
                )
              );

              return (
                <div
                  key={comp._id}
                  className={`bg-white rounded-2xl p-6 shadow-2xs border transition-all flex flex-col justify-between group hover:shadow-md ${
                    isSelected
                      ? 'border-[#00A8C6] ring-2 ring-[#00A8C6]/15'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3B60] to-[#008da6] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                        {comp.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200/80">
                            <ShieldAlert size={13} /> Expirado
                          </span>
                        ) : comp.subscription.status === 'PENDING_PAYMENT' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock size={13} /> Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 size={13} /> Ativo ({daysLeft}d)
                          </span>
                        )}

                        {isSelected && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00A8C6]">
                            ● Empresa Ativa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dados da Empresa */}
                    <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-[#0B3B60] transition-colors line-clamp-1">
                      {comp.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5 mb-4">
                      NIF: {comp.nif} • {comp.sector || 'Comércio Geral'}
                    </p>

                    {/* Box de Subscrição */}
                    <div className="text-xs text-slate-600 bg-slate-50/90 border border-slate-100 p-3.5 rounded-xl space-y-1.5 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Plano Atual:</span>
                        <span className="font-extrabold text-[#0B3B60]">
                          {comp.subscription.plan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar size={12} /> Validade:
                        </span>
                        <span className="font-bold text-slate-700">
                          {new Date(comp.subscription.expiresAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnterCompany(comp)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#00A8C6] hover:bg-[#008da6] text-white shadow-sm'
                        : 'bg-[#0B3B60] hover:bg-[#082a45] text-white'
                    }`}
                  >
                    {isSelected ? 'Continuar no Painel' : 'Aceder ao Painel'} <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL DE NOVA EMPRESA */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black text-[#0B3B60]">Registar Nova Empresa</h2>
                  <p className="text-xs text-slate-400">
                    Configure os dados fiscais e escolha o plano de subscrição
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="p-3.5 mb-4 text-xs sm:text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Designação Social / Nome da Empresa *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 text-slate-400" size={17} />
                    <input
                      required
                      type="text"
                      placeholder="Ex: EDME Solutions, Lda"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">NIF *</label>
                    <input
                      required
                      type="text"
                      placeholder="5000XXXXXX"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.nif}
                      onChange={(e) => setForm({ ...form, nif: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                      <input
                        type="tel"
                        placeholder="+244 9XX XXX XXX"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Setor de Atividade
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <select
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.sector}
                      onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    >
                      <option value="Comércio Geral">Comércio Geral</option>
                      <option value="Tecnologia e Serviços">Tecnologia e Serviços</option>
                      <option value="Restauração e Hotelaria">Restauração e Hotelaria</option>
                      <option value="Construção Civil">Construção Civil</option>
                      <option value="Saúde e Farmácia">Saúde e Farmácia</option>
                      <option value="Outro">Outro Setor</option>
                    </select>
                  </div>
                </div>

                {/* SELETOR VISUAL DE PLANOS */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#F39200]" /> Escolha o Plano de Subscrição *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PLAN_OPTIONS.map((plan) => {
                      const active = form.plan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setForm({ ...form, plan: plan.id })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer relative ${
                            active
                              ? 'border-[#00A8C6] bg-cyan-50/70 ring-2 ring-[#00A8C6]/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {plan.badge && (
                            <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#F39200] text-white mb-1">
                              {plan.badge}
                            </span>
                          )}
                          <p className="text-xs font-extrabold text-[#0B3B60]">{plan.label}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{plan.duration}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 text-sm bg-gradient-to-r from-[#F39200] to-[#e08200] hover:brightness-105 text-white font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'A criar...' : 'Criar Empresa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}