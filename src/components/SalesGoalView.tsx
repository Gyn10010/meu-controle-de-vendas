import React from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { Target, TrendingUp, Award, AlertCircle } from 'lucide-react';

export function SalesGoalView() {
  const { products, financials } = useStore();

  const TARGET_PRO_LABORE = 1500;
  const currentProLabore = financials.proLaboreBalance;
  const remainingProLabore = Math.max(0, TARGET_PRO_LABORE - currentProLabore);
  const progress = Math.min(100, (currentProLabore / TARGET_PRO_LABORE) * 100);

  // Profit needed to generate the remaining Pro-Labore (since Pro-Labore is 40% of Profit)
  const remainingProfitNeeded = remainingProLabore / 0.40;

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-stone-100 pb-4 md:pb-6">
          <div className="p-2 bg-wine-50 rounded-lg text-wine-900">
            <Target size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-800">Meta de Vendas (Pro-Labore)</h2>
        </div>

        {/* Progress Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-3 gap-2">
            <div>
              <p className="text-xs md:text-base font-sans font-semibold text-stone-500 uppercase tracking-wide">Progresso Atual</p>
              <p className="text-2xl md:text-4xl font-serif font-extrabold text-wine-900 mt-1 md:mt-2">
                {formatCurrency(currentProLabore)} 
                <span className="text-lg md:text-2xl text-stone-400 font-medium mx-2 md:mx-3">/</span> 
                <span className="text-xl md:text-3xl text-stone-600">{formatCurrency(TARGET_PRO_LABORE)}</span>
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-base md:text-lg font-sans font-bold text-wine-700">{progress.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="w-full bg-stone-100 rounded-full h-4 md:h-6 overflow-hidden">
            <div 
              className="bg-wine-600 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          {remainingProLabore > 0 ? (
            <p className="text-xs md:text-sm text-stone-500 mt-3 md:mt-4 font-medium flex items-center gap-2">
              <TrendingUp size={16} className="text-wine-600 md:w-[18px]" />
              <span>Faltam <span className="font-bold text-wine-700">{formatCurrency(remainingProLabore)}</span> de Pro-Labore para atingir a meta.</span>
            </p>
          ) : (
            <p className="text-xs md:text-sm text-emerald-600 mt-3 md:mt-4 font-bold flex items-center gap-2">
              <Award size={16} className="md:w-[18px]" />
              Parabéns! Você atingiu a meta de Pro-Labore.
            </p>
          )}
        </div>

        {/* Strategy Section */}
        {remainingProLabore > 0 && (
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-4 md:mb-6">Como atingir a meta?</h3>
            <p className="text-sm md:text-base text-stone-500 mb-6 md:mb-8 font-medium">
              Para alcançar os <span className="font-bold text-stone-700">{formatCurrency(remainingProLabore)}</span> restantes de Pro-Labore, você precisa gerar <span className="font-bold text-stone-700">{formatCurrency(remainingProfitNeeded)}</span> de Lucro Líquido.
              <br/>Veja quantas unidades de cada produto você precisaria vender (individualmente):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.length === 0 ? (
                <div className="col-span-full p-6 md:p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <AlertCircle className="mx-auto text-stone-400 mb-3" size={24} />
                  <p className="text-stone-500 font-medium text-base md:text-lg">Nenhum produto cadastrado para calcular metas.</p>
                </div>
              ) : (
                products.map(product => {
                  const profitPerUnit = product.actualPrice - product.unitCost;
                  
                  // Avoid division by zero or negative profit
                  if (profitPerUnit <= 0) return null;

                  const unitsNeeded = Math.ceil(remainingProfitNeeded / profitPerUnit);
                  const revenueNeeded = unitsNeeded * product.actualPrice;

                  return (
                    <div key={product.id} className="bg-stone-50 p-4 md:p-6 rounded-xl border border-stone-200 hover:border-wine-200 transition-all group">
                      <h4 className="font-serif font-bold text-stone-800 mb-1 md:mb-2 truncate text-base md:text-lg" title={product.name}>{product.name}</h4>
                      <p className="text-xs md:text-sm text-stone-500 mb-3 md:mb-4 font-medium">Lucro/un: {formatCurrency(profitPerUnit)}</p>
                      
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] md:text-xs font-sans font-semibold text-stone-400 uppercase">Vender</span>
                          <span className="text-lg md:text-xl font-bold text-wine-900">{unitsNeeded} <span className="text-xs md:text-sm font-medium text-wine-700">un</span></span>
                        </div>
                        <div className="w-full h-px bg-stone-200"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] md:text-xs font-sans font-semibold text-stone-400 uppercase">Faturamento</span>
                          <span className="text-sm md:text-base font-bold text-stone-600">{formatCurrency(revenueNeeded)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
