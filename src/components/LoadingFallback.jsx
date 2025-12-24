import { memo } from 'react';

/**
 * Loading fallback component for Suspense boundaries
 * Provides a smooth loading experience with spinner and text
 */
function LoadingFallback({ message = 'Loading...', size = 'medium' }) {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        {/* Spinner */}
        <div
          className={`${sizeClasses[size]} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
          role="status"
          aria-label="Loading"
        />
      </div>
      <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
        {message}
      </p>
    </div>
  );
}

export default memo(LoadingFallback);
