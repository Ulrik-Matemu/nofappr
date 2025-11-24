import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTodayMood, saveCheckIn, type CheckIn as CheckInType } from '../utils/storage';
import MoodHistory from './MoodHistory';

const CheckIn: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<CheckInType['mood'] | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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

  const moods = [
    { id: 'happy', icon: '😊', label: 'Happy', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
    { id: 'neutral', icon: '😐', label: 'Neutral', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' },
    { id: 'sad', icon: '😔', label: 'Sad', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  ] as const;

  if (showHistory) {
    return <MoodHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 border border-zinc-100 dark:border-zinc-800"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="w-8" /> {/* Spacer for centering */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center">Daily Check-In</h2>
          <button 
            onClick={() => setShowHistory(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400"
            title="View History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center">How are you feeling today?</p>
        
        <div className="grid grid-cols-3 gap-4">
          {moods.map((mood, i) => (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectMood(mood.id)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                selectedMood === mood.id 
                  ? `${mood.color} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-current` 
                  : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/50'
              }`}
            >
              <span className="text-4xl mb-3 filter drop-shadow-sm">{mood.icon}</span>
              <span className={`text-xs font-semibold ${
                selectedMood === mood.id ? 'text-current' : 'text-zinc-500 dark:text-zinc-400'
              }`}>
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-zinc-400">
                Mood recorded for today.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CheckIn;
