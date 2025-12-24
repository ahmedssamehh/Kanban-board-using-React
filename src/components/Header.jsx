import { useBoardState } from '../hooks/useBoardState';

function Header() {
  const { state } = useBoardState();

  return (
    <header className="header bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">📋 {state.boardTitle}</h1>
        <div className="flex items-center gap-2 bg-blue-500/30 px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="text-sm font-medium">
            {state.lists.filter((l) => !l.archived).length} lists
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
