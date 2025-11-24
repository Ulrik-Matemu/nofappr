import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MESSAGES = [
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "You are stronger than your urges.",
  "This too shall pass.",
  "Focus on your long-term goals, not short-term pleasure.",
  "Every moment of resistance makes you stronger."
];

const UrgeKiller: React.FC = () => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Pick a random message on mount
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(randomMsg);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startBreathing = () => {
    setTimeLeft(30);
    setTimerActive(true);
  };

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto mt-[-24px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 border border-zinc-100 dark:border-zinc-800"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 text-center">Urge Killer</h2>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl mb-8 w-full border border-orange-100 dark:border-orange-900/20"
          >
            <p className="text-orange-800 dark:text-orange-200 font-medium italic text-center leading-relaxed">
              "{message}"
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="relative w-48 h-48 flex items-center justify-center mb-8 mx-auto">
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full border-8 border-zinc-100 dark:border-zinc-800" />
          
          {/* Breathing Animation Circle */}
          {timerActive && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ 
                duration: 8, 
                ease: "easeInOut", 
                repeat: Infinity,
                times: [0, 0.5, 1] 
              }}
              className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-full -z-10"
            />
          )}

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-blue-500 dark:text-blue-400 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 * (1 - timeLeft / 30)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>

          <div className="flex flex-col items-center">
            <motion.span 
              key={timeLeft}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-zinc-800 dark:text-white tabular-nums"
            >
              {timeLeft}
            </motion.span>
            <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Seconds</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startBreathing}
          disabled={timerActive}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg ${
            timerActive 
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600 shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/30'
          }`}
        >
          {timerActive ? 'Breathe In... Breathe Out...' : 'Start Breathing'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UrgeKiller;
