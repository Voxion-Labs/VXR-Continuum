// src/main.ts
import './styles/globals.css';
import { initVisualizer } from './ui/visualizer';
import { EdgeCookieNetwork } from './utils/mockNetwork';

console.log('🚀 VXR-Continuum Engine Started!');

// Clear any old session data on fresh load to prevent causal pollution
EdgeCookieNetwork.clearState();

// Mount the visualizer components into the DOM application target
const mountApp = () => {
  initVisualizer('app');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}