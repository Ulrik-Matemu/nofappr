import React, { useEffect, useState } from 'react';
import { getStreak, resetStreak } from '../utils/storage';

const StreakCounter: React.FC = () => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    setStreak(getStreak());
  }, []);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your streak?')) {
      resetStreak();
      setStreak(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current Streak</h2>
      <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 my-4">
        {streak} <span className="text-2xl text-zinc-500 dark:text-zinc-400">days</span>
      </div>
      <button
        onClick={handleReset}
        className="mt-4 px-6 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
      >
        Reset Streak
      </button>
    </div>
  );
};

export default StreakCounter;
