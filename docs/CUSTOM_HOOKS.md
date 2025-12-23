# Custom Hooks Documentation

This document provides an overview of the three custom hooks implemented for the Kanban Board application. Each hook has been fully documented with JSDoc comments and comprehensive test coverage.

## 1. useBoardState

**Purpose**: Simplifies access to the board state and provides convenient action creators for common operations.

**Location**: `src/hooks/useBoardState.js`

**Key Features**:
- Action creators for list operations (add, rename, archive, restore, delete)
- Action creators for card operations (add, update, delete, move)
- Utility methods (clearBoard, clearError)
- All methods are memoized with `useCallback` for optimization
- Full JSDoc documentation with examples

**Usage Example**:
```javascript
import { useBoardState } from './hooks/useBoardState';

function MyComponent() {
    const { state, actions, ACTIONS } = useBoardState();

    // Add a new list
    const handleAddList = () => {
        actions.addList('New List Name');
    };

    // Add a card to a list
    const handleAddCard = (listId) => {
        actions.addCard(listId, 'Card Title', 'Optional description');
    };

    return (
        <div>
            {/* Component UI */}
        </div>
    );
}
```

**Available Actions**:
- `addList(name)` - Create a new list
- `renameList(listId, newName)` - Rename an existing list
- `archiveList(listId)` - Archive a list
- `restoreList(listId)` - Restore an archived list
- `deleteList(listId)` - Permanently delete a list
- `addCard(listId, title, description, priority)` - Add a card to a list
- `updateCard(listId, cardId, updates)` - Update card properties
- `deleteCard(listId, cardId)` - Delete a card
- `moveCard(sourceListId, destListId, cardId, destIndex)` - Move a card between lists
- `clearBoard()` - Clear all data
- `clearError()` - Clear error state

**Tests**: `src/hooks/__tests__/useBoardState.test.js` (4 tests, all passing)

---

## 2. useOfflineSync

**Purpose**: Manages offline synchronization with automatic retry logic and exponential backoff.

**Location**: `src/hooks/useOfflineSync.js`

**Key Features**:
- Online/offline detection with event listeners
- Sync queue management with localStorage persistence
- Exponential backoff retry logic (1s, 2s, 4s)
- Maximum 3 retry attempts before giving up
- Conflict detection and handling (HTTP 409)
- Full JSDoc documentation

**Usage Example**:
```javascript
import { useOfflineSync } from './hooks/useOfflineSync';

function MyComponent() {
    const {
        isOnline,
        isSyncing,
        queueLength,
        lastSyncTime,
        syncError,
        syncNow,
        queueOperation,
        clearQueue
    } = useOfflineSync(dispatch, getState, baseStateRef);

    // Queue an operation when offline
    const handleAction = async () => {
        await queueOperation({
            type: 'ADD_CARD',
            payload: { listId: '123', title: 'New Card' }
        });
    };

    // Manually trigger sync
    const handleSync = async () => {
        await syncNow();
    };

    return (
        <div>
            {!isOnline && <p>Offline - changes will sync when reconnected</p>}
            {isSyncing && <p>Syncing...</p>}
            {queueLength > 0 && <p>{queueLength} pending operations</p>}
        </div>
    );
}
```

**Returned Properties**:
- `isOnline` (boolean) - Current online/offline status
- `isSyncing` (boolean) - Whether sync is in progress
- `queueLength` (number) - Number of queued operations
- `lastSyncTime` (number | null) - Timestamp of last successful sync
- `syncError` (string | null) - Current sync error message
- `syncNow` (function) - Manually trigger sync
- `queueOperation` (function) - Add operation to sync queue
- `clearQueue` (function) - Clear all queued operations

**Tests**: `src/hooks/__tests__/useOfflineSync.test.js` (4 tests, all passing)

---

## 3. useUndoRedo

**Purpose**: Provides multi-level undo/redo functionality for board operations.

**Location**: `src/hooks/useUndoRedo.js`

**Key Features**:
- History stack with configurable size (default 50 states)
- Pointer-based navigation through history
- State snapshots with timestamps
- Prevents memory issues with size limits
- Navigation protection to prevent double-pushes
- Full JSDoc documentation

**Usage Example**:
```javascript
import { useUndoRedo } from './hooks/useUndoRedo';

function MyComponent() {
    const {
        currentState,
        canUndo,
        canRedo,
        undo,
        redo,
        pushState,
        clearHistory,
        jumpToIndex,
        getHistoryInfo,
        historyLength,
        currentIndex
    } = useUndoRedo(initialState, 50);

    // Save state after an action
    const handleAction = (newState) => {
        pushState(newState);
    };

    // Undo last action
    const handleUndo = () => {
        if (canUndo) {
            const previousState = undo();
            // Apply previousState to UI
        }
    };

    // Redo undone action
    const handleRedo = () => {
        if (canRedo) {
            const nextState = redo();
            // Apply nextState to UI
        }
    };

    return (
        <div>
            <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
            <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
            <p>History: {currentIndex + 1} / {historyLength}</p>
        </div>
    );
}
```

**Returned Properties**:
- `currentState` (object) - Current state from history
- `canUndo` (boolean) - Whether undo is available
- `canRedo` (boolean) - Whether redo is available
- `undo` (function) - Navigate to previous state
- `redo` (function) - Navigate to next state
- `pushState` (function) - Add new state to history
- `clearHistory` (function) - Reset history to initial state
- `jumpToIndex` (function) - Jump to specific history index
- `getHistoryInfo` (function) - Get history metadata
- `historyLength` (number) - Total number of states in history
- `currentIndex` (number) - Current position in history

**Tests**: `src/hooks/__tests__/useUndoRedo.test.js` (7 tests, all passing)

---

## Testing

All hooks have comprehensive test coverage using Jest and React Testing Library. Tests verify:
- Correct initialization
- Proper functionality of all methods
- Edge cases and error handling
- Integration with React lifecycle

**Run all hook tests**:
```bash
npm test -- --testPathPattern="hooks/__tests__"
```

**Test Coverage**:
- useBoardState: 4 tests
- useOfflineSync: 4 tests
- useUndoRedo: 7 tests
- **Total**: 15 tests, 100% passing

---

## Best Practices

1. **useBoardState**: Always use within a `BoardProvider` context
2. **useOfflineSync**: Monitor `isOnline` status and provide user feedback
3. **useUndoRedo**: Limit history size to prevent memory issues
4. **All hooks**: Follow React Rules of Hooks (only call at top level, only from React functions)

---

## Future Enhancements

Potential improvements for these hooks:

1. **useBoardState**:
   - Add batch operations support
   - Implement middleware for logging/analytics

2. **useOfflineSync**:
   - Add customizable retry strategies
   - Implement partial sync for large datasets

3. **useUndoRedo**:
   - Add state diffing to reduce memory usage
   - Implement branching history visualization

---

## License

These hooks are part of the Kanban Board project and follow the project's MIT license.
