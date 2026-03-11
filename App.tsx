import React, { useState, useEffect } from 'react';
import { useAuth } from './src/contexts/AuthContext';
import { StoreProvider } from './src/lib/store';
import { CommandCenter } from './src/components/CommandCenter';
import Login from './src/components/Login';

const App: React.FC = () => {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('vendas_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vendas_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!user) {
    return <Login />;
  }

  return (
    <StoreProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 min-h-0 relative">
          {/* Quick dark mode toggle overlaid on the layout */}
          <button
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 transition-colors shadow-sm"
            onClick={() => setDarkMode(!darkMode)}
            title="Alternar Tema"
          >
            <span className="material-icons text-sm">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <CommandCenter />
        </div>
      </div>
    </StoreProvider>
  );
};

export default App;
