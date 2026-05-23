import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getStreak, resetStreak, checkAchievements, getStartDate } from '../utils/storage';

const ACCENT    = '#00ff9d';
const RING_R    = 88;
const RING_CIRC = 2 * Math.PI * RING_R;
const CAP       = 30;

const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "Every day you resist is a day you own yourself.",
  "Strength is built in silence, one day at a time.",
  "The man who masters himself is free.",
  "Small daily improvements lead to stunning long-term results.",
];

const StreakCounter: React.FC = () => {
  const [streak, setStreak]         = useState(0);
  const [showUnlock, setShowUnlock] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState('00:00:00');
  const [quote]                     = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const prevStreak                  = useRef(0);
  const numberRef                   = useRef<HTMLSpanElement>(null);

  const ringOffset = RING_CIRC * (1 - Math.min(streak / CAP, 1));
  const pct        = Math.round((Math.min(streak, CAP) / CAP) * 100);

  useEffect(() => {
    const current = getStreak();
    setStreak(current);
    prevStreak.current = current;

    if (checkAchievements(current)) {
      setShowUnlock(true);
      setTimeout(() => setShowUnlock(false), 3500);
    }

    const startDateStr = getStartDate();
    const startTime    = startDateStr ? new Date(startDateStr).getTime() : Date.now();

    const tick = () => {
      const diff    = Date.now() - startTime;
      const h       = Math.floor(diff / 3_600_000);
      const m       = Math.floor((diff % 3_600_000) / 60_000);
      const s       = Math.floor((diff % 60_000) / 1_000);
      setTimeElapsed(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const iv = setInterval(tick, 1_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;
    el.animate(
      [{ transform: 'scale(1.15)', opacity: 0.7 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 300, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
    );
  }, [streak]);

  const handleReset = () => {
    if (window.confirm('Log a relapse and reset your streak to zero?')) {
      resetStreak();
      setStreak(0);
    }
  };

  // Milestone label
  const milestoneLabel = (() => {
    if (streak >= 90) return '90-day legend';
    if (streak >= 30) return '30-day master';
    if (streak >= 14) return 'fortnight fighter';
    if (streak >= 7)  return 'one week strong';
    if (streak >= 3)  return '3-day warrior';
    return 'keep going';
  })();

  return (
    <div className="flex flex-col items-center w-full select-none px-6 pt-4 pb-6">

      {/* Achievement toast */}
      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-semibold"
            style={{
              background: 'rgba(0,255,157,0.1)',
              border: `1px solid rgba(0,255,157,0.3)`,
              color: ACCENT,
              backdropFilter: 'blur(12px)',
              letterSpacing: '0.01em',
            }}
          >
            <span style={{ fontSize: 16 }}>🏆</span>
            Achievement unlocked
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ring + counter ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative flex items-center justify-center mt-4"
        style={{ width: 230, height: 230 }}
      >
        {/* Glow behind ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(0,255,157,${streak > 0 ? 0.07 : 0.02}) 0%, transparent 70%)`,
          }}
        />

        {/* SVG ring */}
        <svg
          width="230" height="230" viewBox="0 0 230 230"
          className="absolute inset-0"
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle cx="115" cy="115" r={RING_R} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          {/* Tick marks at 25%, 50%, 75% */}
          {[0.25, 0.5, 0.75].map((t, i) => {
            const angle = t * 2 * Math.PI - Math.PI / 2;
            const inner = RING_R - 7;
            const outer = RING_R + 3;
            return (
              <line
                key={i}
                x1={115 + inner * Math.cos(angle)}
                y1={115 + inner * Math.sin(angle)}
                x2={115 + outer * Math.cos(angle)}
                y2={115 + outer * Math.sin(angle)}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
          {/* Progress arc */}
          <circle cx="115" cy="115" r={RING_R} fill="none"
            stroke={ACCENT} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={ringOffset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
          />
        </svg>

        {/* Inner card */}
        <div
          className="relative flex flex-col items-center justify-center rounded-full"
          style={{
            width: 174, height: 174,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            streak
          </span>

          <span ref={numberRef}
            className="font-black tabular-nums leading-none"
            style={{ fontSize: 68, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>
            {streak}
          </span>

          <span className="text-xs font-medium mt-0.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            {streak === 1 ? 'day' : 'days'}
          </span>

          {/* Pct ring label */}
          {streak > 0 && (
            <span className="text-[9px] font-semibold mt-2 tracking-widest"
              style={{ color: `${ACCENT}99` }}>
              {pct}% TO 30-DAY
            </span>
          )}
        </div>
      </motion.div>

      {/* Milestone badge */}
      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
          style={{
            background: `rgba(0,255,157,0.08)`,
            border: `1px solid rgba(0,255,157,0.2)`,
            color: ACCENT,
          }}
        >
          {milestoneLabel}
        </motion.div>
      )}

      {/* Live timer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-5 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Live dot */}
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-50"
            style={{ background: ACCENT }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: ACCENT }} />
        </span>
        <span className="font-mono font-semibold tracking-widest tabular-nums text-sm"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          {timeElapsed}
        </span>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-5 w-full grid grid-cols-3 gap-2"
      >
        {[
          { label: 'Target', value: '30d' },
          { label: 'Progress', value: `${pct}%` },
          { label: 'Status', value: streak > 0 ? 'Active' : 'Start' },
        ].map((item) => (
          <div key={item.label}
            className="flex flex-col items-center py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {item.value}
            </span>
            <span className="text-[10px] font-medium mt-0.5 uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center leading-relaxed max-w-[270px] italic"
        style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}
      >
        "{quote}"
      </motion.p>

      {/* Reset */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        className="mt-7 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
        style={{ color: 'rgba(248,113,113,0.55)', border: '1px solid transparent' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.9)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.2)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.55)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
        aria-label="Log relapse and reset streak"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Log relapse
      </motion.button>
    </div>
  );
};

export default StreakCounter;