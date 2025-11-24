import React, { useEffect, useState } from 'react';
import { getTodayJournal, saveJournalEntry } from '../utils/storage';

const Journal: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setEntry(getTodayJournal());
  }, []);

  const handleSave = () => {
    saveJournalEntry(entry);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg w-full max-w-sm mx-auto mt-6">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">Daily Journal</h2>
        {isSaved && <span className="text-xs text-green-500 font-medium animate-fade-in">Saved!</span>}
      </div>
      
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full h-40 p-4 mb-4 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-600 dark:placeholder-zinc-400"
      />

      <button
        onClick={handleSave}
        className="w-full py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors dark:bg-zinc-600 dark:hover:bg-zinc-500"
      >
        Save Entry
      </button>
    </div>
  );
};

export default Journal;
