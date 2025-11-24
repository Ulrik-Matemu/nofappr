import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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

  const moods = [
    { id: 'happy', icon: '😊', label: 'Happy', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
    { id: 'neutral', icon: '😐', label: 'Neutral', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' },
    { id: 'sad', icon: '😔', label: 'Sad', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  ] as const;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 border border-zinc-100 dark:border-zinc-800"
      >
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">Daily Check-In</h2>
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
      </motion.div>
    </div>
  );
};

export default CheckIn;
