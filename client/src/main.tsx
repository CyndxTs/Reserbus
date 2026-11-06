import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { setupAxiosAuth } from './lib/api';

// Todas las llamadas axios a nuestro server llevarán el token de Supabase
setupAxiosAuth();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
