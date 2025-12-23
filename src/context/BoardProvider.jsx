import { createContext, useReducer, useEffect } from 'react';
import { boardReducer, initialState, ACTIONS } from './boardReducer';
import { saveBoard, loadBoard } from '../services/storage';

export const BoardContext = createContext(null);

function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState, () => {
    const savedBoard = loadBoard();
    return savedBoard || initialState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveBoard(state);
  }, [state]);

  return (
    <BoardContext.Provider value={{ state, dispatch, ACTIONS }}>
      {children}
    </BoardContext.Provider>
  );
}

export default BoardProvider;
