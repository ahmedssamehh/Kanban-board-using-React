import { useEffect, useRef } from 'react';

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <button
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
      aria-label="Close dialog"
      type="button"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full m-4"
        role="document"
      >
        <h2 id="dialog-title" className="text-xl font-bold text-gray-800 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </button>
  );
}

export default ConfirmDialog;
