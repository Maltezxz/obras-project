import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug: Log initialization
console.log('🚀 Prática Engenharia - Iniciando aplicação...');
console.log('📍 URL:', window.location.href);
console.log('🔧 Ambiente:', import.meta.env.MODE);

// Check environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗');
  console.error('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗');

  // Show error to user
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; font-family: system-ui; text-align: center;">
        <h1 style="color: #e74c3c;">⚠️ Erro de Configuração</h1>
        <p style="color: #666;">As variáveis de ambiente não estão configuradas.</p>
        <p style="color: #666;">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no servidor de deploy.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #999;">Para debug, acesse: <a href="/debug.html">/debug.html</a></p>
      </div>
    `;
  }
} else {
  console.log('✓ Variáveis de ambiente configuradas');

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✓ Service Worker registrado:', registration);
        })
        .catch((registrationError) => {
          console.warn('⚠ Falha ao registrar Service Worker:', registrationError);
        });
    });
  }

  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Elemento #root não encontrado no DOM');
    }

    console.log('✓ Renderizando App...');
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('✓ App renderizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 40px; font-family: system-ui; text-align: center;">
          <h1 style="color: #e74c3c;">❌ Erro ao Inicializar</h1>
          <p style="color: #666;">${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
          <p style="font-size: 14px; color: #999;">Abra o console (F12) para mais detalhes</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 14px; color: #999;">Para debug, acesse: <a href="/debug.html">/debug.html</a></p>
        </div>
      `;
    }
  }
}
