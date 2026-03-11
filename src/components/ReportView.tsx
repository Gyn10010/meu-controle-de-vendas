import React from 'react';
import { useStore } from '../lib/store';
import { formatCurrency, formatDate } from '../lib/utils';
import { PieChart, Download, Tag } from 'lucide-react';
import { CATEGORY_LABELS, Category } from '../lib/types';

export function ReportView() {
  const { sales, financials } = useStore();

  const salesByCategory = sales.reduce((acc, sale) => {
    const category = sale.category || 'OUTROS';
    acc[category] = (acc[category] || 0) + sale.totalPrice;
    return acc;
  }, {} as Record<Category, number>);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 border-b border-stone-100 pb-4 md:pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wine-50 rounded-lg text-wine-900">
              <PieChart size={24} className="md:w-8 md:h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-stone-800">Relatório de Fechamento</h2>
          </div>
          <button className="text-xs md:text-sm font-sans font-semibold text-wine-900 border border-wine-200 px-4 md:px-5 py-2 md:py-3 rounded-xl hover:bg-wine-50 flex items-center justify-center gap-2 transition-colors w-full md:w-auto">
            <Download size={16} className="md:w-[18px]" /> Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          <div className="bg-stone-50 p-6 md:p-8 rounded-xl border border-stone-200">
            <h3 className="text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-4 uppercase tracking-wide">Reinvestimento (40%)</h3>
            <p className="text-2xl md:text-3xl font-serif font-extrabold text-stone-700">{formatCurrency(financials.reinvestmentFund)}</p>
            <p className="text-[10px] md:text-xs text-stone-400 mt-2 md:mt-3 font-sans font-medium">Fundo de Escala</p>
          </div>
          <div className="bg-wine-50 p-6 md:p-8 rounded-xl border border-wine-100 shadow-sm">
            <h3 className="text-xs md:text-sm font-sans font-semibold text-wine-800 mb-2 md:mb-4 uppercase tracking-wide">Pro-Labore (40%)</h3>
            <p className="text-3xl md:text-4xl font-serif font-extrabold text-wine-900">{formatCurrency(financials.proLaboreBalance)}</p>
            <p className="text-[10px] md:text-xs text-wine-700/60 mt-2 md:mt-3 font-sans font-medium">Disponível para Saque</p>
          </div>
          <div className="bg-stone-50 p-6 md:p-8 rounded-xl border border-stone-200">
            <h3 className="text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-4 uppercase tracking-wide">Reserva (20%)</h3>
            <p className="text-2xl md:text-3xl font-serif font-extrabold text-stone-700">{formatCurrency(financials.reserveFund)}</p>
            <p className="text-[10px] md:text-xs text-stone-400 mt-2 md:mt-3 font-sans font-medium">Segurança</p>
          </div>
        </div>

        <h3 className="text-base md:text-lg font-serif italic text-stone-500 mb-4 md:mb-6 font-medium">Vendas por Categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const amount = salesByCategory[key as Category] || 0;
            return (
              <div key={key} className="bg-white border border-stone-100 p-4 rounded-xl shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-stone-400" />
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</span>
                </div>
                <span className="text-lg font-serif font-bold text-stone-800">{formatCurrency(amount)}</span>
              </div>
            );
          })}
        </div>

        <h3 className="text-base md:text-lg font-serif italic text-stone-500 mb-4 md:mb-6 font-medium">Histórico de Vendas Recentes</h3>
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-sm md:text-base font-sans text-left min-w-[600px]">
            <thead className="bg-stone-50 text-stone-500 font-semibold">
              <tr>
                <th className="p-4 md:p-5 font-semibold">Data/Hora</th>
                <th className="p-4 md:p-5 font-semibold">Produto</th>
                <th className="p-4 md:p-5 font-semibold text-right">Qtd</th>
                <th className="p-4 md:p-5 font-semibold text-right">Total</th>
                <th className="p-4 md:p-5 font-semibold text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 md:p-10 text-center text-stone-400 italic font-medium">Nenhuma venda registrada neste período.</td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4 md:p-5 text-stone-500 font-medium">{formatDate(sale.timestamp)}</td>
                    <td className="p-4 md:p-5 text-stone-800 font-semibold">{sale.productName}</td>
                    <td className="p-4 md:p-5 text-right text-stone-600 font-medium">{sale.quantity}</td>
                    <td className="p-4 md:p-5 text-right text-stone-800 font-semibold">{formatCurrency(sale.totalPrice)}</td>
                    <td className="p-4 md:p-5 text-right text-emerald-700 font-semibold">+{formatCurrency(sale.profit)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
