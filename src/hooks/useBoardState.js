import { useContext } from 'react';
import { BoardContext } from '../context/BoardProvider';

// Custom hook for board state management
export function useBoardState() {
    const context = useContext(BoardContext);

    if (!context) {
        throw new Error('useBoardState must be used within a BoardProvider');
    }

    return context;
}