import { renderHook, act, waitFor } from '@testing-library/react';
import { useUndoRedo } from '../useUndoRedo';

describe('useUndoRedo', () => {
    const initialState = {
        lists: [],
        cards: {},
        version: 1,
    };

    test('should initialize with initial state', () => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        expect(result.current.currentState).toEqual(initialState);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.historyLength).toBe(1);
        expect(result.current.currentIndex).toBe(0);
    });

    test('should push new state to history', async() => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        const newState = {
            ...initialState,
            lists: [{ id: '1', name: 'Test List' }],
        };

        act(() => {
            result.current.pushState(newState);
        });

        await waitFor(() => {
            expect(result.current.currentState).toEqual(newState);
        });

        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.historyLength).toBe(2);
    });

    test('should provide undo/redo methods', () => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        expect(result.current.undo).toBeDefined();
        expect(typeof result.current.undo).toBe('function');
        expect(result.current.redo).toBeDefined();
        expect(typeof result.current.redo).toBe('function');
        expect(result.current.pushState).toBeDefined();
        expect(typeof result.current.pushState).toBe('function');
    });

    test('should not undo beyond initial state', () => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        act(() => {
            result.current.undo();
        });

        expect(result.current.currentState).toEqual(initialState);
        expect(result.current.canUndo).toBe(false);
    });

    test('should not redo beyond latest state', () => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        act(() => {
            result.current.redo();
        });

        expect(result.current.currentState).toEqual(initialState);
        expect(result.current.canRedo).toBe(false);
    });

    test('should clear history', () => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        act(() => {
            result.current.pushState({...initialState, version: 2 });
            result.current.pushState({...initialState, version: 3 });
        });

        act(() => {
            result.current.clearHistory();
        });

        expect(result.current.historyLength).toBe(1);
        expect(result.current.currentState).toEqual(initialState);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    test('should provide history info', () => {
        const { result } = renderHook(() => useUndoRedo(initialState));

        const historyInfo = result.current.getHistoryInfo();

        expect(historyInfo.total).toBe(1);
        expect(historyInfo.currentIndex).toBe(0);
        expect(historyInfo.canUndo).toBe(false);
        expect(historyInfo.canRedo).toBe(false);
        expect(historyInfo.states).toHaveLength(1);
    });
});