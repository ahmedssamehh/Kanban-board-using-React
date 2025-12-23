import BoardProvider from './context/BoardProvider';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Board from './components/Board';
import ErrorToast from './components/ErrorToast';
import SyncIndicator from './components/SyncIndicator';
import ConflictResolutionModal from './components/ConflictResolutionModal';

function App() {
  return (
    <BoardProvider>
      <div className="app flex flex-col h-screen bg-gray-50">
        <Header />
        <Toolbar />
        <main className="flex-1 overflow-hidden">
          <Board />
        </main>
        <SyncIndicator />
        <ErrorToast />
        <ConflictResolutionModal />
      </div>
    </BoardProvider>
  );
}

export default App;
