import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './src/contexts/AuthContext';
import AppWrapper from './AppWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </React.StrictMode>
);
