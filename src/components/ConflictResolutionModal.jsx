import { useState } from 'react';
import { useBoardState } from '../hooks/useBoardState';

function ConflictResolutionModal() {
  const { state, dispatch, ACTIONS } = useBoardState();
  const { conflicts } = state;
  const [resolutions, setResolutions] = useState({});

  if (!conflicts || conflicts.length === 0) return null;

  const handleResolve = (index, choice) => {
    setResolutions((prev) => ({ ...prev, [index]: choice }));
    dispatch({
      type: ACTIONS.RESOLVE_CONFLICT,
      payload: { conflictIndex: index, resolution: choice },
    });
  };

  const handleApplyAll = () => {
    // Build merged state based on resolutions
    const mergedState = { ...state };
    const newLists = [...state.lists];
    const newCards = { ...state.cards };

    conflicts.forEach((conflict, index) => {
      const resolution = resolutions[index] || 'server';

      if (conflict.type === 'list') {
        const listIndex = newLists.findIndex((l) => l.id === conflict.id);
        if (listIndex !== -1) {
          newLists[listIndex] = resolution === 'local' ? conflict.local : conflict.server;
        }
      } else if (conflict.type === 'card') {
        const cards = newCards[conflict.listId] || [];
        const cardIndex = cards.findIndex((c) => c.id === conflict.id);
        if (cardIndex !== -1) {
          cards[cardIndex] = resolution === 'local' ? conflict.local : conflict.server;
          newCards[conflict.listId] = cards;
        }
      }
    });

    dispatch({
      type: ACTIONS.APPLY_MERGE,
      payload: {
        mergedState: {
          lists: newLists,
          cards: newCards,
        },
      },
    });
  };

  const handleKeepServer = () => {
    dispatch({
      type: ACTIONS.APPLY_MERGE,
      payload: {
        mergedState: {
          lists: conflicts
            .filter((c) => c.type === 'list')
            .reduce((lists, conflict) => {
              const idx = lists.findIndex((l) => l.id === conflict.id);
              if (idx !== -1) lists[idx] = conflict.server;
              return lists;
            }, [...state.lists]),
          cards: conflicts
            .filter((c) => c.type === 'card')
            .reduce((cards, conflict) => {
              const listCards = cards[conflict.listId] || [];
              const cardIdx = listCards.findIndex((c) => c.id === conflict.id);
              if (cardIdx !== -1) listCards[cardIdx] = conflict.server;
              cards[conflict.listId] = listCards;
              return cards;
            }, { ...state.cards }),
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Resolve Sync Conflicts
        </h2>
        <p className="text-gray-600 mb-6">
          The server has newer changes that conflict with your local changes.
          Choose which version to keep for each conflict.
        </p>

        <div className="space-y-4 mb-6">
          {conflicts.map((conflict, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-gray-800">
                    {conflict.type === 'list' ? 'List' : 'Card'} Conflict
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {conflict.type === 'list'
                      ? conflict.local?.title || conflict.server?.title
                      : conflict.local?.title || conflict.server?.title}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Local Version */}
                <button
                  onClick={() => handleResolve(index, 'local')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    resolutions[index] === 'local'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-blue-600 mb-2">
                    Your Version
                  </div>
                  {conflict.conflicts.map((field, i) => (
                    <div key={i} className="text-sm mb-1">
                      <span className="font-medium">{field.field}:</span>{' '}
                      <span className="text-gray-700">
                        {JSON.stringify(field.local)}
                      </span>
                    </div>
                  ))}
                </button>

                {/* Server Version */}
                <button
                  onClick={() => handleResolve(index, 'server')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    resolutions[index] === 'server' || !resolutions[index]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold text-green-600 mb-2">
                    Server Version
                  </div>
                  {conflict.conflicts.map((field, i) => (
                    <div key={i} className="text-sm mb-1">
                      <span className="font-medium">{field.field}:</span>{' '}
                      <span className="text-gray-700">
                        {JSON.stringify(field.server)}
                      </span>
                    </div>
                  ))}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleKeepServer}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Keep All Server Changes
          </button>
          <button
            onClick={handleApplyAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Selected
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConflictResolutionModal;
