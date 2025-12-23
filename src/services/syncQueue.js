// Sync queue service for managing offline changes
const SYNC_QUEUE_KEY = 'kanban_sync_queue';

export function getSyncQueue() {
    try {
        const queue = localStorage.getItem(SYNC_QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        return [];
    }
}

export function addToSyncQueue(operation) {
    const queue = getSyncQueue();
    const queueItem = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        ...operation,
    };
    queue.push(queueItem);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    return queueItem;
}

export function removeFromSyncQueue(itemId) {
    const queue = getSyncQueue();
    const filtered = queue.filter((item) => item.id !== itemId);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
}

export function clearSyncQueue() {
    localStorage.removeItem(SYNC_QUEUE_KEY);
}

export function getQueueLength() {
    return getSyncQueue().length;
}