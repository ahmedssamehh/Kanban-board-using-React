import { createContext, useReducer, useEffect, useCallback } from 'react';
import { boardReducer, initialState, ACTIONS } from './boardReducer';
import { saveBoard, loadBoard } from '../services/storage';
import { api } from '../services/api';

export const BoardContext = createContext(null);

function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState, () => {
    const savedBoard = loadBoard();
    return savedBoard || initialState;
  });

  // Save to localStorage whenever state changes (excluding sync-related state)
  useEffect(() => {
    const { syncing, error, previousState, ...boardData } = state;
    saveBoard(boardData);
  }, [state]);

  // Optimistic dispatch wrapper
  const dispatchWithOptimistic = useCallback(
    async (action, apiCall) => {
      // Skip sync for LOAD_BOARD and CLEAR_BOARD
      if (
        action.type === ACTIONS.LOAD_BOARD ||
        action.type === ACTIONS.CLEAR_BOARD
      ) {
        dispatch(action);
        return;
      }

      // Immediately update UI (optimistic)
      dispatch({ type: ACTIONS.SYNC_START });
      dispatch(action);

      try {
        // Make API call in background
        if (apiCall) {
          await apiCall();
        }
        // On success, clear the snapshot
        dispatch({ type: ACTIONS.SYNC_SUCCESS });
      } catch (error) {
        // On failure, rollback and show error
        dispatch({
          type: ACTIONS.SYNC_FAILURE,
          payload: { error: error.message },
        });
        dispatch({ type: ACTIONS.ROLLBACK });
      }
    },
    [dispatch]
  );

  const value = {
    state,
    dispatch,
    dispatchWithOptimistic,
    ACTIONS,
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

export default BoardProvider;
