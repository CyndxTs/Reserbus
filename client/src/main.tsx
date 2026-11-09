import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { setupAxiosAuth } from './lib/api';
import { supabaseConfigurado } from './lib/supabase';
import ErrorBoundary from './components/ui/ErrorBoundary/ErrorBoundary';
import ConfigError from './components/ui/ConfigError/ConfigError';

// Todas las llamadas axios a nuestro server llevarán el token de Supabase
setupAxiosAuth();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>{supabaseConfigurado ? <App /> : <ConfigError />}</ErrorBoundary>
  </React.StrictMode>
);
