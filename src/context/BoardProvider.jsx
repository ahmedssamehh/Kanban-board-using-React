import { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { boardReducer, initialState, ACTIONS } from './boardReducer';
import { saveBoard, loadBoard } from '../services/storage';
import { api, ApiError } from '../services/api';
import { getSyncQueue, addToSyncQueue, removeFromSyncQueue } from '../services/syncQueue';
import { mergeBoardState } from '../utils/merge';

export const BoardContext = createContext(null);

function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState, () => {
    const savedBoard = loadBoard();
    return savedBoard || initialState;
  });

  const syncTimerRef = useRef(null);
  const baseStateRef = useRef(null);

  // Save to localStorage whenever state changes (excluding sync-related state)
  useEffect(() => {
    const { syncing, error, previousState, baseState, conflicts, isOnline, ...boardData } = state;
    saveBoard(boardData);
  }, [state]);

  // Background sync function
  const performSync = useCallback(async () => {
    if (state.syncing || state.conflicts.length > 0) {
      return; // Already syncing or have conflicts to resolve
    }

    try {
      // Fetch server state
      const serverResponse = await api.getBoard();
      const serverState = serverResponse;

      // Get base state (last known server state)
      const baseState = baseStateRef.current || state;

      // Perform three-way merge
      const { merged, conflicts } = mergeBoardState(
        baseState,
        state,
        serverState
      );

      if (conflicts.length > 0) {
        // Show conflict resolution UI
        dispatch({
          type: ACTIONS.SET_CONFLICTS,
          payload: {
            conflicts,
            baseState: serverState,
          },
        });
      } else {
        // No conflicts, apply merged state
        dispatch({
          type: ACTIONS.APPLY_MERGE,
          payload: { mergedState: merged },
        });
        baseStateRef.current = merged;
      }

      // Process sync queue
      const queue = getSyncQueue();
      for (const item of queue) {
        try {
          await item.apiCall();
          removeFromSyncQueue(item.id);
        } catch (err) {
          // Keep in queue for next sync
        }
      }
    } catch (error) {
      // Sync failed, will retry on next interval or reconnect
    }
  }, [state, dispatch]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
      // Trigger immediate sync when coming back online
      performSync();
    };

    const handleOffline = () => {
      dispatch({
        type: ACTIONS.SYNC_FAILURE,
        payload: { error: 'You are offline. Changes will sync when reconnected.' },
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, performSync]);

  // Periodic sync timer (every 45 seconds)
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      if (navigator.onLine) {
        performSync();
      }
    }, 45000); // 45 seconds

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [performSync]);

  // Optimistic dispatch wrapper with conflict detection
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

      // If offline, queue the operation
      if (!navigator.onLine) {
        addToSyncQueue({ action, apiCall });
        dispatch({ type: ACTIONS.SYNC_SUCCESS });
        return;
      }

      try {
        // Make API call in background
        if (apiCall) {
          await apiCall();
        }
        // On success, clear the snapshot and update base state
        dispatch({ type: ACTIONS.SYNC_SUCCESS });
        baseStateRef.current = state;
      } catch (error) {
        // Check for version conflict (409 status)
        if (error instanceof ApiError && error.status === 409) {
          // Trigger full sync to resolve conflicts
          performSync();
        } else {
          // Other errors - rollback and show error
          dispatch({
            type: ACTIONS.SYNC_FAILURE,
            payload: { error: error.message },
          });
          dispatch({ type: ACTIONS.ROLLBACK });
        }
      }
    },
    [dispatch, state, performSync]
  );

  const value = {
    state,
    dispatch,
    dispatchWithOptimistic,
    performSync,
    ACTIONS,
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

export default BoardProvider;
