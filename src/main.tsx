import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully intercept and ignore benign Vite HMR WebSocket connection errors 
// to prevent any intrusive "Unhandled Rejection" overlays or logs in the container dev preview.
if (typeof window !== 'undefined') {
  const isWebsocketError = (err: any) => {
    if (!err) return false;
    const msg = err.message || String(err);
    return msg.includes('WebSocket') || msg.includes('websocket');
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isWebsocketError(event.reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (isWebsocketError(event.error) || isWebsocketError(event.message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

