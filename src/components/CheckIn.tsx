import React, { useEffect, useState } from 'react';
import { getTodayMood, saveCheckIn, type CheckIn as CheckInType } from '../utils/storage';

const CheckIn: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<CheckInType['mood'] | null>(null);

  useEffect(() => {
    const savedMood = getTodayMood();
    if (savedMood) {
      setSelectedMood(savedMood);
    }
  }, []);

  const handleSelectMood = (mood: CheckInType['mood']) => {
    setSelectedMood(mood);
    saveCheckIn(mood);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg w-full max-w-sm mx-auto mt-6">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Daily Check-In</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">How are you feeling today?</p>
      
      <div className="flex gap-4">
        <button
          onClick={() => handleSelectMood('happy')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all ${
            selectedMood === 'happy' 
              ? 'bg-green-100 ring-2 ring-green-500 dark:bg-green-900/30' 
              : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600'
          }`}
        >
          <span className="text-3xl mb-2">😊</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Happy</span>
        </button>

        <button
          onClick={() => handleSelectMood('neutral')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all ${
            selectedMood === 'neutral' 
              ? 'bg-yellow-100 ring-2 ring-yellow-500 dark:bg-yellow-900/30' 
              : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600'
          }`}
        >
          <span className="text-3xl mb-2">😐</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Neutral</span>
        </button>

        <button
          onClick={() => handleSelectMood('sad')}
          className={`flex flex-col items-center p-4 rounded-xl transition-all ${
            selectedMood === 'sad' 
              ? 'bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900/30' 
              : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-700 dark:hover:bg-zinc-600'
          }`}
        >
          <span className="text-3xl mb-2">😔</span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Sad</span>
        </button>
      </div>
    </div>
  );
};

export default CheckIn;
