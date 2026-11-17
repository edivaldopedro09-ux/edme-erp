import { useState } from 'react';
import {
  LogOut,
  ChevronDown,
  ShoppingCart,
  CheckCircle2,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleMobileMenu, mobileMenuOpen }) {
  const { companies, activeCompany, selectCompany } = useCompany();
  const { logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all print:hidden">
      {/* LADO ESQUERDO: LOGO + SELETOR MULTI-EMPRESA */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        {/* Logotipo e Marca */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src="/logo.jpg"
              alt="EDME ERP"
              className="h-10 w-10 object-cover rounded-xl shadow-xs ring-1 ring-slate-200 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-lg tracking-tight text-[#0B3B60]">
              EDME <span className="text-[#00A8C6]">ERP</span>
            </span>
            <p className="text-[10px] font-medium text-slate-400 -mt-1">
              Gestão completa, vendas sem barreiras
            </p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />

        {/* Seletor Rápido de Empresa */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0B3B60] to-[#00A8C6] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              {activeCompany ? activeCompany.name.charAt(0).toUpperCase() : 'E'}
            </div>

            <span className="font-bold text-slate-800 max-w-[130px] sm:max-w-[200px] truncate">
              {activeCompany ? activeCompany.name : 'Selecionar Empresa'}
            </span>

            {activeCompany && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-[#F39200] border border-amber-500/20">
                {activeCompany.subscription.plan}
              </span>
            )}

            <ChevronDown size={15} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay transparente para fechar ao clicar fora */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />

              <div className="absolute left-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    As Minhas Empresas
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
                            ? 'bg-[#0B3B60] text-white shadow-xs'
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
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-[#00A8C6] shrink-0" />
                        )}
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
                    <PlusCircle size={15} /> Gerir ou Adicionar Empresas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* LADO DIREITO: ATALHO PDV + PERFIL + LOGOUT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sales')}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#F39200] to-[#e08200] hover:brightness-105 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs shadow-orange-500/20 transition cursor-pointer"
        >
          <ShoppingCart size={15} /> Nova Venda (PDV)
        </button>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-[#0B3B60] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            {user?.name?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Gestor Online
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
  );
}