
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, ClientSummary } from './types';
import { apiService } from './src/services/api.service';
import { useAuth } from './src/contexts/AuthContext';

const App: React.FC = () => {
  const { logout, user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('vendas_dark_mode');
    return saved === 'true';
  });

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    itemSold: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter States
  const [searchClient, setSearchClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // AI Insights State
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Load sales from API
  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    localStorage.setItem('vendas_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSales();
      setSales(response.sales);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.itemSold || !formData.value) return;

    try {
      await apiService.createSale({
        clientName: formData.clientName,
        itemSold: formData.itemSold,
        value: parseFloat(formData.value),
        date: formData.date,
        status: 'pending'
      });

      setFormData({
        clientName: '',
        itemSold: '',
        value: '',
        date: new Date().toISOString().split('T')[0]
      });

      await loadSales();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Erro ao criar venda');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiService.updateSaleStatus(id, 'paid');
      await loadSales();
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Erro ao atualizar venda');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta venda?')) {
      try {
        await apiService.deleteSale(id);
        await loadSales();
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Erro ao excluir venda');
      }
    }
  };

  const exportToJson = async () => {
    try {
      const data = await apiService.exportSalesJSON();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "meu_controle_vendas_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Erro ao exportar JSON');
    }
  };

  const importFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    alert('Importação de JSON não disponível nesta versão. Use a exportação para backup.');
    e.target.value = '';
  };

  const salesHistory = useMemo(() => {
    if (!sales || !Array.isArray(sales)) return [];
    return sales.filter(s => {
      const matchesClient = s.clientName.toLowerCase().includes(searchClient.toLowerCase());
      const matchesStart = startDate ? s.date >= startDate : true;
      const matchesEnd = endDate ? s.date <= endDate : true;
      return matchesClient && matchesStart && matchesEnd;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchClient, startDate, endDate]);

  const exportToCsv = async () => {
    try {
      const blob = await apiService.exportSalesCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "extrato_vendas.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar CSV');
    }
  };

  const clientSummaries = useMemo(() => {
    const map = new Map<string, ClientSummary>();
    if (!sales || !Array.isArray(sales)) return [];
    sales.filter(s => s.status === 'pending').forEach(s => {
      const existing = map.get(s.clientName);
      if (existing) {
        existing.totalDebt += s.value;
      } else {
        map.set(s.clientName, {
          clientName: s.clientName,
          totalDebt: s.value,
          lastItem: s.itemSold
        });
      }
    });
    return Array.from(map.values());
  }, [sales]);

  const totalPending = useMemo(() => {
    return clientSummaries.reduce((acc, c) => acc + c.totalDebt, 0);
  }, [clientSummaries]);

  const generateInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await apiService.generateInsights();
      setInsights(response.insights || null);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('Erro ao gerar insights. Tente novamente.');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-background-light dark:bg-background-dark">
      {/* Navigation */}
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="material-icons text-2xl">receipt_long</span>
              <h1 className="text-xl font-bold tracking-tight">Meu Controle de Vendas</h1>
              {user && <span className="text-sm opacity-75">• {user.name}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                onClick={() => setDarkMode(!darkMode)}
                title="Alternar Tema"
              >
                <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                onClick={logout}
                title="Sair"
              >
                <span className="material-icons">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Register Form */}
          <div className="lg:col-span-1">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark overflow-hidden sticky top-24">
              <div className="p-6 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-orange-500">add_shopping_cart</span>
                  <h2 className="text-lg font-bold">Nova Venda</h2>
                </div>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleAddSale}>
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted-light dark:text-text-muted-dark mb-1">Cliente</label>
                  <input
                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 focus:ring-primary py-2 px-3 transition-all"
                    placeholder="Nome completo"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted-light dark:text-text-muted-dark mb-1">Item Vendido</label>
                  <input
                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 focus:ring-primary py-2 px-3 transition-all"
                    placeholder="Descrição do produto"
                    value={formData.itemSold}
                    onChange={e => setFormData({ ...formData, itemSold: e.target.value })}
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted-light dark:text-text-muted-dark mb-1">Valor</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">R$</span>
                    </div>
                    <input
                      className="block w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 pl-10 focus:ring-primary py-2 transition-all"
                      placeholder="0,00"
                      step="0.01"
                      value={formData.value}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-text-muted-light dark:text-text-muted-dark mb-1">Data</label>
                  <input
                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 focus:ring-primary py-2 px-3 transition-all"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-emerald-600 transition-all mt-6"
                >
                  Registrar Venda
                </button>
              </form>
            </div>
          </div>

          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark overflow-hidden">
              <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-amber-500">account_balance_wallet</span>
                  <h2 className="text-lg font-bold">Resumo por Devedor</h2>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                  {clientSummaries.length} devedores
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Última Venda</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Saldo Devedor</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                    {clientSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-text-muted-light dark:text-text-muted-dark italic">
                          Tudo em dia! Nenhuma dívida pendente.
                        </td>
                      </tr>
                    ) : (
                      clientSummaries.map((summary) => (
                        <tr key={summary.clientName} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{summary.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">{summary.lastItem}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600 dark:text-red-400">R$ {summary.totalDebt.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <button
                              onClick={() => setSearchClient(summary.clientName)}
                              className="text-secondary hover:text-blue-700 font-medium underline underline-offset-4"
                            >
                              Filtrar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-border-light dark:border-border-dark">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold" colSpan={2}>Dívida Total Acumulada:</td>
                      <td className="px-6 py-4 text-sm font-black text-right text-red-600 dark:text-red-400">R$ {totalPending.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* History Table with Filters */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark overflow-hidden">
              <div className="p-6 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-secondary">history</span>
                    <h2 className="text-lg font-bold">Histórico de Transações</h2>
                  </div>
                  <button
                    onClick={exportToCsv}
                    className="flex items-center justify-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    <span className="material-icons text-sm mr-2">description</span>
                    Exportar CSV
                  </button>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <span className="material-icons text-sm">search</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      className="w-full pl-10 rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 focus:ring-secondary py-2 text-sm"
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                    />
                  </div>
                  <input
                    type="date"
                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 focus:ring-secondary py-2 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-gray-900 focus:ring-secondary py-2 text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                  <thead className="bg-gray-100 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Item</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Valor</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Data Pagto</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {salesHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
                          Nenhuma venda encontrada para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      salesHistory.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{sale.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">{sale.itemSold}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">R$ {sale.value.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sale.status === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                              {sale.status === 'paid' ? 'Pago' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-text-muted-light dark:text-text-muted-dark">
                            {sale.paidAt ? new Date(sale.paidAt + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {sale.status === 'pending' && (
                                <button
                                  onClick={() => handleMarkAsPaid(sale.id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                                  title="Marcar como Pago"
                                >
                                  <span className="material-icons text-sm">check_circle</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSale(sale.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Excluir Venda"
                              >
                                <span className="material-icons text-sm">delete_outline</span>
                              </button>
                            </div>
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
      </main>
    </div>
  );
};

export default App;
