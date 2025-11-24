import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getJournalHistory, type JournalEntry } from '../utils/storage';

interface JournalHistoryProps {
  onBack: () => void;
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const data = getJournalHistory();
    // Sort by date descending
    setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

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
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white ml-2">Journal History</h2>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 dark:text-zinc-500">
            <p>No journal entries yet.</p>
          </div>
        ) : (
          history.map((entry, idx) => (
            <motion.div
              key={entry.date}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setExpandedId(expandedId === entry.date ? null : entry.date)}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors overflow-hidden"
            >
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <span className="text-xs text-zinc-400">
                  {new Date(entry.date).getFullYear()}
                </span>
              </div>
              
              <motion.div layout>
                <p className={`text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed ${
                  expandedId === entry.date ? '' : 'line-clamp-2'
                }`}>
                  {entry.text}
                </p>
              </motion.div>
              
              <AnimatePresence>
                {expandedId === entry.date && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end"
                  >
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Read Less</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default JournalHistory;
