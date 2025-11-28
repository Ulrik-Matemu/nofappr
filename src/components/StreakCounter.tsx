import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getStreak, resetStreak, checkAchievements, getStartDate } from '../utils/storage';

const StreakCounter: React.FC = () => {
  const [streak, setStreak] = useState<number>(0);
  const [showUnlock, setShowUnlock] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<string>('00:00:00');

  useEffect(() => {
    const current = getStreak();
    setStreak(current);
    if (checkAchievements(current)) {
      setShowUnlock(true);
      setTimeout(() => setShowUnlock(false), 3000);
    }
    
    // Timer logic
    const startDateStr = getStartDate();
    const startTime = startDateStr ? new Date(startDateStr).getTime() : new Date().getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - startTime;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your streak?')) {
      resetStreak();
      setStreak(0);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-20 z-50 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            <span>🏆</span> New Achievement Unlocked!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center justify-center w-64 h-64 rounded-full bg-white dark:bg-zinc-800 shadow-2xl shadow-[#00ff9d]/10 border-4 border-[#00ff9d]/30 dark:border-[#00ff9d]/20 md:mt-40"
      >
        <div className="absolute inset-0 rounded-full border-4 border-[#00ff9d]/20 dark:border-[#00ff9d]/10" />
        
        <motion.h2 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-2"
        >
          Current Streak
        </motion.h2>
        
        <div className="flex flex-col items-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="text-7xl font-bold text-[#00ff9d] dark:text-[#00ff9d] tabular-nums tracking-tight"
          >
            {streak}
          </motion.span>
          <span className="text-lg text-[#00ff9d] font-medium mt-1">
            {streak === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 shadow-sm"
      >
        <span className="text-sm font-mono font-medium text-zinc-500 dark:text-zinc-400 tracking-widest tabular-nums">
          {timeElapsed}
        </span>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed"
      >
        "Success is the sum of small efforts, repeated day in and day out."
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        className="mt-8 px-6 py-2 text-xs font-medium text-red-500/80 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-300 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
      >
        Reset Streak
      </motion.button>
    </div>
  );
};

export default StreakCounter;
