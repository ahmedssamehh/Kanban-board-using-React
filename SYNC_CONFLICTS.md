# Syncing and Conflict Resolution

This document explains the advanced syncing features with version tracking, three-way merge, and conflict resolution.

## Features

### 1. Version Tracking
- **Every list and card has:**
  - `version`: Incremented on each update
  - `lastModifiedAt`: Timestamp of last modification
  - Used for detecting conflicts

### 2. Three-Way Merge
When syncing, the system compares:
- **Base version**: Last known server state
- **Local version**: Your current changes
- **Server version**: Latest server state

**Merge logic:**
- If both local and server changed the same field differently → **Conflict**
- If only local changed → Use local value
- If only server changed → Use server value
- If neither changed → Keep value

### 3. Background Sync

Two mechanisms automatically sync changes:

#### A. Online/Offline Detection
```javascript
// Detects when you reconnect
window.addEventListener('online', () => {
  // Immediately syncs all pending changes
});
```

#### B. Periodic Sync Timer
- Runs every **45 seconds**
- Automatically syncs when online
- Fetches latest server data
- Resolves conflicts automatically when possible

### 4. Offline Queue
- Changes made while offline are queued in localStorage
- When you reconnect:
  - Queue is processed automatically
  - Failed operations stay in queue for retry
  - UI shows pending count

### 5. Conflict Resolution UI

When conflicts cannot be auto-merged:
- **Modal appears** showing all conflicts
- For each conflict, you see:
  - Your version (blue)
  - Server version (green)
  - What fields differ

**Resolution options:**
- Choose **Your Version** or **Server Version** for each conflict
- Or **Keep All Server Changes** to accept everything from server
- Click **Apply Selected** to apply your choices

## Testing Conflicts

### Simulate a Version Conflict:

1. **Open two browser tabs** with the same board
2. **In Tab 1**: Edit a card's title to "Version A"
3. **In Tab 2**: Edit the same card's title to "Version B"
4. **Wait for both to sync**
5. The second one to sync will detect a conflict and show the resolution UI

### Test Offline Mode:

```javascript
// In browser console, simulate offline
window.dispatchEvent(new Event('offline'));

// Make changes (they'll be queued)
// Then go back online
window.dispatchEvent(new Event('online'));
// Changes sync automatically
```

### Test with DevTools:
1. Open **DevTools** → **Network** tab
2. Select **Offline** from throttling dropdown
3. Make changes (orange "Offline" badge appears)
4. Changes are queued in localStorage
5. Select **Online** → automatic sync

## Sync Indicators

- **Blue spinning icon**: Currently syncing
- **Orange "Offline"**: No network connection + pending count
- **Yellow clock**: Changes pending sync
- **No indicator**: Everything synced

## Technical Details

### Version Conflict (HTTP 409)
When server detects `clientVersion < serverVersion`:
```json
{
  "error": "Version conflict",
  "conflict": true,
  "serverVersion": { /* server's data */ },
  "status": 409
}
```

### Sync Flow
1. User makes change → Optimistic UI update
2. If offline → Queue operation
3. If online → Send to server
4. If 409 conflict → Trigger three-way merge
5. If merge fails → Show conflict UI
6. User resolves → Apply merged state

### Periodic Sync
```javascript
setInterval(() => {
  if (navigator.onLine) {
    // 1. Fetch server state
    // 2. Compare with local
    // 3. Merge changes
    // 4. Process queue
  }
}, 45000); // Every 45 seconds
```

## Storage

- **localStorage**: Board data + sync queue
- **Sync queue format**:
  ```javascript
  {
    id: "timestamp-random",
    timestamp: Date.now(),
    action: { type, payload },
    apiCall: async () => {}
  }
  ```

## Conflict Resolution Example

**Scenario**: Two users edit the same card

**Base (server):**
```javascript
{ title: "Original", description: "Text", version: 1 }
```

**User A (local):**
```javascript
{ title: "User A Change", description: "Text", version: 2 }
```

**User B (server):**
```javascript
{ title: "Original", description: "Modified by B", version: 2 }
```

**Result:**
- Title: Conflict (both changed)
- Description: Use server (only B changed)
- Modal shows conflict for user to resolve title
