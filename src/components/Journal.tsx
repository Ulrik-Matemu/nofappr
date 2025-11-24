import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTodayJournal, saveJournalEntry } from '../utils/storage';
import JournalHistory from './JournalHistory';

const Journal: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setEntry(getTodayJournal());
  }, []);

  const handleSave = () => {
    saveJournalEntry(entry);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (showHistory) {
    return <JournalHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto mt-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 border border-zinc-100 dark:border-zinc-800"
      >
        <div className="flex justify-between items-center w-full mb-6">
          <div className="w-8" /> {/* Spacer */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Daily Journal</h2>
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
        
        <div className="relative group">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-64 p-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          <div className="absolute bottom-4 right-4 text-xs text-zinc-400 pointer-events-none">
            {entry.length} chars
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
           <AnimatePresence>
            {isSaved ? (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-green-500 font-semibold"
              >
                <span className="text-sm">✓</span> Saved
              </motion.span>
            ) : <div />}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold shadow-lg shadow-zinc-500/20 transition-shadow hover:shadow-zinc-500/30 ml-auto"
          >
            Save Entry
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Journal;
