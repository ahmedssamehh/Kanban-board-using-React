# Optimistic Updates with Mock Service Worker

This project implements optimistic UI updates with Mock Service Worker (MSW) for testing.

## Features

- **Optimistic UI Updates**: UI updates immediately while syncing with the server in the background
- **Error Handling**: Automatically rolls back changes if the server request fails
- **Visual Feedback**: 
  - Syncing indicator (top-right) shows when updates are being sent to the server
  - Error toast (bottom-right) displays sync failures
- **Offline Support**: Changes are stored in localStorage and can be made while offline
- **Configurable Failures**: Test error handling by enabling simulated failures

## Testing Error Handling

To test error handling and rollback:

1. Open browser console and enter:
```javascript
// Enable 10% failure rate
sessionStorage.setItem('MSW_ENABLE_FAILURES', 'true');
location.reload();
```

2. Make changes (add lists, cards, move cards, etc.)
3. Some operations will fail randomly (10% chance)
4. Failed operations will:
   - Roll back the UI to the previous state
   - Show an error toast with the failure message
   - Keep data in localStorage for offline persistence

5. To disable failures:
```javascript
sessionStorage.removeItem('MSW_ENABLE_FAILURES');
location.reload();
```

## How It Works

1. **Optimistic Update Flow**:
   - User performs an action (add list, edit card, etc.)
   - UI updates immediately (optimistic)
   - Previous state is saved for potential rollback
   - API call is made in the background
   - On success: Changes are committed
   - On failure: UI rolls back and shows error

2. **Mock Server Configuration**:
   - Network delay: 500ms (simulates real network latency)
   - Failure rate: 10% when enabled
   - All endpoints support full CRUD operations

3. **State Management**:
   - Uses React's useReducer + Context
   - Tracks sync state (syncing, error, previousState)
   - localStorage auto-saves on every change

## API Endpoints (Mocked)

- `GET /api/board` - Get entire board state
- `POST /api/board` - Save entire board state
- `POST /api/lists` - Add new list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/cards` - Add new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/move` - Move card between lists
