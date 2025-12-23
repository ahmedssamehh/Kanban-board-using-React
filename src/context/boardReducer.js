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
};

// Initial state
export const initialState = {
  lists: [],
  cards: {},
  boardTitle: 'My Kanban Board',
  lastModified: Date.now(),
};

// Board reducer
export function boardReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_LIST: {
      const newList = {
        id: generateId(),
        title: action.payload.title,
        order: state.lists.length,
        archived: false,
        createdAt: Date.now(),
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

    case ACTIONS.RENAME_LIST: {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listId
            ? { ...list, title: action.payload.title }
            : list
        ),
        lastModified: Date.now(),
      };
    }

    case ACTIONS.ARCHIVE_LIST: {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listId ? { ...list, archived: true } : list
        ),
        lastModified: Date.now(),
      };
    }

    case ACTIONS.RESTORE_LIST: {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.listId
            ? { ...list, archived: false }
            : list
        ),
        lastModified: Date.now(),
      };
    }

    case ACTIONS.DELETE_LIST: {
      const { listId } = action.payload;
      // eslint-disable-next-line no-unused-vars
      const { [listId]: _removed, ...remainingCards } = state.cards;
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== listId),
        cards: remainingCards,
        lastModified: Date.now(),
      };
    }

    case ACTIONS.ADD_CARD: {
      const { listId, card } = action.payload;
      const newCard = {
        id: generateId(),
        ...card,
        createdAt: Date.now(),
        updatedAt: Date.now(),
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

    case ACTIONS.UPDATE_CARD: {
      const { listId, cardId, updates } = action.payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [listId]: state.cards[listId].map((card) =>
            card.id === cardId
              ? { ...card, ...updates, updatedAt: Date.now() }
              : card
          ),
        },
        lastModified: Date.now(),
      };
    }

    case ACTIONS.DELETE_CARD: {
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

    case ACTIONS.MOVE_CARD: {
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

    case ACTIONS.REORDER_CARD: {
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

    case ACTIONS.LOAD_BOARD: {
      return {
        ...action.payload,
        lastModified: Date.now(),
      };
    }

    case ACTIONS.CLEAR_BOARD: {
      return {
        ...initialState,
        lastModified: Date.now(),
      };
    }

    default:
      return state;
  }
}
