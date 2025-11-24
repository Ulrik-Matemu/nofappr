import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getAchievements, type Achievement } from '../utils/storage';

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(getAchievements());
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 px-1">Achievements</h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-4 rounded-2xl border transition-all ${
              badge.unlockedAt 
                ? 'bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-sm' 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 opacity-60 grayscale'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2 filter drop-shadow-sm">{badge.icon}</span>
              <h4 className={`text-sm font-bold mb-1 ${
                badge.unlockedAt ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500'
              }`}>
                {badge.title}
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight max-w-[120px]">
                {badge.description}
              </p>
              {badge.unlockedAt && (
                <span className="mt-2 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  Unlocked
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
