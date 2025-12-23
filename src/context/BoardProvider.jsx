import { createContext } from 'react';

export const BoardContext = createContext(null);

function BoardProvider({ children }) {
  return (
    <BoardContext.Provider value={{}}>
      {children}
    </BoardContext.Provider>
  );
}

export default BoardProvider;
