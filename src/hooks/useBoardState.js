import { useContext, useCallback } from 'react';
import { BoardContext } from '../context/BoardProvider';

/**
 * Custom hook for managing board state
 * 
 * Provides a simplified interface to the board reducer with typed actions.
 * Wraps reducer dispatch calls with convenient methods for common operations.
 * 
 * @returns {Object} Board state and action methods
 * @returns {Object} state - Current board state
 * @returns {Function} dispatch - Raw dispatch function
 * @returns {Function} dispatchWithOptimistic - Optimistic update dispatch
 * @returns {Function} performSync - Trigger manual sync
 * @returns {Object} ACTIONS - Action type constants
 * @returns {Object} actions - Convenient action creators
 * 
 * @throws {Error} If used outside BoardProvider
 * 
 * @example
 * const { state, actions } = useBoardState();
 * 
 * // Add a new list
 * actions.addList('My List');
 * 
 * // Add a card to a list
 * actions.addCard(listId, { title: 'New Card', description: '' });
 * 
 * // Update a card
 * actions.updateCard(listId, cardId, { title: 'Updated' });
 */
export function useBoardState() {
    const context = useContext(BoardContext);

    if (!context) {
        throw new Error('useBoardState must be used within a BoardProvider');
    }

    const { state, dispatch, dispatchWithOptimistic, performSync, ACTIONS } = context;

    // Action creators for common operations
    const actions = {
        /**
         * Add a new list to the board
         * @param {string} title - List title
         */
        addList: useCallback((title) => {
            dispatchWithOptimistic({ type: ACTIONS.ADD_LIST, payload: { title } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Rename an existing list
         * @param {string} listId - List ID
         * @param {string} title - New title
         */
        renameList: useCallback((listId, title) => {
            dispatchWithOptimistic({ type: ACTIONS.RENAME_LIST, payload: { listId, title } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Archive a list
         * @param {string} listId - List ID
         */
        archiveList: useCallback((listId) => {
            dispatchWithOptimistic({ type: ACTIONS.ARCHIVE_LIST, payload: { listId } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Restore an archived list
         * @param {string} listId - List ID
         */
        restoreList: useCallback((listId) => {
            dispatchWithOptimistic({ type: ACTIONS.RESTORE_LIST, payload: { listId } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Delete a list permanently
         * @param {string} listId - List ID
         */
        deleteList: useCallback((listId) => {
            dispatchWithOptimistic({ type: ACTIONS.DELETE_LIST, payload: { listId } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Add a new card to a list
         * @param {string} listId - List ID
         * @param {Object} card - Card data (title, description, tags)
         */
        addCard: useCallback((listId, card) => {
            dispatchWithOptimistic({ type: ACTIONS.ADD_CARD, payload: { listId, card } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Update an existing card
         * @param {string} listId - List ID
         * @param {string} cardId - Card ID
         * @param {Object} updates - Fields to update
         */
        updateCard: useCallback((listId, cardId, updates) => {
            dispatchWithOptimistic({ type: ACTIONS.UPDATE_CARD, payload: { listId, cardId, updates } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Delete a card
         * @param {string} listId - List ID
         * @param {string} cardId - Card ID
         */
        deleteCard: useCallback((listId, cardId) => {
            dispatchWithOptimistic({ type: ACTIONS.DELETE_CARD, payload: { listId, cardId } });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Move a card between lists
         * @param {string} sourceListId - Source list ID
         * @param {string} destinationListId - Destination list ID
         * @param {string} cardId - Card ID
         * @param {number} destinationIndex - Target index in destination
         */
        moveCard: useCallback((sourceListId, destinationListId, cardId, destinationIndex) => {
            dispatchWithOptimistic({
                type: ACTIONS.MOVE_CARD,
                payload: { sourceListId, destinationListId, cardId, destinationIndex }
            });
        }, [dispatchWithOptimistic, ACTIONS]),

        /**
         * Clear all board data
         */
        clearBoard: useCallback(() => {
            dispatch({ type: ACTIONS.CLEAR_BOARD });
        }, [dispatch, ACTIONS]),

        /**
         * Clear error messages
         */
        clearError: useCallback(() => {
            dispatch({ type: ACTIONS.CLEAR_ERROR });
        }, [dispatch, ACTIONS]),
    };

    return {
        state,
        dispatch,
        dispatchWithOptimistic,
        performSync,
        ACTIONS,
        actions,
    };
}