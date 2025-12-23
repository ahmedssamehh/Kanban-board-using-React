// API service for backend communication
const API_BASE = '/api';

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function fetchWithError(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(data.error || 'Request failed', response.status);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Network request failed', 0);
    }
}

export const api = {
    // Get board state
    async getBoard() {
        return fetchWithError(`${API_BASE}/board`);
    },

    // Save entire board state
    async saveBoard(boardData) {
        return fetchWithError(`${API_BASE}/board`, {
            method: 'POST',
            body: JSON.stringify(boardData),
        });
    },

    // Add new list
    async addList(list) {
        return fetchWithError(`${API_BASE}/lists`, {
            method: 'POST',
            body: JSON.stringify({ list }),
        });
    },

    // Update list
    async updateList(listId, updates) {
        return fetchWithError(`${API_BASE}/lists/${listId}`, {
            method: 'PUT',
            body: JSON.stringify({ updates }),
        });
    },

    // Delete list
    async deleteList(listId) {
        return fetchWithError(`${API_BASE}/lists/${listId}`, {
            method: 'DELETE',
        });
    },

    // Add new card
    async addCard(listId, card) {
        return fetchWithError(`${API_BASE}/cards`, {
            method: 'POST',
            body: JSON.stringify({ listId, card }),
        });
    },

    // Update card
    async updateCard(listId, cardId, updates) {
        return fetchWithError(`${API_BASE}/cards/${cardId}`, {
            method: 'PUT',
            body: JSON.stringify({ listId, updates }),
        });
    },

    // Delete card
    async deleteCard(listId, cardId) {
        return fetchWithError(`${API_BASE}/cards/${cardId}?listId=${listId}`, {
            method: 'DELETE',
            body: JSON.stringify({ cardId }),
        });
    },

    // Move card between lists
    async moveCard(sourceListId, destinationListId, cardId, destinationIndex) {
        return fetchWithError(`${API_BASE}/cards/move`, {
            method: 'POST',
            body: JSON.stringify({
                sourceListId,
                destinationListId,
                cardId,
                destinationIndex,
            }),
        });
    },
};

export { ApiError };