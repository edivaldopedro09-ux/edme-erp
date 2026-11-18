import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../services/api';
import { ShieldCheck, Check, X, Clock, Building, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/subscriptions/admin/all');
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar pedidos administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/subscriptions/admin/${id}/status`, { status });
      fetchRequests(); // Atualiza a lista automaticamente após a ação
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao atualizar o estado do pedido.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-500 font-medium">A carregar painel administrativo...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CABEÇALHO DO PAINEL ADMIN */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#00A8C6] flex items-center justify-center border border-cyan-100 shadow-xs">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0B3B60]">Painel do SuperAdmin</h1>
              <p className="text-sm text-slate-500">
                Valide os comprovativos de pagamento e liberte o limite de empresas para os clientes.
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Atualizar Lista
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* TABELA DE PEDIDOS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="p-4 sm:px-6">Utilizador / Contacto</th>
                  <th className="p-4">Plano Solicitado</th>
                  <th className="p-4">Valor (Kz)</th>
                  <th className="p-4">Método / Comprovativo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right sm:px-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                      Nenhum pedido de subscrição pendente ou histórico encontrado.
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 sm:px-6">
                        <div className="font-extrabold text-[#0B3B60]">
                          {item.user?.name || 'Utilizador Removido'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.user?.email} {item.user?.phone ? `• ${item.user.phone}` : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{item.planName}</div>
                        <div className="text-xs text-[#00A8C6] font-semibold">
                          Até {item.companiesLimit} empresas
                        </div>
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {item.amount?.toLocaleString()} Kz
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-slate-600">{item.paymentMethod}</div>
                        <a
                          href={item.proofUrl?.startsWith('http') ? item.proofUrl : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#00A8C6] hover:underline font-semibold flex items-center gap-1 mt-0.5 truncate max-w-[200px]"
                        >
                          {item.proofUrl} {item.proofUrl?.startsWith('http') && <ExternalLink size={12} />}
                        </a>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                            item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'rejected'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Clock size={12} />
                          {item.status === 'approved'
                            ? 'Aprovado'
                            : item.status === 'rejected'
                            ? 'Rejeitado'
                            : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-4 text-right sm:px-6 space-x-2">
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition cursor-pointer shadow-xs"
                              title="Aprovar Pedido"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item._id, 'rejected')}
                              className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl transition cursor-pointer shadow-xs"
                              title="Rejeitar Pedido"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Processado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}