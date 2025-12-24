import { memo, useState, lazy, Suspense } from 'react';
import LoadingFallback from './LoadingFallback';

const CardDetailModal = lazy(() => import('./CardDetailModal'));

function Card({ card, listId }) {
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ cardId: card.id, sourceListId: listId })
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => setShowModal(true)}
        className={`card bg-white rounded-lg p-4 shadow-md hover:shadow-xl cursor-pointer transition-all duration-200 border border-gray-100 hover:border-blue-200 ${
          isDragging ? 'opacity-50 rotate-2 scale-95' : 'hover:-translate-y-0.5'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowModal(true);
          }
        }}
        aria-label={`Card: ${card.title}`}
      >
        <h3 className="font-semibold text-gray-900 mb-2 text-base">{card.title}</h3>
        {card.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {card.description}
          </p>
        )}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {card.tags.map((tag) => (
              <span
                key={`${card.id}-${tag}`}
                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Suspense fallback={<LoadingFallback message="Loading card details..." size="medium" />}>
          <CardDetailModal
            card={card}
            listId={listId}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}
    </>
  );
}

// Memoize the Card component for performance
export default memo(Card);
