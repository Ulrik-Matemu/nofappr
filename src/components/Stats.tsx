import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getStreak, getLongestStreak, getRelapseHistory } from '../utils/storage';
import Achievements from './Achievements';

const Stats: React.FC = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [relapses, setRelapses] = useState(0);

  useEffect(() => {
    setCurrentStreak(getStreak());
    setLongestStreak(getLongestStreak());
    setRelapses(getRelapseHistory().length);
  }, []);

  // Mock data for chart visualization (since we might not have enough history yet)
  // In a real app, calculate this from `getRelapseHistory` + `getStreak`.
  const weeklyData = [4, 5, 7, 2, 6, 8, currentStreak]; 
  const maxVal = Math.max(...weeklyData, 10);

  return (
    <div className="w-full max-w-md mx-auto space-y-8 pb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Longest Streak</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{longestStreak} <span className="text-sm font-normal text-zinc-500">days</span></p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Total Relapses</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{relapses}</p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">This Week's Progress</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyData.map((val, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group">
              <div className="relative w-full flex items-end justify-center h-full">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / maxVal) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                  className={`w-full max-w-[24px] rounded-t-lg ${
                    i === weeklyData.length - 1 
                      ? 'bg-blue-500 dark:bg-blue-500' 
                      : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40'
                  } transition-colors`}
                />
              </div>
              <span className="text-[10px] font-medium text-zinc-400 mt-2 uppercase">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements Section */}
      <Achievements />
    </div>
  );
};

export default Stats;
