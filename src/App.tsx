import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StreakCounter from './components/StreakCounter';
import CheckIn from './components/CheckIn';
import UrgeKiller from './components/UrgeKiller';
import Journal from './components/Journal';
import Stats from './components/Stats';
import Onboarding from './components/Onboarding';
import { getOnboardingStatus } from './utils/storage';
import { Flame, ChartNoAxesColumn, CircleCheckBig, ShieldHalf, NotebookPen } from 'lucide-react';

type Tab = 'streak' | 'checkin' | 'urge' | 'journal' | 'stats';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('streak');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const onboarded = getOnboardingStatus();
    setIsOnboarded(onboarded);
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'streak':
        return <StreakCounter />;
      case 'stats':
        return <Stats />;
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
    <div className="min-h-screen bg-gray-300 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-10 bg-transparent backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-center max-w-md">
          <h1 className="text-sm font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 header-title">
            Streakly
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-32 max-w-md overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 z-20">
        <div className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/40 border border-white/20 dark:border-zinc-800 max-w-md mx-auto">
          <div className="flex justify-around items-center p-2">
            {[
              { id: 'streak', icon: <Flame className="w-5 h-5" />, label: 'Streak' },
              { id: 'stats', icon: <ChartNoAxesColumn className='w-5 h-5' />, label: 'Stats' },
              { id: 'checkin', icon: <CircleCheckBig className='w-5 h-6' />, label: 'Check-In' },
              { id: 'urge', icon: <ShieldHalf className='w-5 h-5' />, label: 'Urge' },
              { id: 'journal', icon: <NotebookPen className='w-5 h-5' />, label: 'Journal' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="relative flex flex-col items-center justify-center w-full py-3 px-1 rounded-xl group"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span
                  className={`relative text-2xl mb-0.5 transform transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === tab.id ? 'text-[#00ff9d]' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                <span className={`relative text-[10px] font-medium transition-colors duration-200 ${
                  activeTab === tab.id 
                    ? 'text-zinc-900 dark:text-white' 
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
