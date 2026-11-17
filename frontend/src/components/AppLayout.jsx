import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Landmark,
  Building2,
  LogOut,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { companies, activeCompany, selectCompany } = useCompany();
  const { logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Vendas & PDV', path: '/sales', icon: ShoppingCart, badge: 'Rápido' },
    { name: 'Produtos & Stock', path: '/products', icon: Package, badge: null },
    { name: 'Faturas & Caixa', path: '/invoices', icon: FileText, badge: null },
    { name: 'Contabilidade & Bancos', path: '/finance', icon: Landmark, badge: null },
    { name: 'Minhas Empresas', path: '/companies', icon: Building2, badge: `${companies.length}/5` },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* TOPBAR GLASSMORPHISM */}
      <header className="sticky top-0 z-40 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo + Marca */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="EDME ERP"
                className="h-10 w-10 object-cover rounded-xl shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#0B3B60]">
                  EDME <span className="text-[#00A8C6]">ERP</span>
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 -mt-1">
                Gestão completa, vendas sem barreiras
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1"></div>

          {/* SELETOR DE EMPRESA ESTILO STRIPE */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0B3B60] to-[#00A8C6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {activeCompany ? activeCompany.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="text-left max-w-[130px] sm:max-w-[200px]">
                <p className="font-bold text-slate-800 truncate leading-tight">
                  {activeCompany ? activeCompany.name : 'Escolher Empresa'}
                </p>
              </div>
              {activeCompany && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-[#F39200] border border-amber-500/20">
                  {activeCompany.subscription.plan}
                </span>
              )}
              <ChevronDown size={15} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      As Suas Empresas
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {companies.length} de 5
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                    {companies.map((c) => {
                      const isSelected = activeCompany?._id === c._id;
                      return (
                        <button
                          key={c._id}
                          onClick={() => {
                            selectCompany(c);
                            setDropdownOpen(false);
                            navigate('/dashboard');
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#0B3B60] text-white shadow-sm'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="font-bold truncate">{c.name}</p>
                            <p
                              className={`text-[11px] ${
                                isSelected ? 'text-cyan-200' : 'text-slate-400'
                              }`}
                            >
                              NIF: {c.nif} • {c.subscription.plan}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-[#00A8C6] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 p-2 mt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/companies');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#0B3B60] bg-slate-100 hover:bg-[#00A8C6] hover:text-white rounded-xl transition cursor-pointer"
                    >
                      <PlusCircle size={15} /> Gerir ou Adicionar Empresa
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* LADO DIREITO: ATALHO PDV + PERFIL */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales')}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#F39200] to-[#e08200] hover:brightness-105 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-orange-500/20 transition cursor-pointer"
          >
            <ShoppingCart size={15} /> Nova Venda (PDV)
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-[#0B3B60] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Terminar Sessão"
            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CORPO PRINCIPAL */}
      <div className="flex flex-1 w-full">
        {/* SIDEBAR DESKTOP RECOLHÍVEL */}
        <aside
          className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200/80 transition-all duration-300 shrink-0 ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="p-3 space-y-1.5 sticky top-20">
            {!collapsed && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Menu Operacional
              </p>
            )}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.name : ''}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#0B3B60] text-white shadow-md shadow-slate-900/10'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#0B3B60]'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon
                      size={19}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#00A8C6]' : 'text-slate-400 group-hover:text-[#0B3B60]'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#00A8C6]/20 text-cyan-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RODAPÉ DA SIDEBAR (COLAPSAR) */}
          <div className="p-3 border-t border-slate-100">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-[#0B3B60] transition cursor-pointer"
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <>
                  <PanelLeftClose size={18} />
                  <span>Recolher Menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* DRAWER MOBILE */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden flex">
            <div className="w-72 bg-white h-full p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.jpg" alt="EDME ERP" className="h-9 w-9 rounded-lg" />
                    <span className="font-extrabold text-[#0B3B60]">EDME ERP</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? 'bg-[#0B3B60] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-[#00A8C6]' : 'text-slate-400'} />
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B3B60] mb-1">
                  <Sparkles size={14} className="text-[#F39200]" /> EDME Cloud SaaS
                </div>
                <p className="text-[11px] text-slate-500">
                  Gestão multi-empresa sincronizada em tempo real.
                </p>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* ÁREA PRINCIPAL DE CONTEÚDO (100% FLUIDA) */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="w-full max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}