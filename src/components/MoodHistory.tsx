import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getCheckInHistory, type CheckIn } from '../utils/storage';

interface MoodHistoryProps {
  onBack: () => void;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<CheckIn[]>([]);

  useEffect(() => {
    const data = getCheckInHistory();
    // Sort by date descending
    setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const getMoodIcon = (mood: CheckIn['mood']) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😔';
    }
  };

  const getMoodColor = (mood: CheckIn['mood']) => {
    switch (mood) {
      case 'happy': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'neutral': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'sad': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white ml-2">Mood History</h2>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 dark:text-zinc-500">
            <p>No mood entries yet.</p>
          </div>
        ) : (
          history.map((entry, idx) => (
            <motion.div
              key={entry.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(entry.date).getFullYear()}
                </span>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getMoodColor(entry.mood)}`}>
                <span className="text-lg">{getMoodIcon(entry.mood)}</span>
                <span className="text-xs font-semibold capitalize">{entry.mood}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoodHistory;
