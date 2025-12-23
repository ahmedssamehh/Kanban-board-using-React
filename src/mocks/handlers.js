import { http, HttpResponse, delay } from 'msw';

// Simulated database
let mockBoard = {
    lists: [],
    cards: {},
};

// Configuration for testing
const CONFIG = {
    NETWORK_DELAY: 500, // Simulate network delay (ms)
    FAILURE_RATE: 0.1, // 10% chance of failure
    ENABLE_FAILURES: false, // Set to true to test error handling
};

// Helper to simulate failures
const shouldFail = () => {
    // Check sessionStorage for runtime configuration
    if (typeof window !== 'undefined') {
        const enableFailures = sessionStorage.getItem('MSW_ENABLE_FAILURES');
        if (enableFailures === 'true') {
            return Math.random() < CONFIG.FAILURE_RATE;
        }
    }
    return CONFIG.ENABLE_FAILURES && Math.random() < CONFIG.FAILURE_RATE;
};

export const handlers = [
    // Get board state
    http.get('/api/board', async() => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
        }

        return HttpResponse.json(mockBoard);
    }),

    // Save entire board state
    http.post('/api/board', async({ request }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to save board' }, { status: 500 });
        }

        const body = await request.json();
        mockBoard = body;
        return HttpResponse.json({ success: true, data: mockBoard });
    }),

    // Add list
    http.post('/api/lists', async({ request }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to create list' }, { status: 500 });
        }

        const body = await request.json();
        const newList = body.list;
        mockBoard.lists.push(newList);
        mockBoard.cards[newList.id] = [];

        return HttpResponse.json({ success: true, data: newList });
    }),

    // Update list
    http.put('/api/lists/:listId', async({ request, params }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to update list' }, { status: 500 });
        }

        const { listId } = params;
        const body = await request.json();
        const index = mockBoard.lists.findIndex((l) => l.id === listId);

        if (index !== -1) {
            const existingList = mockBoard.lists[index];
            const clientVersion = body.updates.version;

            // Check for version conflict
            if (clientVersion && existingList.version && clientVersion < existingList.version) {
                return HttpResponse.json({
                    error: 'Version conflict',
                    conflict: true,
                    serverVersion: existingList,
                }, { status: 409 });
            }

            mockBoard.lists[index] = {
                ...existingList,
                ...body.updates,
                lastModifiedAt: Date.now(),
                version: (existingList.version || 1) + 1,
            };
            return HttpResponse.json({ success: true, data: mockBoard.lists[index] });
        }

        return HttpResponse.json({ error: 'List not found' }, { status: 404 });
    }),

    // Delete list
    http.delete('/api/lists/:listId', async({ params }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to delete list' }, { status: 500 });
        }

        const { listId } = params;
        mockBoard.lists = mockBoard.lists.filter((l) => l.id !== listId);
        delete mockBoard.cards[listId];

        return HttpResponse.json({ success: true });
    }),

    // Add card
    http.post('/api/cards', async({ request }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to create card' }, { status: 500 });
        }

        const body = await request.json();
        const { listId, card } = body;

        if (!mockBoard.cards[listId]) {
            mockBoard.cards[listId] = [];
        }

        mockBoard.cards[listId].push(card);
        return HttpResponse.json({ success: true, data: card });
    }),

    // Update card
    http.put('/api/cards/:cardId', async({ request, params }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to update card' }, { status: 500 });
        }

        const { cardId } = params;
        const body = await request.json();
        const { listId, updates } = body;

        const cards = mockBoard.cards[listId];
        if (cards) {
            const index = cards.findIndex((c) => c.id === cardId);
            if (index !== -1) {
                const existingCard = cards[index];
                const clientVersion = updates.version;

                // Check for version conflict
                if (clientVersion && existingCard.version && clientVersion < existingCard.version) {
                    return HttpResponse.json({
                        error: 'Version conflict',
                        conflict: true,
                        serverVersion: existingCard,
                    }, { status: 409 });
                }

                cards[index] = {
                    ...existingCard,
                    ...updates,
                    lastModifiedAt: Date.now(),
                    version: (existingCard.version || 1) + 1,
                };
                return HttpResponse.json({ success: true, data: cards[index] });
            }
        }

        return HttpResponse.json({ error: 'Card not found' }, { status: 404 });
    }),

    // Delete card
    http.delete('/api/cards/:cardId', async({ request }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to delete card' }, { status: 500 });
        }

        const url = new URL(request.url);
        const listId = url.searchParams.get('listId');
        const { cardId } = await request.json();

        if (mockBoard.cards[listId]) {
            mockBoard.cards[listId] = mockBoard.cards[listId].filter(
                (c) => c.id !== cardId
            );
            return HttpResponse.json({ success: true });
        }

        return HttpResponse.json({ error: 'Card not found' }, { status: 404 });
    }),

    // Move card
    http.post('/api/cards/move', async({ request }) => {
        await delay(CONFIG.NETWORK_DELAY);

        if (shouldFail()) {
            return HttpResponse.json({ error: 'Failed to move card' }, { status: 500 });
        }

        const body = await request.json();
        const { sourceListId, destinationListId, cardId, destinationIndex } = body;

        // Find and remove card from source
        const sourceCards = mockBoard.cards[sourceListId];
        const cardIndex = sourceCards ? .findIndex((c) => c.id === cardId);

        if (cardIndex !== -1) {
            const [card] = sourceCards.splice(cardIndex, 1);

            // Add to destination
            if (!mockBoard.cards[destinationListId]) {
                mockBoard.cards[destinationListId] = [];
            }
            mockBoard.cards[destinationListId].splice(destinationIndex, 0, card);

            return HttpResponse.json({ success: true });
        }

        return HttpResponse.json({ error: 'Card not found' }, { status: 404 });
    }),
];

// Export for testing configuration
export const setMockConfig = (config) => {
    Object.assign(CONFIG, config);
};