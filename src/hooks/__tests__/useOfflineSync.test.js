import { renderHook } from '@testing-library/react';
import { useOfflineSync } from '../useOfflineSync';

// Mock dependencies
jest.mock('../../services/syncQueue', () => ({
    getSyncQueue: jest.fn(() => []),
    addToSyncQueue: jest.fn(),
    removeFromSyncQueue: jest.fn(),
    clearSyncQueue: jest.fn(),
    getQueueLength: jest.fn(() => 0),
}));

jest.mock('../../services/api', () => ({
    api: {
        saveBoard: jest.fn(() => Promise.resolve({ version: 2 })),
    },
}));

describe('useOfflineSync', () => {
    let mockDispatch;
    let mockGetState;
    let mockBaseStateRef;

    beforeEach(() => {
        mockDispatch = jest.fn();
        mockGetState = jest.fn(() => ({
            lists: [],
            cards: {},
            version: 1,
        }));
        mockBaseStateRef = { current: { lists: [], cards: {}, version: 1 } };

        // Mock online state
        Object.defineProperty(window.navigator, 'onLine', {
            writable: true,
            configurable: true,
            value: true,
        });
    });

    test('should initialize with online state', () => {
        const { result } = renderHook(() =>
            useOfflineSync(mockDispatch, mockGetState, mockBaseStateRef)
        );

        expect(result.current.isOnline).toBe(true);
        expect(result.current.isSyncing).toBe(false);
    });

    test('should initialize with offline state', () => {
        Object.defineProperty(window.navigator, 'onLine', {
            writable: true,
            configurable: true,
            value: false,
        });

        const { result } = renderHook(() =>
            useOfflineSync(mockDispatch, mockGetState, mockBaseStateRef)
        );

        expect(result.current.isOnline).toBe(false);
    });

    test('should provide sync methods', () => {
        const { result } = renderHook(() =>
            useOfflineSync(mockDispatch, mockGetState, mockBaseStateRef)
        );

        expect(result.current.syncNow).toBeDefined();
        expect(typeof result.current.syncNow).toBe('function');
        expect(result.current.queueOperation).toBeDefined();
        expect(typeof result.current.queueOperation).toBe('function');
        expect(result.current.clearQueue).toBeDefined();
        expect(typeof result.current.clearQueue).toBe('function');
    });

    test('should have sync status properties', () => {
        const { result } = renderHook(() =>
            useOfflineSync(mockDispatch, mockGetState, mockBaseStateRef)
        );

        expect(result.current).toHaveProperty('isOnline');
        expect(result.current).toHaveProperty('isSyncing');
        expect(result.current).toHaveProperty('queueLength');
        expect(result.current).toHaveProperty('lastSyncTime');
        expect(result.current).toHaveProperty('syncError');
    });
});