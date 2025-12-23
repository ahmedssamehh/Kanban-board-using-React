import { useEffect } from 'react';
import { useBoardState } from '../hooks/useBoardState';

function ErrorToast() {
  const { state, dispatch, ACTIONS } = useBoardState();
  const { error } = state;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.CLEAR_ERROR });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch, ACTIONS]);

  if (!error) return null;

  return (
    <div
      className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-50"
      role="alert"
      aria-live="assertive"
    >
      <svg
        className="w-6 h-6 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p className="font-semibold">Sync Failed</p>
        <p className="text-sm">{error}</p>
      </div>
      <button
        onClick={() => dispatch({ type: ACTIONS.CLEAR_ERROR })}
        className="text-white hover:text-red-100 transition-colors"
        aria-label="Dismiss error"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default ErrorToast;
