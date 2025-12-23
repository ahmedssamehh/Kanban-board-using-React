import { useState, useCallback } from 'react';
import { useBoardState } from '../hooks/useBoardState';
import Card from './Card';
import { validateListTitle, validateCardTitle } from '../utils/validators';

function ListColumn({ list }) {
  const { state, dispatch, ACTIONS } = useBoardState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const cards = state.cards[list.id] || [];

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

    dispatch({
      type: ACTIONS.RENAME_LIST,
      payload: { listId: list.id, title: listTitle.trim() },
    });
    setIsEditingTitle(false);
  }, [listTitle, list.title, list.id, dispatch, ACTIONS]);

  const handleArchiveList = useCallback(() => {
    if (window.confirm(`Archive "${list.title}"?`)) {
      dispatch({
        type: ACTIONS.ARCHIVE_LIST,
        payload: { listId: list.id },
      });
    }
    setShowMenu(false);
  }, [list.title, list.id, dispatch, ACTIONS]);

  const handleAddCard = useCallback(() => {
    if (!newCardTitle.trim()) return;

    const validation = validateCardTitle(newCardTitle);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    dispatch({
      type: ACTIONS.ADD_CARD,
      payload: {
        listId: list.id,
        card: {
          title: newCardTitle.trim(),
          description: '',
          tags: [],
        },
      },
    });

    setNewCardTitle('');
    setIsAddingCard(false);
  }, [newCardTitle, list.id, dispatch, ACTIONS]);

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

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { cardId, sourceListId } = data;

      if (sourceListId === list.id) {
        return; // Same list, no action needed
      }

      dispatch({
        type: ACTIONS.MOVE_CARD,
        payload: {
          sourceListId,
          destinationListId: list.id,
          cardId,
          destinationIndex: cards.length,
        },
      });
    } catch (error) {
      // Error handling for drop
    }
  };

  return (
    <div
      className={`list-column flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3 flex flex-col max-h-full ${
        isDragOver ? 'ring-2 ring-blue-400' : ''
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
          />
        ) : (
          <>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex-1 font-semibold text-gray-800 text-left hover:bg-gray-200 px-2 py-1 rounded"
            >
              {list.title}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 rounded"
                aria-label="List options"
              >
                ⋮
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={handleArchiveList}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Archive List
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {cards.map((card) => (
          <Card key={card.id} card={card} listId={list.id} />
        ))}
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

export default ListColumn;
