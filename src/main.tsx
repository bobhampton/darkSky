import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ObserverProvider } from '@/context';
import { initWebVitals } from '@/utils/webVitals';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ObserverProvider>
      <App />
    </ObserverProvider>
  </StrictMode>,
);

// Initialize Web Vitals monitoring (production only)
initWebVitals();

