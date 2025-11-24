import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { resetStreak, setOnboardingComplete } from '../utils/storage';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep((prev) => prev + 1);
  
  const handleFinish = () => {
    // Initialize streak to today (reset) if they are just starting
    resetStreak();
    setOnboardingComplete();
    onComplete();
  };

  const steps = [
    {
      title: "Welcome to NoFap Tracker",
      content: "Your journey to self-improvement starts here. A private, minimal space to track your progress.",
      action: "Get Started",
      onAction: nextStep
    },
    {
      title: "How it Works",
      content: (
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <p>Track your daily streak and watch it grow.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p>Daily check-ins to record your mood.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <p>Urge Killer tools when you need them most.</p>
          </div>
        </div>
      ),
      action: "Next",
      onAction: nextStep
    },
    {
      title: "Ready to Begin?",
      content: "We've set your streak start date to today. You can always reset it if needed. Stay strong!",
      action: "Start My Journey",
      onAction: handleFinish
    }
  ];

  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-zinc-950 z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 text-center"
          >
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              {steps[step].title}
            </h1>
            
            <div className="text-zinc-600 dark:text-zinc-400 mb-10 text-lg leading-relaxed">
              {steps[step].content}
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step 
                      ? 'w-8 bg-blue-600 dark:bg-blue-500' 
                      : 'w-2 bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={steps[step].onAction}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-semibold text-lg shadow-lg shadow-zinc-500/20 transition-shadow hover:shadow-zinc-500/30"
            >
              {steps[step].action}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
