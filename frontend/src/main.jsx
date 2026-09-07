import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProcurementProvider } from './context/ProcurementContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProcurementProvider>
        <App />
      </ProcurementProvider>
    </BrowserRouter>
  </StrictMode>,
);
