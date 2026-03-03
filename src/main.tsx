import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { geotabService } from './services/geotabService';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

const renderApp = (api?: any) => {
  if (api) {
    geotabService.setApi(api);
  }
  root.render(
    <StrictMode>
      <App hasApi={!!api} />
    </StrictMode>,
  );
};

// Geotab Add-In Entry Point
(window as any).geotab = (window as any).geotab || {};
(window as any).geotab.addin = (window as any).geotab.addin || {};
(window as any).geotab.addin.thermalGuardian = () => {
  return {
    initialize(api: any, state: any, callback: () => void) {
      renderApp(api);
      callback();
    },
    focus(api: any, state: any) {
      // Optional: Refresh data on focus
    },
    blur(api: any, state: any) {
      // Optional: Pause updates on blur
    }
  };
};

// Standalone Preview Fallback
if (!(window as any).geotab?.addin?.thermalGuardian?.isAddin) {
  // If not running as an add-in, render with mock data
  renderApp();
}
