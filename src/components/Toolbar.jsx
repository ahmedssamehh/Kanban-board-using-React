import { useBoardState } from '../hooks/useBoardState';

function Toolbar() {
  const { dispatch, ACTIONS } = useBoardState();

  const handleClearBoard = () => {
    if (window.confirm('Clear all board data? This cannot be undone.')) {
      dispatch({ type: ACTIONS.CLEAR_BOARD });
    }
  };

  return (
    <div className="toolbar bg-gray-100 border-b border-gray-300">
      <div className="container mx-auto px-4 py-2 flex gap-2">
        <button
          onClick={handleClearBoard}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Clear Board
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
