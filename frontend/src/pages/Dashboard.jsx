import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useCompany } from '../context/CompanyContext';
import api from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  Plus,
  FileText,
  Calendar,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { activeCompany } = useCompany();
  const [stats, setStats] = useState({
    totalSales: 0,
    revenue: 0,
    productsCount: 0,
    lowStockCount: 0,
    recentSales: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeCompany) return;
    const fetchData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          api.get('/sales'),
          api.get('/products'),
        ]);

        const totalRevenue = salesRes.data.reduce((acc, s) => acc + s.totalAmount, 0);
        const lowStockItems = productsRes.data.filter((p) => p.stock <= 5).length;

        setStats({
          totalSales: salesRes.data.length,
          revenue: totalRevenue,
          productsCount: productsRes.data.length,
          lowStockCount: lowStockItems,
          recentSales: salesRes.data.slice(0, 5),
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard', error);
      }
    };
    fetchData();
  }, [activeCompany]);

  if (!activeCompany) {
    return (
      <AppLayout>
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200 max-w-lg mx-auto mt-12">
          <h2 className="text-2xl font-extrabold text-[#0B3B60] mb-2">
            Bem-vindo ao EDME ERP
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Selecione ou crie a sua primeira empresa para desbloquear todos os módulos de gestão.
          </p>
          <button
            onClick={() => navigate('/companies')}
            className="bg-[#00A8C6] hover:bg-[#008da6] text-white px-6 py-3 rounded-xl font-bold shadow-md transition cursor-pointer"
          >
            Criar ou Selecionar Empresa
          </button>
        </div>
      </AppLayout>
    );
  }

  // Cálculo de dias restantes do plano
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(activeCompany.subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B3B60] via-[#0d4875] to-[#008da6] p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-cyan-200 mb-3 border border-white/10">
                <ShieldCheck size={14} className="text-[#F39200]" />
                NIF: {activeCompany.nif} • {activeCompany.sector}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeCompany.name}
              </h1>
              <p className="text-cyan-100/90 text-sm mt-1">
                Resumo financeiro, vendas e inventário sincronizados em tempo real.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition cursor-pointer"
              >
                <Plus size={16} /> Novo Produto
              </button>
              <button
                onClick={() => navigate('/sales')}
                className="flex items-center gap-2 bg-[#F39200] hover:bg-[#e08200] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-900/30 transition cursor-pointer"
              >
                <ShoppingCart size={16} /> Abrir PDV
              </button>
            </div>
          </div>

          {/* Elemento decorativo de fundo */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#00A8C6]/20 blur-2xl pointer-events-none"></div>
        </div>

        {/* ALERTA DE STOCK BAIXO */}
        {stats.lowStockCount > 0 && (
          <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-[#F39200] text-white rounded-xl shadow-xs shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Atenção ao Inventário ({stats.lowStockCount} artigos críticos)
                </h4>
                <p className="text-xs text-slate-600">
                  Existem produtos com 5 ou menos unidades em armazém. Reponha o stock para não travar vendas.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl transition shrink-0 cursor-pointer"
            >
              Gerir Stock →
            </button>
          </div>
        )}

        {/* GRID DE KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Faturação Total
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-50 text-[#00A8C6] group-hover:scale-110 transition-transform">
                <DollarSign size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B3B60]">
              {stats.revenue.toLocaleString()} <span className="text-sm font-bold text-slate-400">Kz</span>
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp size={14} /> Receita acumulada
            </p>
          </div>

          {/* KPI 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vendas Realizadas
              </span>
              <div className="p-2.5 rounded-xl bg-orange-50 text-[#F39200] group-hover:scale-110 transition-transform">
                <ShoppingBag size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B3B60]">{stats.totalSales}</h3>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Faturas emitidas no sistema
            </p>
          </div>

          {/* KPI 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Catálogo Ativo
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <Package size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B3B60]">{stats.productsCount}</h3>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Produtos e serviços registados
            </p>
          </div>

          {/* KPI 4: ASSINATURA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Licença ({activeCompany.subscription.plan})
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B3B60]">
              {daysLeft} <span className="text-sm font-bold text-slate-400">dias restantes</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Expira em {new Date(activeCompany.subscription.expiresAt).toLocaleDateString('pt-PT')}
            </p>
          </div>
        </div>

        {/* ÚLTIMAS VENDAS E ATALHOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-[#0B3B60] text-base flex items-center gap-2">
                <FileText size={18} className="text-[#00A8C6]" /> Últimas Vendas Emitidas
              </h3>
              <button
                onClick={() => navigate('/invoices')}
                className="text-xs font-bold text-[#00A8C6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver todas <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                    <th className="py-3 px-6">Fatura</th>
                    <th className="py-3 px-6">Cliente</th>
                    <th className="py-3 px-6">Pagamento</th>
                    <th className="py-3 px-6 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {stats.recentSales.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-400 text-xs">
                        Ainda não existem vendas registadas hoje.
                      </td>
                    </tr>
                  ) : (
                    stats.recentSales.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-6 font-bold text-[#0B3B60]">
                          {s.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-6 text-slate-700">{s.customerName}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">
                            {s.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-extrabold text-emerald-600">
                          {s.totalAmount.toLocaleString()} Kz
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAINEL DE ACESSO RÁPIDO */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-[#0B3B60] text-base mb-1">
                Operações Rápidas
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Aceda diretamente às funções mais usadas no dia a dia.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/sales')}
                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#00A8C6] hover:bg-cyan-50/40 flex items-center justify-between transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00A8C6]/10 text-[#00A8C6]">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Faturar no PDV</p>
                      <p className="text-[11px] text-slate-400">Venda rápida com baixa de stock</p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#00A8C6]" />
                </button>

                <button
                  onClick={() => navigate('/finance')}
                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#0B3B60] hover:bg-slate-50 flex items-center justify-between transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0B3B60]/10 text-[#0B3B60]">
                      <DollarSign size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Contabilidade & Bancos</p>
                      <p className="text-[11px] text-slate-400">Saldos, extratos e diário geral</p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0B3B60]" />
                </button>

                <button
                  onClick={() => navigate('/companies')}
                  className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#F39200] hover:bg-orange-50/40 flex items-center justify-between transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F39200]/10 text-[#F39200]">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Gerir Subscrições</p>
                      <p className="text-[11px] text-slate-400">Planos 3d, 1m, 3m, 6m e 1 ano</p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#F39200]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}