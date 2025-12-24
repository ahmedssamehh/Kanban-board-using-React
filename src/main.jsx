import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Start MSW in development
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  try {
    const { worker } = await import('./mocks/browser');

    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  } catch (error) {
    console.error('Failed to start MSW:', error);
    // Don't block app loading if MSW fails
    return Promise.resolve();
  }
}

enableMocking().then(() => {
  try {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: Arial;">
        <h1 style="color: #f44336;">Error Loading Application</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">${error.stack}</pre>
        <p><a href="/troubleshoot.html" style="color: #2196F3;">Try clearing localStorage</a></p>
      </div>
    `;
  }
});
