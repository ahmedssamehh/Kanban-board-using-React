import { generateId } from '../utils/helpers';

// Action types
export const ACTIONS = {
    // List actions
    ADD_LIST: 'ADD_LIST',
    RENAME_LIST: 'RENAME_LIST',
    ARCHIVE_LIST: 'ARCHIVE_LIST',
    RESTORE_LIST: 'RESTORE_LIST',
    DELETE_LIST: 'DELETE_LIST',

    // Card actions
    ADD_CARD: 'ADD_CARD',
    UPDATE_CARD: 'UPDATE_CARD',
    DELETE_CARD: 'DELETE_CARD',
    MOVE_CARD: 'MOVE_CARD',
    REORDER_CARD: 'REORDER_CARD',

    // Board actions
    LOAD_BOARD: 'LOAD_BOARD',
    CLEAR_BOARD: 'CLEAR_BOARD',

    // Sync actions
    SYNC_START: 'SYNC_START',
    SYNC_SUCCESS: 'SYNC_SUCCESS',
    SYNC_FAILURE: 'SYNC_FAILURE',
    ROLLBACK: 'ROLLBACK',
    CLEAR_ERROR: 'CLEAR_ERROR',
    
    // Conflict resolution
    SET_CONFLICTS: 'SET_CONFLICTS',
    RESOLVE_CONFLICT: 'RESOLVE_CONFLICT',
    APPLY_MERGE: 'APPLY_MERGE',
};

// Initial state
export const initialState = {
    lists: [],
    cards: {},
    boardTitle: 'My Kanban Board',
    lastModified: Date.now(),
    syncing: false,
    error: null,
    previousState: null,
    baseState: null,
    conflicts: [],
    isOnline: navigator.onLine,
};

// Board reducer
export function boardReducer(state, action) {
    switch (action.type) {
        case ACTIONS.ADD_LIST:
            {
                const newList = {
                    id: generateId(),
                    title: action.payload.title,
                    order: state.lists.length,
                    archived: false,
                    createdAt: Date.now(),
                    lastModifiedAt: Date.now(),
                    version: 1,
                };
                return {
                    ...state,
                    lists: [...state.lists, newList],
                    cards: {
                        ...state.cards,
                        [newList.id]: [],
                    },
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.RENAME_LIST:
            {
                return {
                    ...state,
                    lists: state.lists.map((list) =>
                        list.id === action.payload.listId ? {
                            ...list,
                            title: action.payload.title,
                            lastModifiedAt: Date.now(),
                            version: (list.version || 1) + 1,
                        } :
                        list
                    ),
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.ARCHIVE_LIST:
            {
                return {
                    ...state,
                    lists: state.lists.map((list) =>
                        list.id === action.payload.listId ? {
                            ...list,
                            archived: true,
                            lastModifiedAt: Date.now(),
                            version: (list.version || 1) + 1,
                        } : list
                    ),
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.RESTORE_LIST:
            {
                return {
                    ...state,
                    lists: state.lists.map((list) =>
                        list.id === action.payload.listId ? {
                            ...list,
                            archived: false,
                            lastModifiedAt: Date.now(),
                            version: (list.version || 1) + 1,
                        } :
                        list
                    ),
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.DELETE_LIST:
            {
                const { listId } = action.payload;
                // eslint-disable-next-line no-unused-vars
                const {
                    [listId]: _removed, ...remainingCards
                } = state.cards;
                return {
                    ...state,
                    lists: state.lists.filter((list) => list.id !== listId),
                    cards: remainingCards,
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.ADD_CARD:
            {
                const { listId, card } = action.payload;
                const newCard = {
                    id: generateId(),
                    ...card,
                    createdAt: Date.now(),
                    lastModifiedAt: Date.now(),
                    version: 1,
                };
                return {
                    ...state,
                    cards: {
                        ...state.cards,
                        [listId]: [...(state.cards[listId] || []), newCard],
                    },
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.UPDATE_CARD:
            {
                const { listId, cardId, updates } = action.payload;
                return {
                    ...state,
                    cards: {
                        ...state.cards,
                        [listId]: state.cards[listId].map((card) =>
                            card.id === cardId ? {
                                ...card,
                                ...updates,
                                lastModifiedAt: Date.now(),
                                version: (card.version || 1) + 1,
                            } :
                            card
                        ),
                    },
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.DELETE_CARD:
            {
                const { listId, cardId } = action.payload;
                return {
                    ...state,
                    cards: {
                        ...state.cards,
                        [listId]: state.cards[listId].filter((card) => card.id !== cardId),
                    },
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.MOVE_CARD:
            {
                const { sourceListId, destinationListId, cardId, destinationIndex } =
                action.payload;

                // Find the card
                const card = state.cards[sourceListId].find((c) => c.id === cardId);
                if (!card) return state;

                // Remove from source
                const sourceCards = state.cards[sourceListId].filter(
                    (c) => c.id !== cardId
                );

                // Add to destination
                const destCards = [...(state.cards[destinationListId] || [])];
                destCards.splice(destinationIndex, 0, card);

                return {
                    ...state,
                    cards: {
                        ...state.cards,
                        [sourceListId]: sourceCards,
                        [destinationListId]: destCards,
                    },
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.REORDER_CARD:
            {
                const { listId, startIndex, endIndex } = action.payload;
                const cards = [...state.cards[listId]];
                const [removed] = cards.splice(startIndex, 1);
                cards.splice(endIndex, 0, removed);

                return {
                    ...state,
                    cards: {
                        ...state.cards,
                        [listId]: cards,
                    },
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.LOAD_BOARD:
            {
                return {
                    ...action.payload,
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.CLEAR_BOARD:
            {
                return {
                    ...initialState,
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.SYNC_START:
            {
                return {
                    ...state,
                    syncing: true,
                    error: null,
                    previousState: {
                        lists: state.lists,
                        cards: state.cards,
                        boardTitle: state.boardTitle,
                    },
                };
            }

        case ACTIONS.SYNC_SUCCESS:
            {
                return {
                    ...state,
                    syncing: false,
                    previousState: null,
                };
            }

        case ACTIONS.SYNC_FAILURE:
            {
                return {
                    ...state,
                    syncing: false,
                    error: action.payload.error,
                };
            }

        case ACTIONS.ROLLBACK:
            {
                if (!state.previousState) {
                    return state;
                }
                return {
                    ...state,
                    lists: state.previousState.lists,
                    cards: state.previousState.cards,
                    boardTitle: state.previousState.boardTitle,
                    syncing: false,
                    previousState: null,
                    lastModified: Date.now(),
                };
            }

        case ACTIONS.CLEAR_ERROR:
            {
                return {
                    ...state,
                    error: null,
                };
            }

        case ACTIONS.SET_CONFLICTS:
            {
                return {
                    ...state,
                    conflicts: action.payload.conflicts,
                    baseState: action.payload.baseState,
                    syncing: false,
                };
            }

        case ACTIONS.RESOLVE_CONFLICT:
            {
                const { conflictIndex, resolution } = action.payload;
                return {
                    ...state,
                    conflicts: state.conflicts.map((conflict, index) =>
                        index === conflictIndex ? { ...conflict, resolution } : conflict
                    ),
                };
            }

        case ACTIONS.APPLY_MERGE:
            {
                const { mergedState } = action.payload;
                return {
                    ...state,
                    ...mergedState,
                    conflicts: [],
                    baseState: null,
                    syncing: false,
                    lastModified: Date.now(),
                };
            }

        default:
            return state;
    }
}