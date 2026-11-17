import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Landmark,
  Building2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companies } = useCompany();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vendas & PDV', path: '/sales', icon: ShoppingCart },
    { name: 'Produtos & Stock', path: '/products', icon: Package },
    { name: 'Faturas & Caixa', path: '/invoices', icon: FileText },
    { name: 'Contabilidade & Bancos', path: '/finance', icon: Landmark },
    { name: 'Hub de Empresas', path: '/companies', icon: Building2, badge: `${companies.length}/5` },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-3 hidden md:flex flex-col justify-between shrink-0">
      <nav className="space-y-1.5 sticky top-20">
        <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Menu Operacional
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#0B3B60] text-white shadow-md shadow-slate-900/10'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#0B3B60]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#00A8C6]' : 'text-slate-400 group-hover:text-[#0B3B60]'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#00A8C6]/20 text-cyan-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Caixa Informativa no Fundo da Sidebar */}
      <div className="p-3 bg-gradient-to-br from-slate-50 to-cyan-50/40 rounded-2xl border border-slate-200/60 mt-auto">
        <p className="text-[11px] font-extrabold text-[#0B3B60] mb-0.5">EDME Cloud SaaS</p>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Sincronização multitenant ativa e segura.
        </p>
      </div>
    </aside>
  );
}