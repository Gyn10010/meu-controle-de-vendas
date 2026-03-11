import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, CheckCircle } from 'lucide-react';

export function SaleForm() {
  const { products, addSale } = useStore();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    addSale(selectedProductId, parseInt(quantity));
    setQuantity('1');
    setSelectedProductId('');
    alert('VENDA REGISTRADA - LUCRO COMPUTADO');
  };

  if (products.length === 0) {
    return (
      <div className="text-center p-12 text-stone-500 font-sans italic font-medium text-lg">
        Nenhum produto cadastrado. Use o comando [Novo Produto].
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-stone-100 pb-4 md:pb-6">
          <div className="p-2 bg-wine-50 rounded-lg text-wine-900">
            <ShoppingCart size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-stone-800">Registrar Venda</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div>
            <label className="block text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-3 uppercase tracking-wide">Selecionar Produto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 md:p-4 text-base md:text-lg text-stone-800 font-sans font-medium focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
              required
            >
              <option value="">Selecione...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatCurrency(p.actualPrice)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-3 uppercase tracking-wide">Quantidade</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 md:p-4 text-base md:text-lg text-stone-800 font-sans font-medium focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
              required
            />
          </div>

          {selectedProduct && (
            <div className="mt-8 md:mt-10 bg-ice-50 rounded-xl border border-stone-200 p-6 md:p-8">
              <table className="w-full text-sm md:text-base font-sans">
                <tbody>
                  <tr className="border-b border-stone-200">
                    <td className="py-3 md:py-4 text-stone-500 font-medium">Preço Unitário</td>
                    <td className="py-3 md:py-4 text-right text-stone-800 font-medium text-lg md:text-xl">{formatCurrency(selectedProduct.actualPrice)}</td>
                  </tr>
                  <tr className="border-b border-stone-200">
                    <td className="py-3 md:py-4 text-stone-500 font-medium">Custo Total (CMV)</td>
                    <td className="py-3 md:py-4 text-right text-rose-900 font-medium text-lg md:text-xl">
                      {formatCurrency(selectedProduct.unitCost * parseInt(quantity))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 text-wine-900 font-extrabold font-serif text-lg md:text-xl">Lucro Estimado</td>
                    <td className="py-3 md:py-4 text-right text-wine-900 font-extrabold font-serif text-2xl md:text-4xl">
                      {formatCurrency((selectedProduct.actualPrice - selectedProduct.unitCost) * parseInt(quantity))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedProduct}
            className="w-full mt-6 md:mt-8 bg-wine-900 hover:bg-wine-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-sans font-bold py-4 md:py-5 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all shadow-sm hover:shadow-md text-base md:text-lg"
          >
            <CheckCircle size={20} className="md:w-6 md:h-6" />
            Confirmar Venda
          </button>
        </form>
      </div>
    </div>
  );
}
