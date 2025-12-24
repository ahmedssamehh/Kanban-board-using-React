import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for multi-level undo/redo functionality
 * 
 * Maintains a history stack of board states and provides methods to
 * navigate through history with undo and redo operations.
 * 
 * Features:
 * - Multi-level undo/redo (configurable max history)
 * - State snapshots with timestamps
 * - Pointer-based navigation
 * - History size limits to prevent memory issues
 * 
 * @param {Object} initialState - Initial board state
 * @param {number} maxHistorySize - Maximum number of states to keep (default: 50)
 * @returns {Object} Undo/redo state and control methods
 * 
 * @example
 * const { 
 *   currentState, 
 *   canUndo, 
 *   canRedo,
 *   undo,
 *   redo,
 *   pushState,
 *   clearHistory 
 * } = useUndoRedo(initialState);
 * 
 * // Save state after action
 * pushState(newState);
 * 
 * // Undo last action
 * if (canUndo) {
 *   const previousState = undo();
 * }
 * 
 * // Redo undone action
 * if (canRedo) {
 *   const nextState = redo();
 * }
 */
export function useUndoRedo(initialState, maxHistorySize = 50) {
    // History stack stores all states
    // Use lazy initialization to avoid calling Date.now() during render
    const [history, setHistory] = useState(() => [{
        state: initialState,
        timestamp: Date.now(),
    }]);

    // Current position in history
    const [currentIndex, setCurrentIndex] = useState(0);

    // Track if currently undoing/redoing to prevent double pushes
    const isNavigatingRef = useRef(false);

    // Sync currentState with history[currentIndex]
    const [currentState, setCurrentState] = useState(initialState);

    useEffect(() => {
        const newState = history[currentIndex]?.state || initialState;
        setCurrentState(newState);
    }, [currentIndex, history, initialState]);

    /**
     * Check if undo is available
     */
    const canUndo = currentIndex > 0;

    /**
     * Check if redo is available
     */
    const canRedo = currentIndex < history.length - 1;

    /**
     * Push a new state to history
     * @param {Object} newState - State to add to history
     */
    const pushState = useCallback((newState) => {
        // Don't push if we're navigating history
        if (isNavigatingRef.current) {
            return;
        }

        setHistory((prevHistory) => {
            // Remove any states after current index (for branching)
            const newHistory = prevHistory.slice(0, currentIndex + 1);

            // Add new state
            newHistory.push({
                state: newState,
                timestamp: Date.now(),
            });

            // Limit history size
            if (newHistory.length > maxHistorySize) {
                newHistory.shift(); // Remove oldest
                return newHistory;
            }

            return newHistory;
        });

        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            return newIndex >= maxHistorySize ? maxHistorySize - 1 : newIndex;
        });
    }, [currentIndex, maxHistorySize]);

    /**
     * Undo to previous state
     * @returns {Object} Previous state or current if at beginning
     */
    const undo = useCallback(() => {
        if (!canUndo) {
            return currentState;
        }

        isNavigatingRef.current = true;
        setCurrentIndex((prevIndex) => prevIndex - 1);

        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 0);

        return history[currentIndex - 1]?.state || currentState;
    }, [canUndo, currentIndex, currentState, history]);

    /**
     * Redo to next state
     * @returns {Object} Next state or current if at end
     */
    const redo = useCallback(() => {
        if (!canRedo) {
            return currentState;
        }

        isNavigatingRef.current = true;
        setCurrentIndex((prevIndex) => prevIndex + 1);

        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 0);

        return history[currentIndex + 1]?.state || currentState;
    }, [canRedo, currentIndex, currentState, history]);

    /**
     * Clear all history and reset to initial state
     */
    const clearHistory = useCallback(() => {
        setHistory([{
            state: initialState,
            timestamp: Date.now(),
        }]);
        setCurrentIndex(0);
        isNavigatingRef.current = false;
    }, [initialState]);

    /**
     * Jump to specific index in history
     * @param {number} index - Target history index
     * @returns {Object} State at target index
     */
    const jumpToIndex = useCallback((index) => {
        if (index < 0 || index >= history.length) {
            return currentState;
        }

        isNavigatingRef.current = true;
        setCurrentIndex(index);

        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 0);

        return history[index]?.state || currentState;
    }, [history, currentState]);

    /**
     * Get history metadata (for debugging/visualization)
     */
    const getHistoryInfo = useCallback(() => {
        return {
            total: history.length,
            currentIndex,
            canUndo,
            canRedo,
            states: history.map((entry, index) => ({
                index,
                timestamp: entry.timestamp,
                isCurrent: index === currentIndex,
            })),
        };
    }, [history, currentIndex, canUndo, canRedo]);

    return {
        currentState,
        canUndo,
        canRedo,
        undo,
        redo,
        pushState,
        clearHistory,
        jumpToIndex,
        getHistoryInfo,
        historyLength: history.length,
        currentIndex,
    };
}