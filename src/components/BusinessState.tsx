import React from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { Activity, DollarSign, TrendingUp, ShieldCheck, Wallet } from 'lucide-react';

export function BusinessState() {
  const { financials } = useStore();

  return (
    <div className="bg-white border-b border-stone-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-serif italic text-stone-500 tracking-widest font-medium">Estado do Negócio</h2>
        <span className="text-xs md:text-sm font-sans font-semibold text-emerald-600 bg-emerald-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-emerald-100">● Operação Ativa</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-stone-50 p-4 md:p-6 rounded-xl border border-stone-100">
          <div className="flex items-center gap-2 text-stone-500 mb-2 md:mb-3">
            <DollarSign size={18} className="text-stone-400 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-sans uppercase tracking-wide font-semibold">Faturamento</span>
          </div>
          <p className="text-xl md:text-2xl font-serif font-semibold text-stone-800">{formatCurrency(financials.totalRevenue)}</p>
        </div>

        <div className="bg-stone-50 p-4 md:p-6 rounded-xl border border-stone-100">
          <div className="flex items-center gap-2 text-rose-900/60 mb-2 md:mb-3">
            <Activity size={18} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-sans uppercase tracking-wide font-semibold">Custo Total</span>
          </div>
          <p className="text-xl md:text-2xl font-serif font-semibold text-rose-900">{formatCurrency(financials.totalCost)}</p>
        </div>

        <div className="bg-stone-50 p-4 md:p-6 rounded-xl border border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <TrendingUp size={40} className="md:w-14 md:h-14" />
          </div>
          <div className="flex items-center gap-2 text-stone-600 mb-2 md:mb-3">
            <TrendingUp size={18} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-sans uppercase tracking-wide font-semibold">Reinvestimento (40%)</span>
          </div>
          <p className="text-xl md:text-2xl font-serif font-semibold text-stone-700">{formatCurrency(financials.reinvestmentFund)}</p>
        </div>

        <div className="bg-wine-50 p-4 md:p-6 rounded-xl border border-wine-100 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-wine-900">
            <Wallet size={40} className="md:w-14 md:h-14" />
          </div>
          <div className="flex items-center gap-2 text-wine-900 mb-2 md:mb-3">
            <Wallet size={18} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-sans uppercase tracking-wide font-bold">Pro-Labore (40%)</span>
          </div>
          <p className="text-2xl md:text-3xl font-serif font-extrabold text-wine-900">{formatCurrency(financials.proLaboreBalance)}</p>
        </div>

        <div className="bg-stone-50 p-4 md:p-6 rounded-xl border border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <ShieldCheck size={40} className="md:w-14 md:h-14" />
          </div>
          <div className="flex items-center gap-2 text-stone-600 mb-2 md:mb-3">
            <ShieldCheck size={18} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-sans uppercase tracking-wide font-semibold">Reserva (20%)</span>
          </div>
          <p className="text-xl md:text-2xl font-serif font-semibold text-stone-700">{formatCurrency(financials.reserveFund)}</p>
        </div>
      </div>
    </div>
  );
}
