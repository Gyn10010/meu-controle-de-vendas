import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { Calculator, Save, Plus, Trash2, Tag } from 'lucide-react';
import { Expense, Category, CATEGORY_LABELS } from '../lib/types';

export function ProductForm() {
  const { addProduct } = useStore();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('OUTROS');
  const [quantity, setQuantity] = useState('1');
  const [packagingCost, setPackagingCost] = useState('');
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const [preview, setPreview] = useState<{unitCost: number, suggestedPrice: number} | null>(null);

  // Calculate total expenses (Purchase Price)
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    calculatePreview();
  }, [totalExpenses, quantity, packagingCost]);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission if triggered by enter key inside these inputs
    if (!newExpenseName || !newExpenseAmount) return;
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      name: newExpenseName,
      amount: amount
    };

    setExpenses([...expenses, newExpense]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const calculatePreview = () => {
    const price = totalExpenses;
    const qty = parseFloat(quantity);
    const pkg = parseFloat(packagingCost);

    if (price > 0 && qty > 0 && !isNaN(pkg)) {
      // Logic: [Preço de Compra / Quantidade] + Embalagem + 10% de margem de segurança
      const baseUnitCost = (price / qty) + pkg;
      const unitCost = baseUnitCost * 1.10;
      const suggestedPrice = unitCost * 3.0;
      setPreview({ unitCost, suggestedPrice });
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;

    addProduct({
      name,
      category,
      purchasePrice: totalExpenses,
      expenses,
      quantity: parseFloat(quantity),
      packagingCost: parseFloat(packagingCost),
      actualPrice: preview.suggestedPrice, // Default to suggested
    });

    setName('');
    setCategory('OUTROS');
    setQuantity('1');
    setPackagingCost('');
    setExpenses([]);
    setPreview(null);
    alert('PRODUTO CADASTRADO COM SUCESSO');
  };

  return (
    <div className="w-full">
      <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-stone-100 pb-4 md:pb-6">
          <div className="p-2 bg-wine-50 rounded-lg text-wine-900">
            <Calculator size={24} className="md:w-8 md:h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-stone-800">Nova Ficha Técnica</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-3 uppercase tracking-wide">Nome do Produto</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 md:p-4 text-base md:text-lg text-stone-800 font-serif font-medium focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all placeholder:text-stone-300"
                placeholder="Ex: Hambúrguer Artesanal"
                required
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-3 uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 md:py-4 pr-4 pl-12 text-base md:text-lg text-stone-800 font-sans font-medium focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all appearance-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-stone-50 rounded-xl p-4 md:p-8 border border-stone-200">
            <h3 className="text-base md:text-lg font-serif font-bold text-stone-700 mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
              Lista de Custos / Ingredientes
              <span className="text-xs md:text-sm font-sans font-normal text-stone-500">Total: {formatCurrency(totalExpenses)}</span>
            </h3>
            
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              {expenses.length === 0 && (
                <p className="text-xs md:text-sm text-stone-400 italic text-center py-4 md:py-6">Nenhum custo adicionado.</p>
              )}
              {expenses.map(expense => (
                <div key={expense.id} className="flex items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-xl border border-stone-100 shadow-sm">
                  <span className="flex-1 text-sm md:text-base font-medium text-stone-700">{expense.name}</span>
                  <span className="text-sm md:text-base font-bold text-stone-800">{formatCurrency(expense.amount)}</span>
                  <button
                    type="button"
                    onClick={() => removeExpense(expense.id)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-1 md:p-2"
                  >
                    <Trash2 size={18} className="md:w-5 md:h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-end">
              <div className="w-full md:flex-1">
                <label className="block text-[10px] md:text-xs font-sans font-bold text-stone-400 mb-1 md:mb-2 uppercase tracking-wide">Item</label>
                <input
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm md:text-base text-stone-800 focus:border-wine-500 focus:outline-none"
                  placeholder="Ex: Carne 5kg"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('add-expense-btn')?.click(); }}}
                />
              </div>
              <div className="w-full md:w-40 flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] md:text-xs font-sans font-bold text-stone-400 mb-1 md:mb-2 uppercase tracking-wide">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm md:text-base text-stone-800 focus:border-wine-500 focus:outline-none"
                    placeholder="0.00"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('add-expense-btn')?.click(); }}}
                  />
                </div>
                <button
                  id="add-expense-btn"
                  type="button"
                  onClick={addExpense}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 p-3 rounded-xl transition-colors h-[46px] md:h-[50px] self-end mt-auto"
                >
                  <Plus size={20} className="md:w-6 md:h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Yield and Packaging */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className="block text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-3 uppercase tracking-wide">Rendimento (Unidades)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 md:p-4 text-base md:text-lg text-stone-800 font-sans font-medium focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
                placeholder="1"
                required
              />
              <p className="text-[10px] md:text-xs text-stone-400 mt-1 md:mt-2">Quantas unidades este lote rende?</p>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-sans font-semibold text-stone-500 mb-2 md:mb-3 uppercase tracking-wide">Embalagem Unitária (R$)</label>
              <input
                type="number"
                step="0.01"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 md:p-4 text-base md:text-lg text-stone-800 font-sans font-medium focus:border-wine-500 focus:ring-1 focus:ring-wine-500 focus:outline-none transition-all"
                placeholder="0.00"
                required
              />
              <p className="text-[10px] md:text-xs text-stone-400 mt-1 md:mt-2">Custo da embalagem por unidade vendida.</p>
            </div>
          </div>

          {preview && (
            <div className="mt-8 md:mt-10 bg-ice-50 rounded-xl border border-stone-200 p-6 md:p-8">
              <table className="w-full text-sm md:text-base font-sans">
                <tbody>
                  <tr className="border-b border-stone-200">
                    <td className="py-3 md:py-4 text-stone-500 font-medium">Custo Unitário (+10%)</td>
                    <td className="py-3 md:py-4 text-right text-rose-900 font-semibold text-lg md:text-xl">{formatCurrency(preview.unitCost)}</td>
                  </tr>
                  <tr className="border-b border-stone-200">
                    <td className="py-3 md:py-4 text-stone-500 font-medium">Markup Sugerido (3.0x)</td>
                    <td className="py-3 md:py-4 text-right text-stone-600 font-medium text-lg md:text-xl">300%</td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 text-wine-900 font-extrabold font-serif text-lg md:text-xl">Preço de Venda</td>
                    <td className="py-3 md:py-4 text-right text-wine-900 font-extrabold font-serif text-2xl md:text-4xl">{formatCurrency(preview.suggestedPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <button
            type="submit"
            disabled={!preview || expenses.length === 0}
            className="w-full mt-6 md:mt-8 bg-wine-900 hover:bg-wine-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-sans font-bold py-4 md:py-5 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all shadow-sm hover:shadow-md text-base md:text-lg"
          >
            <Save size={20} className="md:w-6 md:h-6" />
            Cadastrar Ficha Técnica
          </button>
        </form>
      </div>
    </div>
  );
}
