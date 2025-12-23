import { useState, useEffect, useCallback, useRef } from 'react';
import { getSyncQueue, addToSyncQueue, removeFromSyncQueue, clearSyncQueue } from '../services/syncQueue';
import { saveBoard, loadBoard } from '../services/storage';
import { api } from '../services/api';

/**
 * Custom hook for managing offline synchronization
 * 
 * Handles:
 * - Local persistence to localStorage
 * - Sync queue management for offline operations
 * - Retry logic with exponential backoff
 * - Network state detection
 * - Server interaction with conflict detection
 * 
 * @param {Object} boardState - Current board state
 * @param {Function} onConflict - Callback when conflicts are detected
 * @returns {Object} Sync state and control methods
 * 
 * @example
 * const { 
 *   isOnline, 
 *   isSyncing, 
 *   queueLength,
 *   syncNow,
 *   clearQueue 
 * } = useOfflineSync(state, handleConflict);
 * 
 * // Manually trigger sync
 * await syncNow();
 * 
 * // Check if offline
 * if (!isOnline) {
 *   showOfflineMessage();
 * }
 */
export function useOfflineSync(boardState, onConflict) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [queueLength, setQueueLength] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [syncError, setSyncError] = useState(null);
    
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    /**
     * Update queue length from localStorage
     */
    const updateQueueLength = useCallback(() => {
        setQueueLength(getSyncQueue().length);
    }, []);

    /**
     * Calculate exponential backoff delay
     */
    const getRetryDelay = useCallback(() => {
        return baseDelay * Math.pow(2, retryCountRef.current);
    }, []);

    /**
     * Process sync queue with retry logic
     */
    const processSyncQueue = useCallback(async () => {
        const queue = getSyncQueue();
        
        for (const item of queue) {
            try {
                if (item.apiCall) {
                    await item.apiCall();
                }
                removeFromSyncQueue(item.id);
                retryCountRef.current = 0; // Reset on success
            } catch (error) {
                if (retryCountRef.current < maxRetries) {
                    retryCountRef.current++;
                    const delay = getRetryDelay();
                    await new Promise(resolve => setTimeout(resolve, delay));
                    // Item stays in queue for next retry
                } else {
                    // Max retries exceeded, remove from queue
                    removeFromSyncQueue(item.id);
                    retryCountRef.current = 0;
                    throw error;
                }
            }
        }
        
        updateQueueLength();
    }, [updateQueueLength, getRetryDelay]);

    /**
     * Sync board state with server
     */
    const syncWithServer = useCallback(async () => {
        if (!isOnline) {
            return;
        }

        setIsSyncing(true);
        setSyncError(null);

        try {
            // Fetch latest server state
            const serverState = await api.getBoard();

            // Check for conflicts (simplified - full logic in BoardProvider)
            const hasConflicts = serverState.lastModified > boardState.lastModified;
            
            if (hasConflicts && onConflict) {
                onConflict(serverState);
            }

            // Process any queued operations
            await processSyncQueue();

            // Save current state to server
            await api.saveBoard(boardState);

            setLastSyncTime(Date.now());
            retryCountRef.current = 0;
        } catch (error) {
            setSyncError(error.message);
            
            // Retry with exponential backoff
            if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                const delay = getRetryDelay();
                setTimeout(() => syncWithServer(), delay);
            }
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, boardState, onConflict, processSyncQueue, getRetryDelay]);

    /**
     * Queue an operation for later sync
     */
    const queueOperation = useCallback((action, apiCall) => {
        addToSyncQueue({ action, apiCall });
        updateQueueLength();
    }, [updateQueueLength]);

    /**
     * Manually trigger sync
     */
    const syncNow = useCallback(async () => {
        if (!isSyncing) {
            await syncWithServer();
        }
    }, [isSyncing, syncWithServer]);

    /**
     * Clear sync queue
     */
    const clearQueue = useCallback(() => {
        clearSyncQueue();
        updateQueueLength();
    }, [updateQueueLength]);

    /**
     * Persist board state to localStorage
     */
    useEffect(() => {
        if (boardState) {
            saveBoard(boardState);
        }
    }, [boardState]);

    /**
     * Online/Offline detection
     */
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setSyncError(null);
            // Trigger immediate sync when coming back online
            syncWithServer();
        };

        const handleOffline = () => {
            setIsOnline(false);
            setSyncError('You are offline. Changes will sync when reconnected.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncWithServer]);

    /**
     * Update queue length periodically
     */
    useEffect(() => {
        updateQueueLength();
        const interval = setInterval(updateQueueLength, 1000);
        return () => clearInterval(interval);
    }, [updateQueueLength]);

    return {
        isOnline,
        isSyncing,
        queueLength,
        lastSyncTime,
        syncError,
        syncNow,
        queueOperation,
        clearQueue,
        processSyncQueue,
    };
}
