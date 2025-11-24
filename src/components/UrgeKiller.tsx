import React, { useState, useEffect } from 'react';

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
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg w-full max-w-sm mx-auto mt-6 text-center">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-white mb-4">Urge Killer</h2>
      
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-6 w-full">
        <p className="text-orange-800 dark:text-orange-200 font-medium italic">"{message}"</p>
      </div>

      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        <div className={`absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-700 ${timerActive ? 'animate-pulse' : ''}`}></div>
        {timerActive && (
           <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
             <circle
               className="text-blue-500 transition-all duration-1000 ease-linear"
               strokeWidth="4"
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
        )}
        <span className="text-3xl font-bold text-zinc-800 dark:text-white">
          {timeLeft}s
        </span>
      </div>

      <button
        onClick={startBreathing}
        disabled={timerActive}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          timerActive 
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-500'
            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
        }`}
      >
        {timerActive ? 'Breathe...' : 'Start Breathing Exercise'}
      </button>
    </div>
  );
};

export default UrgeKiller;
