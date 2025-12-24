import { useState, useMemo, useCallback } from 'react';
import { useBoardState } from '../hooks/useBoardState';
import ListColumn from './ListColumn';
import { validateListTitle } from '../utils/validators';
import { api } from '../services/api';
import { generateId } from '../utils/helpers';

function Board() {
  const { state, dispatchWithOptimistic, ACTIONS } = useBoardState();
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  // Memoize filtered lists to avoid recalculation on every render
  const activeLists = useMemo(
    () => state.lists.filter((list) => !list.archived),
    [state.lists]
  );

  const handleAddList = useCallback(() => {
    if (!newListTitle.trim()) return;

    const validation = validateListTitle(newListTitle);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const newList = {
      id: generateId(),
      title: newListTitle,
      order: state.lists.length,
      archived: false,
      createdAt: Date.now(),
    };

    dispatchWithOptimistic(
      {
        type: ACTIONS.ADD_LIST,
        payload: { title: newListTitle },
      },
      () => api.addList(newList)
    );

    setNewListTitle('');
    setIsAddingList(false);
  }, [newListTitle, state.lists.length, dispatchWithOptimistic, ACTIONS]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAddingList(false);
      setNewListTitle('');
    }
  }, [handleAddList]);

  return (
    <div className="board h-full overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 p-4 h-full min-w-max">
        {activeLists.map((list) => (
          <ListColumn key={list.id} list={list} />
        ))}

        {/* Add new list */}
        <div className="flex-shrink-0 w-72">
          {isAddingList ? (
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddList}
                placeholder="Enter list title..."
                autoFocus
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                aria-label="New list title"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all border-2 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600 shadow-sm hover:shadow-md"
              aria-label="Add new list"
            >
              ✨ Add List
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Board;
