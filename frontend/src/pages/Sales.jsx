import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useCompany } from '../context/CompanyContext';
import api from '../services/api';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Search,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Tag,
  Package
} from 'lucide-react';

export default function Sales() {
  const { activeCompany } = useCompany();
  const [products, setProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('Consumidor Final');
  const [customerNif, setCustomerNif] = useState('999999999');
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
  const [bankAccountId, setBankAccountId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const fetchData = async () => {
    if (!activeCompany) return;
    try {
      const [prodRes, bankRes] = await Promise.all([
        api.get('/products'),
        api.get('/finance/banks').catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data);
      setBanks(bankRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados do PDV', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCompany]);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        return alert('Quantidade excede o stock disponível em armazém.');
      }
      setCart(
        cart.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (product.stock <= 0) return alert('Produto sem stock disponível.');
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              alert('Stock máximo atingido.');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('O carrinho está vazio.');
    setLoadingCheckout(true);
    try {
      await api.post('/sales', {
        customerName,
        customerNif,
        paymentMethod,
        bankAccountId: bankAccountId || undefined,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      setSuccessMsg('Venda registada com sucesso! Stock e contabilidade atualizados.');
      setCart([]);
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao processar venda.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: CATÁLOGO DE PRODUTOS (8 Colunas) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
            <div>
              <h1 className="text-2xl font-black text-[#0B3B60]">Ponto de Venda (PDV)</h1>
              <p className="text-sm text-slate-500">
                Selecione os artigos para faturar com baixa automática de stock
              </p>
            </div>

            {/* Barra de Pesquisa Rápida */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 w-full sm:w-64">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Pesquisar artigo..."
                className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-bold">{successMsg}</span>
            </div>
          )}

          {/* GRID DE PRODUTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                <Package size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">Nenhum produto disponível</p>
                <p className="text-xs mt-1">Cadastre artigos no menu Produtos para iniciar as vendas.</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const outOfStock = p.stock <= 0;
                return (
                  <div
                    key={p._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-[#00A8C6] transition-colors">
                          {p.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            outOfStock
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.stock} un.
                        </span>
                      </div>
                      {p.sku && (
                        <p className="text-[11px] font-mono text-slate-400 mb-3 flex items-center gap-1">
                          <Tag size={11} /> {p.sku}
                        </p>
                      )}
                      <p className="text-xl font-black text-[#0B3B60] mb-4">
                        {p.price.toLocaleString()} <span className="text-xs font-bold text-slate-400">Kz</span>
                      </p>
                    </div>

                    <button
                      disabled={outOfStock}
                      onClick={() => addToCart(p)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        !outOfStock
                          ? 'bg-[#0B3B60] hover:bg-[#082a45] text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={15} /> Adicionar ao Carrinho
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: CARRINHO E FATURAÇÃO (5 Colunas) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between sticky top-24">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-extrabold text-[#0B3B60] flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#00A8C6]" /> Carrinho de Vendas
              </h2>
              <span className="text-xs font-bold bg-cyan-50 text-[#00A8C6] px-2.5 py-1 rounded-full">
                {cart.length} itens
              </span>
            </div>

            {/* DADOS DO CLIENTE */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">NIF do Cliente</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                    value={customerNif}
                    onChange={(e) => setCustomerNif(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pagamento</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:outline-none"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="TPA_MULTICAIXA">TPA Multicaixa</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                  </select>
                </div>
              </div>

              {/* CONTA BANCÁRIA OPCIONAL PARA ATUALIZAR TESOURARIA */}
              {banks.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Depositar na Conta / Caixa (Tesouraria)
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-700 focus:outline-none"
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                  >
                    <option value="">Apenas Caixa Geral (Sem banco específico)</option>
                    {banks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.bankName} - {b.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* LISTA DE ITENS NO CARRINHO */}
            <div className="border-t border-slate-100 pt-3 max-h-56 overflow-y-auto space-y-2.5">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  O carrinho está vazio. Selecione artigos ao lado.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.price.toLocaleString()} Kz / un
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-black text-[#0B3B60] w-16 text-right">
                        {(item.quantity * item.price).toLocaleString()}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RODAPÉ DO CARRINHO & CHECKOUT */}
          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-slate-600 text-sm">Total a Pagar:</span>
              <span className="text-2xl font-black text-[#F39200]">
                {totalAmount.toLocaleString()} <span className="text-xs text-slate-500">Kz</span>
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loadingCheckout}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00A8C6] to-[#008da6] hover:brightness-105 text-white font-extrabold text-sm transition shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {loadingCheckout ? 'A processar fatura...' : 'Finalizar Venda & Emitir Fatura'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}