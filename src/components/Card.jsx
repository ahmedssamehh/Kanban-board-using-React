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
        className={`card bg-white rounded-md p-3 shadow-sm hover:shadow-md cursor-pointer transition-all ${
          isDragging ? 'opacity-50' : ''
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
        <h3 className="font-medium text-gray-800 mb-2">{card.title}</h3>
        {card.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {card.description}
          </p>
        )}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <span
                key={`${card.id}-${tag}`}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
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
