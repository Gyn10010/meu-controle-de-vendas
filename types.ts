
export interface Sale {
  id: string;
  clientName: string;
  itemSold: string;
  value: number;
  date: string;
  status: 'pending' | 'paid';
  paidAt?: string | null;
}

export interface ClientSummary {
  clientName: string;
  totalDebt: number;
  lastItem: string;
}

export interface AppState {
  sales: Sale[];
  darkMode: boolean;
}
