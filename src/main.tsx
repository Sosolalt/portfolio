import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Globals first, component CSS modules after: this fixes the injection order so
// a module rule never loses a specificity tie to a global one by accident.
import './styles/global.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
