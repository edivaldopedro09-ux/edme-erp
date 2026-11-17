import { useState, useEffect } from 'react';
import { Lock, CheckCircle2, AlertTriangle, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useCompany } from '../context/CompanyContext';

const PLANS_PRICING = [
  { id: '1_MONTH', name: 'Plano Mensal', duration: '30 dias', price: '15.000', badge: null },
  { id: '3_MONTHS', name: 'Plano Trimestral', duration: '3 meses', price: '40.000', badge: null },
  { id: '6_MONTHS', name: 'Plano Semestral', duration: '6 meses', price: '75.000', badge: 'Popular' },
  { id: '1_YEAR', name: 'Plano Anual', duration: '12 meses', price: '135.000', badge: 'Melhor Valor' },
];

export default function PlanLockModal() {
  const [lockData, setLockData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('1_MONTH');
  const [loading, setLoading] = useState(false);
  const { fetchCompanies, selectCompany } = useCompany();

  useEffect(() => {
    const handleLock = (e) => setLockData(e.detail);
    window.addEventListener('EDME_PLAN_LOCKED', handleLock);
    return () => window.removeEventListener('EDME_PLAN_LOCKED', handleLock);
  }, []);

  if (!lockData) return null;

  const handleRenew = async () => {
    setLoading(true);
    try {
      const { data } = await api.put(`/companies/${lockData.company._id}/renew`, {
        plan: selectedPlan,
      });
      await fetchCompanies();
      selectCompany(data.company);
      setLockData(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao processar renovação de plano.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div className="p-3.5 bg-orange-50 text-[#F39200] rounded-2xl shadow-xs shrink-0">
            <Lock size={26} />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                Subscrição Expirada
              </span>
            </div>
            <h2 className="text-xl font-black text-[#0B3B60] mt-1 truncate">
              {lockData.company?.name}
            </h2>
            <p className="text-xs text-slate-400">NIF: {lockData.company?.nif}</p>
          </div>
        </div>

        {/* Mensagem de Aviso */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <AlertTriangle size={18} className="text-[#F39200] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {lockData.message || 'O período de acesso desta empresa terminou. Renove a subscrição para continuar a emitir faturas e gerir o inventário.'}
          </p>
        </div>

        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#00A8C6]" /> Selecione um plano para desbloquear:
        </p>

        {/* Lista de Planos */}
        <div className="space-y-2.5 mb-6">
          {PLANS_PRICING.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#00A8C6] bg-cyan-50/70 ring-2 ring-[#00A8C6]/15 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#00A8C6] text-white' : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-sm">{p.name}</span>
                      {p.badge && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#F39200] text-white">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Duração: {p.duration}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#0B3B60]">{p.price}</span>{' '}
                  <span className="text-xs font-bold text-slate-400">Kz</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRenew}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00A8C6] to-[#008da6] hover:brightness-105 text-white font-extrabold text-sm transition shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            'A processar ativação...'
          ) : (
            <>
              Confirmar Pagamento e Desbloquear <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}