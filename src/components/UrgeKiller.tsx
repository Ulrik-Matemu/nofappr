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
  const [timeLeft, setTimeLeft] = useState(60); // Increased to 60s for a better session
  const [message, setMessage] = useState('');
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out' | 'ready'>('ready');

  useEffect(() => {
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
      setBreathPhase('ready');
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Breathing Cycle Logic
  useEffect(() => {
    if (!timerActive) return;

    const breatheCycle = async () => {
      while (timerActive && timeLeft > 0) {
        setBreathPhase('in');
        await new Promise(r => setTimeout(r, 4000)); // 4s in
        if (!timerActive) break;
        
        setBreathPhase('hold');
        await new Promise(r => setTimeout(r, 4000)); // 4s hold
        if (!timerActive) break;
        
        setBreathPhase('out');
        await new Promise(r => setTimeout(r, 4000)); // 4s out
        if (!timerActive) break;
      }
    };

    breatheCycle();
  }, [timerActive]); // simplified dependency to avoid restart loop

  const startBreathing = () => {
    setTimeLeft(60);
    setTimerActive(true);
  };

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'in': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'out': return 'Breathe Out';
      default: return 'Ready?';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto mt-[-24px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#ecffe9] dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden"
      >
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-8 text-center relative z-10">Urge Killer</h2>
        
        <div className="relative w-64 h-64 flex items-center justify-center mb-10 mx-auto">
          {/* Expanding/Breathing Circles */}
          <AnimatePresence>
            {timerActive && (
              <>
                <motion.div
                  animate={{ 
                    scale: breathPhase === 'in' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1,
                    opacity: breathPhase === 'in' ? 0.3 : breathPhase === 'hold' ? 0.4 : 0.2,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute inset-0 bg-emerald-400 rounded-full blur-xl"
                />
                <motion.div
                  animate={{ 
                    scale: breathPhase === 'in' ? 1.2 : breathPhase === 'hold' ? 1.2 : 0.8,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute inset-4 border-2 border-[#00ff9d]/30 rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          {/* Main Circle Container */}
          <div className="relative z-10 flex flex-col items-center justify-center w-40 h-40 bg-[#ecffe9] dark:bg-zinc-900 rounded-full shadow-2xl shadow-emerald-500/10 border-4 border-zinc-50 dark:border-zinc-800">
             {/* Inner Progress Ring */}
            {timerActive && (
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                 <circle
                   className="text-zinc-100 dark:text-zinc-800"
                   strokeWidth="4"
                   stroke="currentColor"
                   fill="transparent"
                   r="46"
                   cx="50"
                   cy="50"
                 />
                 <circle
                   className="text-[#00ff9d] transition-all duration-1000 ease-linear"
                   strokeWidth="4"
                   strokeDasharray={289}
                   strokeDashoffset={289 * (1 - timeLeft / 60)}
                   strokeLinecap="round"
                   stroke="currentColor"
                   fill="transparent"
                   r="46"
                   cx="50"
                   cy="50"
                 />
               </svg>
            )}

            <motion.div 
              key={breathPhase}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-sm font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">
                {timerActive ? getPhaseText() : 'Relax'}
              </span>
              <span className="text-3xl font-bold text-zinc-900 dark:text-white tabular-nums">
                {timeLeft}
              </span>
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!timerActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center italic leading-relaxed px-4">
                "{message}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={timerActive ? () => { setTimerActive(false); setBreathPhase('ready'); } : startBreathing}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg relative z-10 ${
            timerActive 
              ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 shadow-none'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-emerald-500/30 hover:shadow-emerald-500/40'
          }`}
        >
          {timerActive ? 'Stop Session' : 'Start Breathing'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UrgeKiller;
