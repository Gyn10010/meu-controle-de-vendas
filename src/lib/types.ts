export type Category = 'SUCO_DETOX' | 'DOCES_GARRAFA' | 'DOCES' | 'SALGADOS' | 'ROSCAS' | 'MARMITAS' | 'OUTROS';

export const CATEGORY_LABELS: Record<Category, string> = {
  'SUCO_DETOX': 'Suco Detox',
  'DOCES_GARRAFA': 'Doces na Garrafa',
  'DOCES': 'Doces',
  'SALGADOS': 'Salgados',
  'ROSCAS': 'Roscas',
  'MARMITAS': 'Marmitas',
  'OUTROS': 'Outros',
};

export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  purchasePrice: number; // Agora representa o Custo Total do Lote (Soma dos gastos)
  expenses: Expense[]; // Lista detalhada de gastos
  quantity: number; // Rendimento do lote (unidades)
  packagingCost: number; // Custo de Embalagem Unitário
  unitCost: number; // Custo Unitário Final (CMV)
  suggestedPrice: number; // Preço Sugerido (Markup 3.0x)
  actualPrice: number; // Preço de Venda Real
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  category: Category;
  quantity: number;
  totalPrice: number; // Revenue
  totalCost: number; // Cost (CMV * quantity)
  profit: number; // Revenue - Cost
  timestamp: number;
}

export interface FinancialState {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  reinvestmentFund: number; // 40% of Profit
  proLaboreBalance: number; // 40% of Profit
  reserveFund: number; // 20% of Profit
}

export type CommandType = 'NEW_PRODUCT' | 'SALE' | 'CLOSING' | 'SALES_GOAL';
