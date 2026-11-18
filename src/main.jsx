import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const onRecoverableError = (error, info) => {
  console.error('React hydration error:', error, info.componentStack);
};

if (rootElement.hasChildNodes() && window.location.pathname === '/') {
  hydrateRoot(rootElement, app, { onRecoverableError });
} else {
  createRoot(rootElement).render(app);
}
