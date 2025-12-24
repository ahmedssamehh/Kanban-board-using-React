import { renderHook } from '@testing-library/react';
import { useBoardState } from '../useBoardState';
import BoardProvider from '../../context/BoardProvider';
import React from 'react';

// Mock uuid to avoid jest parsing issues
jest.mock('uuid', () => ({
    v4: () => 'test-uuid',
}));

describe('useBoardState', () => {
    const wrapper = ({ children }) => React.createElement(BoardProvider, null, children);

    test('should throw error when used outside BoardProvider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        expect(() => {
            renderHook(() => useBoardState());
        }).toThrow('useBoardState must be used within a BoardProvider');

        consoleSpy.mockRestore();
    });

    test('should provide state and actions', () => {
        const { result } = renderHook(() => useBoardState(), { wrapper });

        expect(result.current.state).toBeDefined();
        expect(result.current.dispatch).toBeDefined();
        expect(result.current.actions).toBeDefined();
        expect(result.current.ACTIONS).toBeDefined();
    });

    test('should have all action creator methods', () => {
        const { result } = renderHook(() => useBoardState(), { wrapper });

        const expectedActions = [
            'addList',
            'renameList',
            'archiveList',
            'restoreList',
            'deleteList',
            'addCard',
            'updateCard',
            'deleteCard',
            'moveCard',
            'clearBoard',
            'clearError',
        ];

        expectedActions.forEach((action) => {
            expect(result.current.actions[action]).toBeDefined();
            expect(typeof result.current.actions[action]).toBe('function');
        });
    });

    test('should expose ACTIONS constants', () => {
        const { result } = renderHook(() => useBoardState(), { wrapper });

        expect(result.current.ACTIONS).toBeDefined();
        expect(result.current.ACTIONS.ADD_LIST).toBe('ADD_LIST');
        expect(result.current.ACTIONS.ADD_CARD).toBe('ADD_CARD');
    });
});