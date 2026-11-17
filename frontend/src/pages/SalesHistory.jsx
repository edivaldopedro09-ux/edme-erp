import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useCompany } from '../context/CompanyContext';
import api from '../services/api';
import {
  FileText,
  Printer,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Search,
  X,
  TrendingUp,
  Receipt,
  Calendar
} from 'lucide-react';

export default function SalesHistory() {
  const { activeCompany } = useCompany();
  const [sales, setSales] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  useEffect(() => {
    if (!activeCompany) return;
    const fetchSales = async () => {
      try {
        const { data } = await api.get('/sales');
        setSales(data);
      } catch (error) {
        console.error('Erro ao carregar histórico de vendas:', error);
      }
    };
    fetchSales();
  }, [activeCompany]);

  // Totais automatizados por meio de pagamento
  const totalsByMethod = sales.reduce(
    (acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalAmount;
      acc.ALL += sale.totalAmount;
      return acc;
    },
    { DINHEIRO: 0, TPA_MULTICAIXA: 0, TRANSFERENCIA: 0, ALL: 0 }
  );

  // Filtragem combinada (Pesquisa + Meio de Pagamento)
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customerNif && sale.customerNif.includes(searchTerm));
    const matchesMethod = methodFilter === 'ALL' ? true : sale.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getMethodBadge = (method) => {
    switch (method) {
      case 'DINHEIRO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <Banknote size={13} /> Dinheiro
          </span>
        );
      case 'TPA_MULTICAIXA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 text-[#00A8C6] border border-cyan-200/70">
            <CreditCard size={13} /> TPA Multicaixa
          </span>
        );
      case 'TRANSFERENCIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-[#F39200] border border-orange-200/70">
            <ArrowRightLeft size={13} /> Transferência
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
            {method}
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-[#0B3B60]">Faturas & Fecho de Caixa</h1>
            <p className="text-sm text-slate-500">
              Conciliação automática por meio de pagamento e emissão de documentos fiscais
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
            <Receipt size={16} className="text-[#00A8C6]" />
            {sales.length} Documentos Emitidos
          </div>
        </div>

        {/* CARDS DE FECHO DE CAIXA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 print:hidden">
          <div
            onClick={() => setMethodFilter(methodFilter === 'DINHEIRO' ? 'ALL' : 'DINHEIRO')}
            className={`p-5 rounded-2xl border shadow-2xs transition cursor-pointer ${
              methodFilter === 'DINHEIRO'
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-white border-slate-200/80 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Dinheiro (Caixa)
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Banknote size={18} />
              </div>
            </div>
            <p className="text-xl font-black text-[#0B3B60]">
              {totalsByMethod.DINHEIRO.toLocaleString()} <span className="text-xs font-bold text-slate-400">Kz</span>
            </p>
          </div>

          <div
            onClick={() =>
              setMethodFilter(methodFilter === 'TPA_MULTICAIXA' ? 'ALL' : 'TPA_MULTICAIXA')
            }
            className={`p-5 rounded-2xl border shadow-2xs transition cursor-pointer ${
              methodFilter === 'TPA_MULTICAIXA'
                ? 'bg-cyan-50/70 border-cyan-300'
                : 'bg-white border-slate-200/80 hover:border-cyan-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TPA Multicaixa
              </span>
              <div className="p-2 rounded-xl bg-cyan-50 text-[#00A8C6]">
                <CreditCard size={18} />
              </div>
            </div>
            <p className="text-xl font-black text-[#0B3B60]">
              {totalsByMethod.TPA_MULTICAIXA.toLocaleString()} <span className="text-xs font-bold text-slate-400">Kz</span>
            </p>
          </div>

          <div
            onClick={() =>
              setMethodFilter(methodFilter === 'TRANSFERENCIA' ? 'ALL' : 'TRANSFERENCIA')
            }
            className={`p-5 rounded-2xl border shadow-2xs transition cursor-pointer ${
              methodFilter === 'TRANSFERENCIA'
                ? 'bg-orange-50/70 border-orange-300'
                : 'bg-white border-slate-200/80 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transferência Bancária
              </span>
              <div className="p-2 rounded-xl bg-orange-50 text-[#F39200]">
                <ArrowRightLeft size={18} />
              </div>
            </div>
            <p className="text-xl font-black text-[#0B3B60]">
              {totalsByMethod.TRANSFERENCIA.toLocaleString()} <span className="text-xs font-bold text-slate-400">Kz</span>
            </p>
          </div>

          <div
            onClick={() => setMethodFilter('ALL')}
            className="bg-gradient-to-br from-[#0B3B60] to-[#082a45] text-white p-5 rounded-2xl shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Total Consolidado
              </span>
              <div className="p-2 rounded-xl bg-white/10 text-[#00A8C6]">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-2xl font-black">
              {totalsByMethod.ALL.toLocaleString()} <span className="text-xs font-bold text-cyan-200">Kz</span>
            </p>
          </div>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 w-full sm:max-w-md bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/70">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar por nº fatura, cliente ou NIF..."
              className="w-full text-sm bg-transparent focus:outline-none text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'DINHEIRO', label: 'Dinheiro' },
              { id: 'TPA_MULTICAIXA', label: 'TPA' },
              { id: 'TRANSFERENCIA', label: 'Transferência' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMethodFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  methodFilter === tab.id
                    ? 'bg-[#0B3B60] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA DE FATURAS EMITIDAS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-4 px-6">Nº Fatura</th>
                  <th className="py-4 px-4">Data / Hora</th>
                  <th className="py-4 px-4">Cliente</th>
                  <th className="py-4 px-4">Meio de Pagamento</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-6 text-right">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <FileText size={36} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Nenhuma fatura encontrada</p>
                      <p className="text-xs mt-1">
                        Ajuste os filtros ou emita uma nova venda no Ponto de Venda (PDV).
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-extrabold text-[#0B3B60]">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(sale.createdAt).toLocaleString('pt-PT')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{sale.customerName}</p>
                        <p className="text-[11px] text-slate-400">NIF: {sale.customerNif}</p>
                      </td>
                      <td className="py-4 px-4">{getMethodBadge(sale.paymentMethod)}</td>
                      <td className="py-4 px-4 font-black text-emerald-600">
                        {sale.totalAmount.toLocaleString()} Kz
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedInvoice(sale)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-50 text-[#00A8C6] hover:bg-[#00A8C6] hover:text-white text-xs font-bold transition cursor-pointer"
                        >
                          <FileText size={14} /> Ver Fatura
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE VISUALIZAÇÃO / IMPRESSÃO DE FATURA */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 print:static print:bg-white print:p-0">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 print:shadow-none print:border-none print:max-w-full">
              {/* Cabeçalho da Fatura */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5">
                <div className="flex items-start gap-3">
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="h-11 w-11 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h2 className="text-lg font-black text-[#0B3B60]">
                      {activeCompany?.name}
                    </h2>
                    <p className="text-xs text-slate-500">NIF: {activeCompany?.nif}</p>
                    <p className="text-xs text-slate-500">{activeCompany?.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold bg-slate-100 px-3 py-1 rounded-lg text-[#0B3B60]">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {new Date(selectedInvoice.createdAt).toLocaleString('pt-PT')}
                  </p>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="mb-5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <p>
                  <span className="text-slate-400 font-semibold">Cliente:</span>{' '}
                  <strong className="text-slate-800">{selectedInvoice.customerName}</strong>
                </p>
                <p>
                  <span className="text-slate-400 font-semibold">NIF Cliente:</span>{' '}
                  <strong className="text-slate-800">{selectedInvoice.customerNif}</strong>
                </p>
                <p>
                  <span className="text-slate-400 font-semibold">Meio de Pagamento:</span>{' '}
                  <strong className="text-slate-800">{selectedInvoice.paymentMethod}</strong>
                </p>
              </div>

              {/* Tabela de Artigos da Fatura */}
              <table className="w-full text-xs mb-5">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 text-left">Artigo</th>
                    <th className="py-2.5 text-center">Qtd</th>
                    <th className="py-2.5 text-right">Preço Unit.</th>
                    <th className="py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-slate-800">{item.name}</td>
                      <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-2.5 text-right text-slate-600">
                        {item.unitPrice.toLocaleString()} Kz
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-[#0B3B60]">
                        {item.subtotal.toLocaleString()} Kz
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-slate-600 text-sm">TOTAL PAGO:</span>
                <span className="text-2xl font-black text-[#0B3B60]">
                  {selectedInvoice.totalAmount.toLocaleString()}{' '}
                  <span className="text-xs font-bold text-slate-400">Kz</span>
                </span>
              </div>

              <p className="text-center text-[10px] text-slate-400 mb-6">
                Processado por computador • EDME ERP
              </p>

              {/* Ações */}
              <div className="flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X size={16} /> Fechar
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-[#F39200] to-[#e08200] hover:brightness-105 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer"
                >
                  <Printer size={16} /> Imprimir Fatura / Talão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}