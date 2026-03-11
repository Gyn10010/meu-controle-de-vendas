import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Package, ShoppingCart, PieChart, AlertCircle, ChefHat, Target, Home, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ReportView } from './ReportView';
import { SalesGoalView } from './SalesGoalView';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { BusinessState } from './BusinessState';

type View = 'DASHBOARD' | 'NEW_PRODUCT' | 'CLOSING' | 'SALES_GOAL' | 'EXECUTIVE';

export function CommandCenter() {
  const [activeView, setActiveView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-ice-50 text-stone-800">
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className={`hidden md:flex bg-white border-r border-stone-200 flex-col shadow-sm z-20 transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-6 bg-white border border-stone-200 text-stone-400 hover:text-wine-700 rounded-full p-1 shadow-sm z-50 transition-colors"
            title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className={`p-6 border-b border-stone-100 flex items-center gap-4 cursor-pointer hover:bg-stone-50 transition-all overflow-hidden ${!isSidebarOpen && 'justify-center !px-0'}`} onClick={() => setActiveView('DASHBOARD')}>
            <div className="p-3 bg-wine-50 rounded-full text-wine-900 flex-shrink-0">
              <ChefHat size={32} />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap">
                <h1 className="font-serif font-extrabold text-2xl text-wine-900 leading-tight">Arte do Sabor</h1>
                <p className="text-xs text-stone-500 font-sans uppercase tracking-wider font-semibold">Gestão Inteligente</p>
              </div>
            )}
          </div>
          
          <nav className={`flex-1 ${isSidebarOpen ? 'p-6' : 'p-4'} space-y-3 overflow-y-auto overflow-x-hidden transition-all duration-300`}>
            <NavButton 
              active={activeView === 'DASHBOARD'} 
              onClick={() => setActiveView('DASHBOARD')}
              icon={<Home size={24} />}
              label="Início"
              isExpanded={isSidebarOpen}
            />
            <NavButton 
              active={activeView === 'NEW_PRODUCT'} 
              onClick={() => setActiveView('NEW_PRODUCT')}
              icon={<Package size={24} />}
              label="Novo Produto"
              isExpanded={isSidebarOpen}
            />
            <NavButton 
              active={activeView === 'CLOSING'} 
              onClick={() => setActiveView('CLOSING')}
              icon={<PieChart size={24} />}
              label="Fechamento"
              isExpanded={isSidebarOpen}
            />
            <NavButton 
              active={activeView === 'SALES_GOAL'} 
              onClick={() => setActiveView('SALES_GOAL')}
              icon={<Target size={24} />}
              label="Meta de Vendas"
              isExpanded={isSidebarOpen}
            />
            <div className="pt-4 mt-4 border-t border-stone-100">
              <NavButton 
                active={activeView === 'EXECUTIVE'} 
                onClick={() => setActiveView('EXECUTIVE')}
                icon={<BarChart2 size={24} />}
                label="Dashboard Exec."
                isExpanded={isSidebarOpen}
              />
            </div>
          </nav>

          <div className="p-6 border-t border-stone-100 overflow-hidden">
            {isSidebarOpen ? (
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <div className="flex items-center gap-3 text-wine-700 mb-3">
                  <AlertCircle size={18} />
                  <span className="text-xs font-sans font-extrabold uppercase tracking-wide">Lembrete</span>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed font-serif italic font-medium whitespace-normal">
                  "A consistência é o segredo do sabor e do lucro."
                </p>
              </div>
            ) : (
              <div className="flex justify-center text-wine-700" title="Lembrete: A consistência é o segredo do sabor e do lucro.">
                <AlertCircle size={24} />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-ice-50 relative pb-24 md:pb-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <div className="relative p-4 md:p-8 w-full">
            {activeView === 'DASHBOARD' && (
              <>
                <BusinessState />
                <DashboardWelcome onViewChange={setActiveView} />
              </>
            )}
            {activeView === 'NEW_PRODUCT' && <ProductForm />}
            {activeView === 'CLOSING' && <ReportView />}
            {activeView === 'SALES_GOAL' && <SalesGoalView />}
            {activeView === 'EXECUTIVE' && <ExecutiveDashboard />}
          </div>
        </main>

        {/* Bottom Navigation - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around p-2 z-[9999] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <MobileNavButton 
            active={activeView === 'DASHBOARD'} 
            onClick={() => setActiveView('DASHBOARD')}
            icon={<Home size={24} />}
            label="Início"
          />
          <MobileNavButton 
            active={activeView === 'NEW_PRODUCT'} 
            onClick={() => setActiveView('NEW_PRODUCT')}
            icon={<Package size={24} />}
            label="Novo"
          />
          <MobileNavButton 
            active={activeView === 'CLOSING'} 
            onClick={() => setActiveView('CLOSING')}
            icon={<PieChart size={24} />}
            label="Relat."
          />
          <MobileNavButton 
            active={activeView === 'EXECUTIVE'} 
            onClick={() => setActiveView('EXECUTIVE')}
            icon={<BarChart2 size={24} />}
            label="Exec."
          />
        </nav>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isExpanded = true }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isExpanded?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isExpanded ? label : undefined}
      className={`w-full flex items-center ${isExpanded ? 'gap-4 px-5' : 'justify-center px-0'} py-4 rounded-xl transition-all font-sans text-base font-semibold ${
        active 
          ? 'bg-wine-50 text-wine-900 shadow-sm ring-1 ring-wine-100' 
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {isExpanded && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
      {active && isExpanded && <span className="ml-auto w-2 h-2 rounded-full bg-wine-500 flex-shrink-0" />}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all w-full active:scale-95 ${
        active 
          ? 'text-wine-900 bg-wine-50' 
          : 'text-stone-400'
      }`}
    >
      <div className={active ? "scale-110 transition-transform" : ""}>{icon}</div>
      <span className="text-[10px] font-sans font-bold mt-1">{label}</span>
    </button>
  );
}

function DashboardWelcome({ onViewChange }: { onViewChange: (view: View) => void }) {
  return (
    <div className="w-full mt-8 md:mt-12 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-white mb-6 md:mb-10 shadow-sm border border-stone-100">
        <ChefHat className="text-wine-900" size={40} />
      </div>
      <h2 className="text-3xl md:text-5xl font-serif font-semibold text-stone-800 mb-4 md:mb-6">Bem-vindo ao Arte do Sabor</h2>
      <p className="text-stone-500 mb-10 md:mb-16 max-w-3xl mx-auto text-lg md:text-xl font-normal leading-relaxed px-4">
        Selecione uma operação abaixo para iniciar.
        O sistema cuidará da matemática enquanto você cuida do sabor.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full text-left px-2">
        <button onClick={() => onViewChange('NEW_PRODUCT')} className="p-6 md:p-8 bg-white border border-stone-200 rounded-xl hover:border-wine-200 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:bg-wine-50 transition-colors">
            <Package className="text-stone-400 group-hover:text-wine-700" size={24} />
          </div>
          <h3 className="font-serif text-lg md:text-xl text-stone-800 mb-2 md:mb-3 group-hover:text-wine-900 font-semibold">Cadastrar Ficha Técnica</h3>
          <p className="text-sm md:text-base text-stone-500 leading-relaxed font-medium">Defina custos de ingredientes e receba sugestão de preço.</p>
        </button>
        
        <button onClick={() => onViewChange('EXECUTIVE')} className="p-6 md:p-8 bg-white border border-stone-200 rounded-xl hover:border-wine-200 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:bg-wine-50 transition-colors">
            <BarChart2 className="text-stone-400 group-hover:text-wine-700" size={24} />
          </div>
          <h3 className="font-serif text-lg md:text-xl text-stone-800 mb-2 md:mb-3 group-hover:text-wine-900 font-semibold">Dashboard Executivo</h3>
          <p className="text-sm md:text-base text-stone-500 leading-relaxed font-medium">Registre vendas e acompanhe o desempenho financeiro.</p>
        </button>

        <button onClick={() => onViewChange('SALES_GOAL')} className="p-6 md:p-8 bg-white border border-stone-200 rounded-xl hover:border-wine-200 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:bg-wine-50 transition-colors">
            <Target className="text-stone-400 group-hover:text-wine-700" size={24} />
          </div>
          <h3 className="font-serif text-lg md:text-xl text-stone-800 mb-2 md:mb-3 group-hover:text-wine-900 font-semibold">Meta de Vendas</h3>
          <p className="text-sm md:text-base text-stone-500 leading-relaxed font-medium">Acompanhe seu progresso para atingir o Pro-Labore.</p>
        </button>
      </div>
    </div>
  );
}
