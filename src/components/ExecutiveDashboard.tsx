import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Search, Calendar, Wallet, AlertCircle, CheckCircle, Trash2, Plus, User, Tag, DollarSign, ShoppingCart } from 'lucide-react';
import { apiService } from '../services/api.service';
import { formatCurrency } from '../lib/utils';
import { useStore } from '../lib/store';
import { Sale } from '../../types';

const safeFormatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch (error) {
    return 'Data Inválida';
  }
};

export function ExecutiveDashboard() {
  const { products } = useStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [clientName, setClientName] = useState('');
  const [itemSold, setItemSold] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await apiService.getSales();
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalValue = parseFloat(unitPrice) * quantity;

    try {
      await apiService.createSale({
        clientName,
        itemSold: `${quantity}x ${itemSold}`,
        value: totalValue,
        date,
        status: 'pending'
      });

      setClientName('');
      setItemSold('');
      setQuantity(1);
      setUnitPrice('');
      await loadData();
      alert('Venda registrada com sucesso!');
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Erro ao registrar venda!');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportSalesCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "relatorio_vendas.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar CSV');
    }
  };

  // Derived Data
  const debtors = sales.filter(s => s.status === 'pending');
  const totalDebt = debtors.reduce((acc, curr) => acc + curr.value, 0);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.itemSold.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStart = startDate ? sale.date >= startDate : true;
    const matchesEnd = endDate ? sale.date <= endDate : true;
    return matchesSearch && matchesStart && matchesEnd;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: New Sale Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <ShoppingCart size={24} />
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-800">Nova Venda</h2>
            </div>

            <form onSubmit={handleAddSale} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-sans font-bold text-stone-500 mb-2 uppercase tracking-wide">Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
                    placeholder="Nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-stone-500 mb-2 uppercase tracking-wide">Item Vendido</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <select
                    value={itemSold}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p.name === e.target.value);
                      setItemSold(e.target.value);
                      if (selectedProduct) {
                        setUnitPrice(selectedProduct.actualPrice.toString());
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Selecione um produto...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-500 mb-2 uppercase tracking-wide">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-stone-500 mb-2 uppercase tracking-wide">Valor Unitário</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex justify-between items-center">
                <span className="text-sm font-bold text-stone-500 uppercase">Total Estimado</span>
                <span className="text-xl font-bold text-wine-900">
                  {formatCurrency((parseFloat(unitPrice) || 0) * quantity)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-stone-500 mb-2 uppercase tracking-wide">Data</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Plus size={20} />
                Registrar Venda
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Debtors & History */}
        <div className="lg:col-span-2 space-y-6">

          {/* Debtors Summary */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Wallet size={24} />
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-800">Resumo por Devedor</h2>
              </div>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">
                {debtors.length} devedores
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Cliente</th>
                    <th className="p-4">Última Venda</th>
                    <th className="p-4 text-right">Saldo Devedor</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {debtors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400 italic">
                        Tudo em dia! Nenhuma dívida pendente.
                      </td>
                    </tr>
                  ) : (
                    debtors.map(debtor => (
                      <tr key={debtor.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 pl-6 font-medium text-stone-800">{debtor.clientName}</td>
                        <td className="p-4 text-stone-500">{safeFormatDate(debtor.date)}</td>
                        <td className="p-4 text-right font-bold text-rose-600">{formatCurrency(debtor.value)}</td>
                        <td className="p-4 text-center">
                          <button className="text-emerald-600 hover:text-emerald-800 font-medium text-xs border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-md transition-colors">
                            Marcar Pago
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-stone-50 border-t border-stone-200">
                  <tr>
                    <td colSpan={2} className="p-4 pl-6 font-bold text-stone-700">Dívida Total Acumulada:</td>
                    <td className="p-4 text-right font-bold text-rose-600 text-lg">{formatCurrency(totalDebt)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Calendar size={24} />
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-800">Histórico de Transações</h2>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm shadow-sm"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 bg-stone-50 border-b border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-wine-400"
                />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 focus:outline-none focus:border-wine-400"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 focus:outline-none focus:border-wine-400"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-stone-400 font-bold uppercase tracking-wider text-xs border-b border-stone-100">
                  <tr>
                    <th className="p-4 pl-6">Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Item</th>
                    <th className="p-4 text-right">Valor</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-stone-400">
                        Nenhuma venda encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4 pl-6 text-stone-500 font-mono text-xs">{safeFormatDate(sale.date)}</td>
                        <td className="p-4 font-medium text-stone-800">{sale.clientName}</td>
                        <td className="p-4 text-stone-600">{sale.itemSold}</td>
                        <td className="p-4 text-right font-bold text-stone-700">{formatCurrency(sale.value)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sale.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {sale.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button className="text-stone-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
