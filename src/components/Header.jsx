import { useBoardState } from '../hooks/useBoardState';

function Header() {
  const { state } = useBoardState();

  return (
    <header className="header bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{state.boardTitle}</h1>
        <div className="text-sm">
          {state.lists.filter((l) => !l.archived).length} lists
        </div>
      </div>
    </header>
  );
}

export default Header;
