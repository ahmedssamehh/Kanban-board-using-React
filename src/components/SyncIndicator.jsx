import { useState, useEffect } from 'react';
import { useBoardState } from '../hooks/useBoardState';
import { getQueueLength } from '../services/syncQueue';

function SyncIndicator() {
  const { state } = useBoardState();
  const { syncing } = state;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueLength(getQueueLength());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (syncing) {
    return (
      <div
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
        role="status"
        aria-live="polite"
      >
        <svg
          className="animate-spin h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Syncing...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
        role="status"
        aria-live="polite"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span>Offline</span>
        {queueLength > 0 && (
          <span className="ml-1 bg-orange-700 px-2 py-0.5 rounded-full text-xs">
            {queueLength} pending
          </span>
        )}
      </div>
    );
  }

  if (queueLength > 0) {
    return (
      <div
        className="fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
        role="status"
        aria-live="polite"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{queueLength} pending sync</span>
      </div>
    );
  }

  return null;
}

export default SyncIndicator;
