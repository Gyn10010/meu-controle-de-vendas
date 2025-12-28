import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './src/contexts/AuthContext';
import AppWrapper from './AppWrapper';
import ErrorBoundary from './src/components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
