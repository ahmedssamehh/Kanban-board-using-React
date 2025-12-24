# Kanban Board using React

A fully-featured, collaborative Kanban board single-page application built with React, featuring offline support, optimistic updates, conflict resolution, and performance optimizations for handling 500+ cards.

## 🚀 Features

- ✅ Drag & drop cards between lists and within lists
- ✅ Add, edit, delete, and archive lists and cards
- ✅ Offline mode with automatic sync on reconnect
- ✅ Optimistic UI updates with rollback on failure
- ✅ Three-way merge conflict resolution
- ✅ Virtualized rendering for lists with >30 cards
- ✅ Undo/redo functionality
- ✅ Full keyboard accessibility (WCAG AA compliant)
- ✅ Tags support for cards
- ✅ Mock Service Worker (MSW) for API simulation

## 📋 Project Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmedssamehh/Kanban-board-using-React.git
cd Kanban-board-using-React

# Install dependencies
npm install

# Initialize MSW service worker (if not already done)
npx msw init public/ --save
```

### Development

```bash
# Run development server
npm run dev

# The application will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### Run All Tests

```bash
# Run all unit and integration tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm test:watch
```

### Run E2E Tests

```bash
# Run Playwright end-to-end tests
npm run e2e

# Run E2E tests with UI mode
npm run e2e:ui
```

### Test Coverage

The project maintains >80% test coverage across:
- **Unit Tests**: Custom hooks (useBoardState, useOfflineSync, useUndoRedo)
- **Integration Tests**: Reducer logic, component interactions
- **E2E Tests**: Complete user workflows including offline scenarios

Expected test results:
- ✅ 41+ unit/integration tests
- ✅ 1 comprehensive E2E test covering create, move, offline, and sync

## 🏗️ Architecture Summary

This Kanban board application follows a modern React architecture centered around predictable state management and performance optimization. The application uses **useReducer with Context API** for global state management, ensuring all data flows through a single, immutable state tree managed by a pure reducer function in `boardReducer.js`. This architecture eliminates prop drilling and provides a centralized location for all business logic.

**State persistence and offline functionality** are handled through a multi-layered approach: localStorage provides immediate persistence, while a custom `useOfflineSync` hook manages a sync queue for offline operations. When online, changes are optimistically applied to the UI and then synchronized with a Mock Service Worker (MSW) backend. On failure, the reducer's `ROLLBACK` action reverts to the previous state, providing a seamless user experience.

**Performance optimization** is achieved through multiple strategies. React.memo wraps Card and ListColumn components to prevent unnecessary re-renders, while useCallback and useMemo hooks memoize expensive operations. For lists exceeding 30 cards, react-window's `FixedSizeList` provides virtualization, rendering only visible items and dramatically improving scroll performance with large datasets.

**Conflict resolution** implements a three-way merge algorithm comparing base, local, and server versions. When conflicts are detected (HTTP 409), a dedicated ConflictResolutionModal presents users with side-by-side comparisons, allowing manual resolution. The `merge.js` utility handles automatic merging of non-conflicting changes.

**Accessibility** is built-in from the ground up: all interactive elements have ARIA labels, modals trap focus and close with ESC, keyboard navigation works throughout (Tab, Enter, Space), and all color combinations meet WCAG AA contrast requirements. The drag-and-drop system uses HTML5 native APIs with visual drop zone indicators for intuitive operation.

This architecture balances developer experience with user experience, providing a maintainable codebase that handles complex real-world scenarios like offline editing, concurrent modifications, and performance at scale.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Board.jsx       # Main board container
│   ├── ListColumn.jsx  # List column with virtualization
│   ├── Card.jsx        # Card component with drag & drop
│   ├── CardDetailModal.jsx  # Card editing modal
│   ├── ConflictResolutionModal.jsx  # Merge conflict UI
│   ├── Header.jsx      # Application header
│   ├── Toolbar.jsx     # Toolbar with undo/redo
│   └── ConfirmDialog.jsx  # Confirmation dialogs
├── context/            # State management
│   ├── BoardProvider.jsx   # Context provider
│   └── boardReducer.js     # Reducer with 20+ actions
├── hooks/              # Custom React hooks
│   ├── useBoardState.js    # State access wrapper
│   ├── useOfflineSync.js   # Offline sync logic
│   └── useUndoRedo.js      # Undo/redo history
├── services/           # External services
│   ├── api.js         # API client
│   ├── storage.js     # localStorage wrapper
│   └── syncQueue.js   # Offline queue management
├── utils/              # Utility functions
│   ├── validators.js  # Input validation
│   ├── helpers.js     # Helper functions
│   └── merge.js       # Three-way merge logic
├── mocks/              # MSW mock server
│   ├── browser.js     # MSW worker setup
│   └── handlers.js    # API request handlers
├── styles/             # CSS files
│   ├── global.css     # Global styles + Tailwind
│   └── components.css # Component-specific styles
├── App.jsx            # Root component
└── main.jsx           # Application entry point
```

## 🛠️ Technology Stack

- **Frontend**: React 18.3 with JSX
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **State Management**: useReducer + Context API
- **Testing**: Jest + React Testing Library + Playwright
- **Mock Server**: Mock Service Worker (MSW)
- **Performance**: react-window for virtualization
- **Code Quality**: ESLint (strict) + Prettier
- **Accessibility**: WCAG AA compliant

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **CUSTOM_HOOKS.md**: Detailed documentation of all three custom hooks
- **PERFORMANCE_OPTIMIZATION.md**: Performance strategies and profiling
- **CODE_SPLITTING.md**: Lazy loading and bundle optimization
- **OPTIMISTIC_UPDATES.md**: How optimistic updates work
- **SYNC_CONFLICTS.md**: Conflict resolution approach
- **TEST_COVERAGE.md**: Testing strategy and coverage

## 🔧 Scripts Reference

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm test                 # Run Jest tests
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
npm run e2e              # Run Playwright E2E tests
npm run e2e:ui           # Run E2E tests with UI
```

## 🎯 Performance Targets

- **Initial Load**: < 2 seconds
- **Interaction Response**: < 100ms
- **500+ Cards**: Smooth 60 FPS scrolling
- **Test Coverage**: > 80% lines
- **Bundle Size**: < 200KB gzipped
- **Accessibility Score**: 100% (Lighthouse)

## 🤝 Contributing

This project follows strict coding standards:
- Zero ESLint errors required
- All tests must pass
- Meaningful atomic commits
- WCAG AA accessibility compliance

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Ahmed Sameh - [@ahmedssamehh](https://github.com/ahmedssamehh)
