import React, { useState } from 'react';
import api from '../services/api';
import { CheckCircle, Upload, Shield, CreditCard, AlertCircle } from 'lucide-react';

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Transferência Bancária (IBAN)');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const plansList = [
    {
      name: 'Plano Pro (Até 3 Empresas)',
      companiesLimit: 3,
      amount: 15000,
      description: 'Ideal para pequenos empresários ou contabilistas que gerem até 3 negócios.'
    },
    {
      name: 'Plano Enterprise (Até 10 Empresas)',
      companiesLimit: 10,
      amount: 35000,
      description: 'Para agências e empresas de prestação de serviços com múltiplos negócios.'
    }
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !proofUrl.trim()) {
      setError('Por favor, selecione um plano e insira o link ou referência do comprovativo de pagamento.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const res = await api.post('/subscriptions/request', {
        planName: selectedPlan.name,
        companiesLimit: selectedPlan.companiesLimit,
        amount: selectedPlan.amount,
        paymentMethod,
        proofUrl: proofUrl.trim()
      });

      setMessage(res.data.message);
      setSelectedPlan(null);
      setProofUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao submeter o pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Planos e Subscrições EDME ERP</h1>
        <p className="text-gray-600 mt-2">
          O seu plano gratuito permite gerir 1 empresa. Precisa de mais? Escolha um plano abaixo.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {plansList.map((plan, index) => (
          <div 
            key={index}
            className={`border rounded-xl p-6 flex flex-col justify-between transition-all ${
              selectedPlan?.name === plan.name ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/20' : 'border-gray-200 bg-white'
            }`}
          >
            <div>
              <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-gray-900">{plan.amount.toLocaleString()} Kz</span>
                <span className="text-gray-500 text-sm"> / ativação</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlan(plan)}
              className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                selectedPlan?.name === plan.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {selectedPlan?.name === plan.name ? 'Plano Selecionado' : 'Selecionar Este Plano'}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Dados para Pagamento e Confirmação
          </h2>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700 space-y-1">
            <p><strong>Banco:</strong> Standard Bank Angola</p>
            <p><strong>IBAN:</strong> AO06 0006 0000 1234 5678 9012 3</p>
            <p><strong>Titular:</strong> EDME Solutions</p>
            <p><strong>Multicaixa Express (Telemóvel):</strong> +244 923 000 000</p>
            <p className="text-blue-600 font-semibold mt-2">Valor a transferir: {selectedPlan.amount.toLocaleString()} Kz</p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento Utilizado</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              >
                <option value="Transferência Bancária (IBAN)">Transferência Bancária (IBAN)</option>
                <option value="Multicaixa Express">Multicaixa Express</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link do Comprovativo (Google Drive/Imagem) ou Número de Referência / Transação
              </label>
              <input 
                type="text"
                placeholder="Ex: Ref: 987654321 ou link da imagem"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {loading ? 'A enviar...' : 'Submeter Comprovativo para Aprovação'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}