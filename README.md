# Kanban Board using React

A university-graded Kanban Board application built with React, Vite, and Tailwind CSS.

## Project Structure

```
src/
├── components/
│   ├── Board.jsx
│   ├── ListColumn.jsx
│   ├── Card.jsx
│   ├── CardDetailModal.jsx
│   ├── Header.jsx
│   ├── Toolbar.jsx
│   └── ConfirmDialog.jsx
├── context/
│   ├── BoardProvider.jsx
│   └── boardReducer.js
├── hooks/
│   ├── useBoardState.js
│   ├── useOfflineSync.js
│   └── useUndoRedo.js
├── services/
│   ├── api.js
│   └── storage.js
├── utils/
│   ├── validators.js
│   └── helpers.js
├── styles/
│   ├── global.css
│   └── components.css
├── App.jsx
└── main.jsx
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
