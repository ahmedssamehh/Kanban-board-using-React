import { useBoardState } from '../hooks/useBoardState';

function SyncIndicator() {
  const { state } = useBoardState();
  const { syncing } = state;

  if (!syncing) return null;

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

export default SyncIndicator;
