import { describe, test, expect, beforeEach } from '@jest/globals';
import { boardReducer, initialState, ACTIONS } from '../../context/boardReducer';

describe('Board Reducer Integration Tests', () => {
    let state;

    beforeEach(() => {
        state = {
            ...initialState,
            lists: [
                { id: 'list-1', title: 'To Do', archived: false, version: 1 },
                { id: 'list-2', title: 'Done', archived: false, version: 1 },
            ],
            cards: {
                'list-1': [
                    { id: 'card-1', title: 'Task 1', version: 1 },
                    { id: 'card-2', title: 'Task 2', version: 1 },
                ],
                'list-2': [],
            },
        };
    });

    describe('List Operations', () => {
        test('ADD_LIST creates new list with cards array', () => {
            const action = {
                type: ACTIONS.ADD_LIST,
                payload: { title: 'In Progress' },
            };

            const newState = boardReducer(state, action);

            expect(newState.lists).toHaveLength(3);
            expect(newState.lists[2].title).toBe('In Progress');
            // Check that cards object has a key for the new list with empty array
            const newListId = newState.lists[2].id;
            expect(newState.cards[newListId]).toEqual([]);
        });

        test('RENAME_LIST updates list title', () => {
            const action = {
                type: ACTIONS.RENAME_LIST,
                payload: { listId: 'list-1', title: 'Backlog' },
            };

            const newState = boardReducer(state, action);

            expect(newState.lists[0].title).toBe('Backlog');
            expect(newState.lists[0].lastModifiedAt).toBeDefined();
        });

        test('ARCHIVE_LIST marks list as archived', () => {
            const action = {
                type: ACTIONS.ARCHIVE_LIST,
                payload: { listId: 'list-1' },
            };

            const newState = boardReducer(state, action);

            expect(newState.lists[0].archived).toBe(true);
        });

        test('DELETE_LIST removes list and its cards', () => {
            const action = {
                type: ACTIONS.DELETE_LIST,
                payload: { listId: 'list-1' },
            };

            const newState = boardReducer(state, action);

            expect(newState.lists).toHaveLength(1);
            expect(newState.cards['list-1']).toBeUndefined();
        });
    });

    describe('Card Operations', () => {
        test('ADD_CARD adds card to list', () => {
            const newCard = { id: 'card-3', title: 'Task 3' };
            const action = {
                type: ACTIONS.ADD_CARD,
                payload: { listId: 'list-1', card: newCard },
            };

            const newState = boardReducer(state, action);

            expect(newState.cards['list-1']).toHaveLength(3);
            expect(newState.cards['list-1'][2].title).toBe('Task 3');
        });

        test('UPDATE_CARD modifies card properties', () => {
            const action = {
                type: ACTIONS.UPDATE_CARD,
                payload: {
                    listId: 'list-1',
                    cardId: 'card-1',
                    updates: { title: 'Updated Task', priority: 'high' },
                },
            };

            const newState = boardReducer(state, action);

            expect(newState.cards['list-1'][0].title).toBe('Updated Task');
            expect(newState.cards['list-1'][0].priority).toBe('high');
        });

        test('DELETE_CARD removes card from list', () => {
            const action = {
                type: ACTIONS.DELETE_CARD,
                payload: { listId: 'list-1', cardId: 'card-1' },
            };

            const newState = boardReducer(state, action);

            expect(newState.cards['list-1']).toHaveLength(1);
            expect(newState.cards['list-1'][0].id).toBe('card-2');
        });

        test('MOVE_CARD moves card between lists', () => {
            const action = {
                type: ACTIONS.MOVE_CARD,
                payload: {
                    sourceListId: 'list-1',
                    destinationListId: 'list-2',
                    cardId: 'card-1',
                    destinationIndex: 0,
                },
            };

            const newState = boardReducer(state, action);

            expect(newState.cards['list-1']).toHaveLength(1);
            expect(newState.cards['list-2']).toHaveLength(1);
            expect(newState.cards['list-2'][0].id).toBe('card-1');
        });

        test('MOVE_CARD within same list reorders cards', () => {
            // When moving card-1 (currently at index 0) to index 1
            // Expected result: card-1 moves after card-2
            const action = {
                type: ACTIONS.MOVE_CARD,
                payload: {
                    sourceListId: 'list-1',
                    destinationListId: 'list-1',
                    cardId: 'card-1',
                    destinationIndex: 1,
                },
            };

            const newState = boardReducer(state, action);

            // After moving card-1 from index 0 to index 1:
            // Remove card-1: [card-2]
            // Insert card-1 at index 1: [card-2, card-1]
            expect(newState.cards['list-1']).toHaveLength(2);
            expect(newState.cards['list-1'][0].id).toBe('card-2');
            expect(newState.cards['list-1'][1].id).toBe('card-1');
        });
    });

    describe('Sync Operations', () => {
        test('SYNC_START sets syncing flag', () => {
            const action = { type: ACTIONS.SYNC_START };
            const newState = boardReducer(state, action);

            expect(newState.syncing).toBe(true);
        });

        test('SYNC_SUCCESS clears syncing flag', () => {
            state.syncing = true;
            const action = { type: ACTIONS.SYNC_SUCCESS };
            const newState = boardReducer(state, action);

            expect(newState.syncing).toBe(false);
            expect(newState.error).toBeNull();
        });

        test('SYNC_FAILURE sets error message', () => {
            const action = {
                type: ACTIONS.SYNC_FAILURE,
                payload: { error: 'Network error' },
            };
            const newState = boardReducer(state, action);

            expect(newState.syncing).toBe(false);
            expect(newState.error).toBe('Network error');
        });

        test('APPLY_MERGE updates state with merged data', () => {
            const mergedState = {
                lists: [{ id: 'list-3', title: 'New List' }],
                cards: { 'list-3': [] },
            };
            const action = {
                type: ACTIONS.APPLY_MERGE,
                payload: { mergedState },
            };

            const newState = boardReducer(state, action);

            expect(newState.lists).toEqual(mergedState.lists);
            expect(newState.cards).toEqual(mergedState.cards);
        });
    });

    describe('Error Handling', () => {
        test('CLEAR_ERROR removes error message', () => {
            state.error = 'Some error';
            const action = { type: ACTIONS.CLEAR_ERROR };
            const newState = boardReducer(state, action);

            expect(newState.error).toBeNull();
        });

        test('unknown action returns current state', () => {
            const action = { type: 'UNKNOWN_ACTION' };
            const newState = boardReducer(state, action);

            expect(newState).toEqual(state);
        });
    });

    describe('Complex Workflows', () => {
        test('can move card multiple times', () => {
            // Move card from list-1 to list-2
            let newState = boardReducer(state, {
                type: ACTIONS.MOVE_CARD,
                payload: {
                    sourceListId: 'list-1',
                    destinationListId: 'list-2',
                    cardId: 'card-1',
                    destinationIndex: 0,
                },
            });

            expect(newState.cards['list-2']).toHaveLength(1);

            // Move it back to list-1
            newState = boardReducer(newState, {
                type: ACTIONS.MOVE_CARD,
                payload: {
                    sourceListId: 'list-2',
                    destinationListId: 'list-1',
                    cardId: 'card-1',
                    destinationIndex: 1,
                },
            });

            expect(newState.cards['list-1']).toHaveLength(2);
            expect(newState.cards['list-2']).toHaveLength(0);
        });

        test('archiving list preserves cards', () => {
            const action = {
                type: ACTIONS.ARCHIVE_LIST,
                payload: { listId: 'list-1' },
            };

            const newState = boardReducer(state, action);

            expect(newState.lists[0].archived).toBe(true);
            expect(newState.cards['list-1']).toHaveLength(2);
        });
    });
});