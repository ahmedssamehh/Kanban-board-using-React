import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
// import { FixedSizeList } from 'react-window';
import { useBoardState } from '../hooks/useBoardState';
import Card from './Card';
import { validateListTitle, validateCardTitle } from '../utils/validators';
import { api } from '../services/api';
import { generateId } from '../utils/helpers';

// Threshold for virtualization - lists with >30 cards will use react-window
const VIRTUALIZATION_THRESHOLD = 30;
const USE_VIRTUALIZATION = false; // Temporarily disabled

function ListColumn({ list }) {
  const { state, dispatchWithOptimistic, ACTIONS } = useBoardState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Memoize cards array to prevent recreating on every render
  const cards = useMemo(() => state.cards[list.id] || [], [state.cards, list.id]);
  
  // Determine if we should use virtualization
  const shouldVirtualize = USE_VIRTUALIZATION && cards.length > VIRTUALIZATION_THRESHOLD;

  // Row renderer for virtualized list
  const Row = useCallback(
    ({ index, style }) => {
      const card = cards[index];
      return (
        <div style={style}>
          <div className="px-1">
            <Card key={card.id} card={card} listId={list.id} />
          </div>
        </div>
      );
    },
    [cards, list.id]
  );

  const handleRenameList = useCallback(() => {
    if (listTitle.trim() === list.title) {
      setIsEditingTitle(false);
      return;
    }

    const validation = validateListTitle(listTitle);
    if (!validation.valid) {
      alert(validation.error);
      setListTitle(list.title);
      setIsEditingTitle(false);
      return;
    }

    dispatchWithOptimistic(
      {
        type: ACTIONS.RENAME_LIST,
        payload: { listId: list.id, title: listTitle.trim() },
      },
      () => api.updateList(list.id, { title: listTitle.trim() })
    );
    setIsEditingTitle(false);
  }, [listTitle, list.title, list.id, dispatchWithOptimistic, ACTIONS]);

  const handleArchiveList = useCallback(() => {
    if (window.confirm(`Archive "${list.title}"?`)) {
      dispatchWithOptimistic(
        {
          type: ACTIONS.ARCHIVE_LIST,
          payload: { listId: list.id },
        },
        () => api.updateList(list.id, { archived: true })
      );
    }
    setShowMenu(false);
  }, [list.title, list.id, dispatchWithOptimistic, ACTIONS]);

  const handleDeleteList = useCallback(() => {
    if (window.confirm(`Delete "${list.title}" and all its cards? This cannot be undone.`)) {
      dispatchWithOptimistic(
        {
          type: ACTIONS.DELETE_LIST,
          payload: { listId: list.id },
        },
        () => api.deleteList(list.id)
      );
    }
    setShowMenu(false);
  }, [list.title, list.id, dispatchWithOptimistic, ACTIONS]);

  const handleAddCard = useCallback(() => {
    if (!newCardTitle.trim()) return;

    const validation = validateCardTitle(newCardTitle);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const newCard = {
      id: generateId(),
      title: newCardTitle.trim(),
      description: '',
      tags: [],
      createdAt: Date.now(),
    };

    dispatchWithOptimistic(
      {
        type: ACTIONS.ADD_CARD,
        payload: {
          listId: list.id,
          card: newCard,
        },
      },
      () => api.addCard(list.id, newCard)
    );

    setNewCardTitle('');
    setIsAddingCard(false);
  }, [newCardTitle, list.id, dispatchWithOptimistic, ACTIONS]);

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRenameList();
    } else if (e.key === 'Escape') {
      setListTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const finalDropIndex = dropIndex !== null ? dropIndex : cards.length;
    setDropIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { cardId, sourceListId } = data;

      // Calculate the actual destination index
      let destinationIndex = finalDropIndex;
      
      // If moving within the same list, adjust index if moving down
      if (sourceListId === list.id) {
        const sourceIndex = cards.findIndex(c => c.id === cardId);
        if (sourceIndex === -1) return;
        
        // If dropping after the source position, adjust for removal
        if (destinationIndex > sourceIndex) {
          destinationIndex -= 1;
        }
        
        // Don't move if dropping in same position
        if (sourceIndex === destinationIndex) {
          return;
        }
      }

      dispatchWithOptimistic(
        {
          type: ACTIONS.MOVE_CARD,
          payload: {
            sourceListId,
            destinationListId: list.id,
            cardId,
            destinationIndex,
          },
        },
        () => api.moveCard(sourceListId, list.id, cardId, destinationIndex)
      );
    } catch (error) {
      // Error handling for drop
    }
  };

  return (
    <div
      className={`list-column flex-shrink-0 w-72 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 flex flex-col max-h-full shadow-sm border border-gray-200 transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-blue-400 shadow-lg scale-[1.02]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* List Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditingTitle ? (
          <input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleRenameList}
            onKeyDown={handleListKeyDown}
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Edit list title"
            autoFocus
          />
        ) : (
          <>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex-1 font-bold text-gray-900 text-left hover:bg-white/50 px-3 py-2 rounded-lg transition-colors text-lg"
            >
              {list.title}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                aria-label="List options"
              >
                ⋮
              </button>
              {showMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveList();
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    📦 Archive List
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList();
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    🗑️ Delete List
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto mb-3">
        {shouldVirtualize ? (
          <FixedSizeList
            height={600}
            itemCount={cards.length}
            itemSize={130}
            width="100%"
          >
            {Row}
          </FixedSizeList>
        ) : (
          <>
            {cards.map((card, index) => (
              <div key={card.id}>
                <div
                  className={`h-2 transition-colors ${
                    dropIndex === index ? 'bg-blue-400' : 'transparent'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropIndex(index);
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e);
                  }}
                />
                <Card card={card} listId={list.id} />
              </div>
            ))}
            {/* Drop zone at the end */}
            <div
              className={`h-2 transition-colors ${
                dropIndex === cards.length ? 'bg-blue-400' : 'transparent'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropIndex(cards.length);
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(e);
              }}
            />
          </>
        )}
      </div>

      {/* Add Card */}
      {isAddingCard ? (
        <div className="mt-auto">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={handleCardKeyDown}
            placeholder="Enter card title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
            aria-label="New card title"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddCard}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="mt-auto w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded transition-colors"
          aria-label="Add card"
        >
          + Add Card
        </button>
      )}
    </div>
  );
}

// Memoize ListColumn to prevent unnecessary re-renders
export default memo(ListColumn, (prevProps, nextProps) => {
  // Custom comparison: only re-render if the list object has changed
  return (
    prevProps.list.id === nextProps.list.id &&
    prevProps.list.title === nextProps.list.title &&
    prevProps.list.archived === nextProps.list.archived
  );
});
