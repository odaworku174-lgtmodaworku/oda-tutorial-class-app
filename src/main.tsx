import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Workbox Service Worker for offline lesson caching & PWA compliance
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[SW] New version available.');
  },
  onOfflineReady() {
    console.log('[SW] ODA Educational App is ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

