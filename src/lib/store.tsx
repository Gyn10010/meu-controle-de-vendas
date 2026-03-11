import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Sale, FinancialState } from './types';
import { apiService } from '../services/api.service';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  financials: FinancialState;
  addProduct: (product: Omit<Product, 'id' | 'unitCost' | 'suggestedPrice'>) => void;
  addSale: (productId: string, quantity: number) => void;
  resetFinancials: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_FINANCIALS: FinancialState = {
  totalRevenue: 0,
  totalCost: 0,
  grossProfit: 0,
  reinvestmentFund: 0,
  proLaboreBalance: 0,
  reserveFund: 0,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [financials, setFinancials] = useState<FinancialState>(INITIAL_FINANCIALS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, financialsRes] = await Promise.all([
          apiService.getProducts(),
          apiService.getFinancials()
        ]);
        
        if (productsRes?.products) {
          setProducts(productsRes.products);
        }
        
        if (financialsRes?.financials) {
          setFinancials({
            ...INITIAL_FINANCIALS,
            ...financialsRes.financials
          });
        }
      } catch (error) {
        console.error('Failed to load store data:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    
    // Only fetch if we have an auth token
    if (localStorage.getItem('auth_token')) {
      loadData();
    } else {
      setIsLoaded(true);
    }
  }, []);

  const addProduct = async (input: Omit<Product, 'id' | 'unitCost' | 'suggestedPrice'>) => {
    const baseUnitCost = (input.purchasePrice / input.quantity) + input.packagingCost;
    const unitCost = baseUnitCost * 1.10; // +10% safety margin
    const suggestedPrice = unitCost * 3.0; // Markup 3.0x

    const newProductData = {
      ...input,
      unitCost,
      suggestedPrice,
      actualPrice: input.actualPrice || suggestedPrice
    };
    
    // Optistic update
    const tempId = crypto.randomUUID();
    const optimisticProduct: Product = { ...newProductData, id: tempId };
    setProducts(prev => [...prev, optimisticProduct]);

    try {
      const res = await apiService.createProduct(newProductData);
      if (res?.product) {
        // Replace optimistic product with actual one from DB
        setProducts(prev => prev.map(p => p.id === tempId ? res.product : p));
      }
    } catch (error) {
      console.error('Failed to save product to DB:', error);
      // Revert optimistic update
      setProducts(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const addSale = async (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const totalPrice = product.actualPrice * quantity;
    const totalCost = product.unitCost * quantity;
    const profit = totalPrice - totalCost;

    const newFinancialState = {
      totalRevenue: financials.totalRevenue + totalPrice,
      totalCost: financials.totalCost + totalCost,
      grossProfit: financials.grossProfit + profit,
      reinvestmentFund: financials.reinvestmentFund + (profit * 0.40),
      proLaboreBalance: financials.proLaboreBalance + (profit * 0.40),
      reserveFund: financials.reserveFund + (profit * 0.20),
    };

    // Optimistic UI update
    setFinancials(newFinancialState);

    try {
      // Background DB update
      await apiService.updateFinancials(newFinancialState);
    } catch (error) {
      console.error('Failed to update financials in DB:', error);
      // Revert if needed, but in this implementation we keep it optimistic 
      // since the DB might be temporarily down
    }
  };

  const resetFinancials = () => {
    setFinancials(INITIAL_FINANCIALS);
    setSales([]);
    // Keep products
  };

  return (
    <StoreContext.Provider value={{ products, sales, financials, addProduct, addSale, resetFinancials }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
