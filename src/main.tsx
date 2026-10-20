import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { initWebVitals } from '@/utils/webVitals';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pages are prerendered at build time (see vite.config.ts). Hydrate only when the HTML
// was rendered for this path; e.g. the 404.html redirect serves the homepage HTML for
// other URLs, and in dev the root is empty.
if (container.dataset.prerenderedPath === window.location.pathname) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

// Initialize Web Vitals monitoring (production only)
initWebVitals();
