import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

console.log('Main.jsx loaded - starting initialization...');

// Show loading message while MSW initializes
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  console.log('Root element found');
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: #f5f5f5;">
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔄</div>
        <div style="font-size: 18px; color: #333;">Initializing Kanban Board...</div>
        <div style="font-size: 12px; color: #666; margin-top: 10px;">Setting up Mock Service Worker</div>
      </div>
    </div>
  `;
}

// Start MSW in development
async function enableMocking() {
  console.log('Environment mode:', import.meta.env.MODE);
  
  if (import.meta.env.MODE !== 'development') {
    console.log('Not in development mode, skipping MSW');
    return;
  }

  try {
    console.log('Loading MSW browser module...');
    const { worker } = await import('./mocks/browser');

    console.log('Starting MSW worker...');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    
    console.log('[MSW] ✅ Mocking enabled - API calls will be intercepted');
  } catch (error) {
    console.error('❌ Failed to start MSW:', error);
    // Don't block app loading if MSW fails
    return Promise.resolve();
  }
}

console.log('Starting MSW initialization...');
enableMocking()
  .then(() => {
    console.log('MSW initialization complete, rendering app...');
    try {
      const root = createRoot(document.getElementById('root'));
      console.log('React root created, rendering...');
      
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      
      console.log('✅ App rendered successfully');
    } catch (error) {
      console.error('❌ Failed to render app:', error);
      document.body.innerHTML = `
        <div style="padding: 40px; font-family: Arial; background: #fff;">
          <h1 style="color: #f44336;">Error Loading Application</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Stack:</strong></p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${error.stack}</pre>
          <hr style="margin: 20px 0;">
          <p><strong>Troubleshooting steps:</strong></p>
          <ol style="text-align: left;">
            <li>Open browser DevTools (F12) and check the Console tab</li>
            <li><a href="/troubleshoot.html" style="color: #2196F3;">Clear localStorage and cache</a></li>
            <li>Try a hard refresh (Ctrl+Shift+R)</li>
            <li>Check the Network tab for failed requests</li>
          </ol>
        </div>
      `;
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error during initialization:', error);
  });
