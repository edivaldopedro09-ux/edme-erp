import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useCompany } from '../context/CompanyContext';
import api from '../services/api';
import { Landmark, Wallet, BookOpen, ArrowUpRight, ArrowDownLeft, Plus, CheckCircle2 } from 'lucide-react';

export default function FinanceHub() {
  const { activeCompany } = useCompany();
  const [banks, setBanks] = useState([]);
  const [journal, setJournal] = useState([]);
  const [activeTab, setActiveTab] = useState('banks'); // 'banks' ou 'accounting'
  const [successMsg, setSuccessMsg] = useState('');

  // Estados para nova conta bancária
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', iban: '', initialBalance: '' });
  // Estados para movimento de tesouraria
  const [movForm, setMovForm] = useState({ bankAccountId: '', type: 'ENTRADA', category: 'Vendas', amount: '', description: '' });

  const fetchData = async () => {
    if (!activeCompany) return;
    try {
      const [banksRes, journalRes] = await Promise.all([
        api.get('/finance/banks'),
        api.get('/finance/journal')
      ]);
      setBanks(banksRes.data);
      setJournal(journalRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCompany]);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/banks', { ...bankForm, initialBalance: Number(bankForm.initialBalance || 0) });
      setBankForm({ bankName: '', accountNumber: '', iban: '', initialBalance: '' });
      fetchData();
      showNotification('Conta bancária adicionada com sucesso!');
    } catch (error) {
      alert('Erro ao criar conta bancária.');
    }
  };

  const handleCreateMovement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/movements', { ...movForm, amount: Number(movForm.amount) });
      setMovForm({ bankAccountId: '', type: 'ENTRADA', category: 'Vendas', amount: '', description: '' });
      fetchData();
      showNotification('Movimento de tesouraria registado com sucesso!');
    } catch (error) {
      alert('Erro ao registar movimento.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
          <div>
            <h1 className="text-2xl font-black text-[#0B3B60]">Contabilidade & Tesouraria</h1>
            <p className="text-sm text-slate-500">
              Gestão financeira avançada e controlo bancário por empresa
            </p>
          </div>

          {/* SELETOR DE ABAS MODERNO */}
          <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('banks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'banks'
                  ? 'bg-white text-[#0B3B60] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tesouraria & Bancos
            </button>
            <button
              onClick={() => setActiveTab('accounting')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'accounting'
                  ? 'bg-white text-[#0B3B60] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Contabilidade Geral
            </button>
          </div>
        </div>

        {/* ALERTA DE SUCESSO TEMPORÁRIO */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-2xs animate-in fade-in">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="text-sm font-bold">{successMsg}</span>
          </div>
        )}

        {activeTab === 'banks' ? (
          <div className="space-y-6">
            {/* CONTAS BANCÁRIAS (GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {banks.length === 0 ? (
                <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400 text-sm">
                  Nenhuma conta bancária ou caixa registada. Utilize o formulário abaixo para adicionar.
                </div>
              ) : (
                banks.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="p-3 bg-cyan-50 text-[#00A8C6] rounded-xl group-hover:scale-110 transition-transform">
                        <Landmark size={22} />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-800 text-base truncate">{b.bankName}</h3>
                        <p className="text-xs text-slate-400 truncate">IBAN: {b.iban}</p>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Saldo Atual
                    </p>
                    <p className="text-2xl font-black text-[#0B3B60] mt-0.5">
                      {b.balance.toLocaleString()} <span className="text-sm font-bold text-slate-400">{b.currency}</span>
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* FORMULÁRIOS DE TESOURARIA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ADICIONAR BANCO */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs">
                <h3 className="text-lg font-bold text-[#0B3B60] mb-4 flex items-center gap-2">
                  <Wallet size={20} className="text-[#00A8C6]" /> Adicionar Banco ou Caixa
                </h3>
                <form onSubmit={handleCreateBank} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Banco / Instituição *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Standard Bank Angola / Caixa Geral"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Número da Conta *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: 000123456"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Saldo Inicial (Kz)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                        value={bankForm.initialBalance}
                        onChange={(e) => setBankForm({ ...bankForm, initialBalance: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">IBAN *</label>
                    <input
                      required
                      type="text"
                      placeholder="AO06..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={bankForm.iban}
                      onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0B3B60] hover:bg-[#082a45] text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer mt-2"
                  >
                    Guardar Conta Bancária
                  </button>
                </form>
              </div>

              {/* REGISTAR MOVIMENTO DE TESOURARIA */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs">
                <h3 className="text-lg font-bold text-[#0B3B60] mb-4 flex items-center gap-2">
                  <ArrowUpRight size={20} className="text-[#F39200]" /> Registar Movimento de Caixa
                </h3>
                <form onSubmit={handleCreateMovement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Conta Bancária / Caixa *</label>
                    <select
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30 bg-white"
                      value={movForm.bankAccountId}
                      onChange={(e) => setMovForm({ ...movForm, bankAccountId: e.target.value })}
                    >
                      <option value="">Selecione a conta bancária</option>
                      {banks.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.bankName} - {b.accountNumber} ({b.balance.toLocaleString()} {b.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Movimento</label>
                      <select
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30 bg-white font-semibold text-slate-700"
                        value={movForm.type}
                        onChange={(e) => setMovForm({ ...movForm, type: e.target.value })}
                      >
                        <option value="ENTRADA">Entrada (Recebimento)</option>
                        <option value="SAIDA">Saída (Pagamento)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Categoria *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Fornecedores / Renda"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                        value={movForm.category}
                        onChange={(e) => setMovForm({ ...movForm, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Valor (Kz) *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="0.00"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={movForm.amount}
                      onChange={(e) => setMovForm({ ...movForm, amount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Descrição / Histórico</label>
                    <input
                      type="text"
                      placeholder="Detalhes opcionais da transação"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={movForm.description}
                      onChange={(e) => setMovForm({ ...movForm, description: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#00A8C6] hover:bg-[#008da6] text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer mt-2"
                  >
                    Efetuar Movimento
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* CONTABILIDADE GERAL */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-[#0B3B60] text-base flex items-center gap-2">
                <BookOpen size={18} className="text-[#00A8C6]" /> Diário Geral de Lançamentos Contabilísticos
              </h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {journal.length} registos
              </span>
            </div>

            <div className="p-6">
              {journal.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Nenhum lançamento contabilístico registado. As vendas automáticas emitidas no PDV aparecerão aqui.
                </div>
              ) : (
                <div className="space-y-3">
                  {journal.map((entry) => (
                    <div
                      key={entry._id}
                      className="p-4 border border-slate-200/70 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold bg-cyan-100 text-[#00A8C6] px-2.5 py-0.5 rounded-md">
                            {entry.entryNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(entry.date).toLocaleString('pt-PT')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{entry.description}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-[#0B3B60]">
                          {entry.totalAmount.toLocaleString()} <span className="text-xs font-bold text-slate-400">Kz</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}