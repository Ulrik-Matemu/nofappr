import { useState } from 'react';
import StreakCounter from './components/StreakCounter';
import CheckIn from './components/CheckIn';
import UrgeKiller from './components/UrgeKiller';
import Journal from './components/Journal';

type Tab = 'streak' | 'checkin' | 'urge' | 'journal';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('streak');

  const renderContent = () => {
    switch (activeTab) {
      case 'streak':
        return <StreakCounter />;
      case 'checkin':
        return <CheckIn />;
      case 'urge':
        return <UrgeKiller />;
      case 'journal':
        return <Journal />;
      default:
        return <StreakCounter />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <header className="p-4 text-center bg-white dark:bg-zinc-800 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">NoFap Tracker</h1>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 max-w-md">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('streak')}
            className={`flex flex-col items-center p-3 w-full transition-colors ${
              activeTab === 'streak' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <span className="text-xl mb-1">🔥</span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Streak</span>
          </button>
          
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex flex-col items-center p-3 w-full transition-colors ${
              activeTab === 'checkin' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <span className="text-xl mb-1">✅</span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('urge')}
            className={`flex flex-col items-center p-3 w-full transition-colors ${
              activeTab === 'urge' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <span className="text-xl mb-1">🛡️</span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Urge</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center p-3 w-full transition-colors ${
              activeTab === 'journal' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <span className="text-xl mb-1">📝</span>
            <span className="text-[10px] font-medium uppercase tracking-wide">Journal</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
