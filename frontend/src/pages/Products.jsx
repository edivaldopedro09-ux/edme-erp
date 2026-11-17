import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useCompany } from '../context/CompanyContext';
import api from '../services/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Layers,
  TrendingUp,
  X,
  CheckCircle2,
  Tag
} from 'lucide-react';

export default function Products() {
  const { activeCompany, products, loadingProducts, fetchProducts } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('ALL'); // 'ALL' ou 'LOW'
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    costPrice: '',
    stock: '',
  });

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setForm({
        name: product.name,
        sku: product.sku || '',
        price: product.price,
        costPrice: product.costPrice || '',
        stock: product.stock,
      });
    } else {
      setEditingId(null);
      setForm({ name: '', sku: '', price: '', costPrice: '', stock: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        costPrice: Number(form.costPrice || 0),
        stock: Number(form.stock),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showNotification('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', payload);
        showNotification('Novo produto adicionado ao catálogo!');
      }

      setShowModal(false);
      fetchProducts(true); // Atualiza o cache global
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao guardar produto.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este produto?')) return;
    try {
      await api.delete(`/products/${id}`);
      showNotification('Produto eliminado do inventário.');
      fetchProducts(true); // Atualiza o cache global
    } catch (error) {
      alert('Erro ao eliminar produto.');
    }
  };

  // Métricas rápidas do inventário
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);
  const inventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Filtragem combinada (Pesquisa + Filtro de Stock)
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStock = filterStock === 'LOW' ? p.stock <= 5 : true;
    return matchesSearch && matchesStock;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
          <div>
            <h1 className="text-2xl font-black text-[#0B3B60]">Produtos & Inventário</h1>
            <p className="text-sm text-slate-500">
              Catálogo sincronizado com baixa automática de stock no PDV
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A8C6] to-[#008da6] hover:brightness-105 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>

        {/* NOTIFICAÇÃO DE SUCESSO */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-2xs">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="text-sm font-bold">{successMsg}</span>
          </div>
        )}

        {/* CARDS DE RESUMO DO INVENTÁRIO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-50 text-[#00A8C6]">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unidades em Armazém
              </p>
              <h3 className="text-2xl font-black text-[#0B3B60]">{totalItems} un.</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Valor Potencial de Venda
              </p>
              <h3 className="text-2xl font-black text-[#0B3B60]">
                {inventoryValue.toLocaleString()} <span className="text-xs font-bold text-slate-400">Kz</span>
              </h3>
            </div>
          </div>

          <div
            onClick={() => setFilterStock(filterStock === 'LOW' ? 'ALL' : 'LOW')}
            className={`p-5 rounded-2xl border shadow-2xs flex items-center gap-4 cursor-pointer transition ${
              filterStock === 'LOW'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-slate-200/80 hover:border-amber-300'
            }`}
          >
            <div className="p-3.5 rounded-xl bg-orange-50 text-[#F39200]">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Alertas de Stock Baixo
              </p>
              <h3 className="text-2xl font-black text-[#0B3B60]">
                {lowStockCount} <span className="text-xs font-semibold text-slate-500">artigos</span>
              </h3>
            </div>
          </div>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:max-w-md bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/70">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou código SKU..."
              className="w-full text-sm bg-transparent focus:outline-none text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterStock('ALL')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStock === 'ALL'
                  ? 'bg-[#0B3B60] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterStock('LOW')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStock === 'LOW'
                  ? 'bg-[#F39200] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Stock Baixo ({lowStockCount})
            </button>
          </div>
        </div>

        {/* TABELA DE PRODUTOS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-4 px-6">Produto / Serviço</th>
                  <th className="py-4 px-4">SKU</th>
                  <th className="py-4 px-4">Custo</th>
                  <th className="py-4 px-4">Preço Venda</th>
                  <th className="py-4 px-4">Margem Unit.</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingProducts && products.length === 0 ? (
                  // Skeleton Loading Animado no primeiro carregamento
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-200" />
                          <div className="h-4 w-36 bg-slate-200 rounded-md" />
                        </div>
                      </td>
                      <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded-md" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded-md" /></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded-md" /></td>
                      <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 rounded-lg" /></td>
                      <td className="py-4 px-4"><div className="h-6 w-16 bg-slate-200 rounded-full" /></td>
                      <td className="py-4 px-6 text-right"><div className="h-6 w-14 bg-slate-200 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <Package size={36} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Nenhum produto encontrado</p>
                      <p className="text-xs mt-1">
                        Adicione novos produtos ao catálogo ou limpe os filtros de pesquisa.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const unitProfit = p.price - (p.costPrice || 0);
                    const lowStock = p.stock <= 5;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0B3B60] flex items-center justify-center font-bold text-xs shrink-0">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {p.sku ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                              <Tag size={12} /> {p.sku}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          {(p.costPrice || 0).toLocaleString()} Kz
                        </td>
                        <td className="py-4 px-4 font-extrabold text-[#0B3B60]">
                          {p.price.toLocaleString()} Kz
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            +{unitProfit.toLocaleString()} Kz
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              lowStock
                                ? 'bg-red-50 text-red-600 border border-red-200/80'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            }`}
                          >
                            {lowStock && <AlertTriangle size={12} />}
                            {p.stock} un.
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#00A8C6] hover:bg-cyan-50 transition cursor-pointer"
                            title="Editar produto"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Eliminar produto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#0B3B60]">
                    {editingId ? 'Editar Artigo' : 'Novo Artigo no Catálogo'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Preencha os dados comerciais e de armazém
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nome do Produto / Serviço *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Impressora HP DeskJet 2976"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Código SKU
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: PRD-001"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Quantidade em Stock *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Preço de Custo (Kz)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.costPrice}
                      onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Preço de Venda (Kz) *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8C6]/30"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm bg-[#0B3B60] hover:bg-[#082a45] text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    {editingId ? 'Guardar Alterações' : 'Cadastrar Artigo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}