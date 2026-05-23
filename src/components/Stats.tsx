import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  getStreak,
  getLongestStreak,
  getRelapseHistory,
  getStartDate,
  getCheckInHistory,
  type StreakSession,
} from '../utils/storage';
import Achievements from './Achievements';

const ACCENT = '#00ff9d';
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ─── helpers ────────────────────────────────────────────────────────────────

const msPerDay = 1000 * 60 * 60 * 24;
const floorDays = (ms: number) => Math.max(0, Math.floor(ms / msPerDay));

/** Local YYYY-M-D key for set membership */
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// ─── types ───────────────────────────────────────────────────────────────────

interface WeekBar { day: string; shortDay: string; value: number; isToday: boolean }
interface MonthBar { label: string; year: number; cleanDays: number; totalDays: number; isCurrent: boolean }
interface InsightCard { emoji: string; label: string; value: string; sub?: string; accent?: boolean }

// ─── component ───────────────────────────────────────────────────────────────

const Stats: React.FC = () => {
  const [currentStreak,  setCurrentStreak]  = useState(0);
  const [longestStreak,  setLongestStreak]  = useState(0);
  const [relapses,       setRelapses]       = useState(0);
  const [weekBars,       setWeekBars]       = useState<WeekBar[]>([]);
  const [monthBars,      setMonthBars]      = useState<MonthBar[]>([]);
  const [insights,       setInsights]       = useState<InsightCard[]>([]);
  const [summaryLine,    setSummaryLine]    = useState('');
  const [cleanRate,      setCleanRate]      = useState(0);
  const [startDateStr,   setStartDateStr]   = useState<string | null>(null);

  useEffect(() => {
    const current   = getStreak();
    const longest   = getLongestStreak();
    const sessions  = getRelapseHistory() as StreakSession[];
    const startDate = getStartDate();
    const checkIns  = getCheckInHistory();

    setCurrentStreak(current);
    setLongestStreak(longest);
    setRelapses(sessions.length);
    setStartDateStr(startDate);

    const now      = new Date();
    const todayIdx = now.getDay();

    // ── Weekly bars ──────────────────────────────────────────────────────────
    const startPoints = sessions
      .map(s => new Date(s.startedAt).getTime())
      .sort((a, b) => a - b);
    if (startDate) startPoints.push(new Date(startDate).getTime());
    startPoints.sort((a, b) => a - b);

    const sunday = new Date(now);
    sunday.setDate(now.getDate() - todayIdx);
    sunday.setHours(0, 0, 0, 0);
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);

    const bars: WeekBar[] = DAY_LABELS.map((day, i) => {
      const dayStart = new Date(sunday); dayStart.setDate(sunday.getDate() + i);
      const dayEnd   = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999);

      if (dayStart > startOfToday) return { day, shortDay: DAY_SHORT[i], value: 0, isToday: false };
      if (startPoints.length === 0) return { day, shortDay: DAY_SHORT[i], value: 0, isToday: i === todayIdx };

      const checkTs = dayEnd.getTime();
      let latestStart = -1;
      for (let r = startPoints.length - 1; r >= 0; r--) {
        if (startPoints[r] <= checkTs) { latestStart = startPoints[r]; break; }
      }
      if (latestStart === -1) return { day, shortDay: DAY_SHORT[i], value: 0, isToday: i === todayIdx };

      const matched = sessions.find(s => new Date(s.startedAt).getTime() === latestStart);
      const effectiveEnd = matched
        ? Math.min(new Date(matched.endedAt).getTime(), checkTs)
        : checkTs;

      const val = i === todayIdx ? current : floorDays(effectiveEnd - latestStart);
      return { day, shortDay: DAY_SHORT[i], value: val, isToday: i === todayIdx };
    });
    setWeekBars(bars);

    // ── Monthly bars ─────────────────────────────────────────────────────────
    const allTimes = sessions.flatMap(s => [
      new Date(s.startedAt).getTime(),
      new Date(s.endedAt).getTime(),
    ]);
    if (startDate) allTimes.push(new Date(startDate).getTime());
    if (allTimes.length === 0) allTimes.push(Date.now());

    const earliest    = new Date(Math.min(...allTimes));
    const relapseDays = new Set(sessions.map(s => dayKey(new Date(s.endedAt))));

    const iterM = new Date(earliest); iterM.setDate(1);
    const months: MonthBar[] = [];

    while (iterM <= now) {
      const year = iterM.getFullYear(), month = iterM.getMonth();
      const mStart = new Date(year, month, 1);
      const mEnd   = new Date(year, month + 1, 0);
      const aStart = mStart < earliest ? earliest : mStart;
      const aEnd   = mEnd > now ? now : mEnd;

      const cursor = new Date(aStart); cursor.setHours(0, 0, 0, 0);
      const endDay = new Date(aEnd);   endDay.setHours(0, 0, 0, 0);
      let clean = 0;
      if (cursor <= endDay) {
        const c = new Date(cursor);
        while (c <= endDay) {
          if (!relapseDays.has(dayKey(c))) clean++;
          c.setDate(c.getDate() + 1);
        }
      }
      months.push({
        label:     mStart.toLocaleString('default', { month: 'short' }),
        year,
        cleanDays: clean,
        totalDays: mEnd.getDate(),
        isCurrent: month === now.getMonth() && year === now.getFullYear(),
      });
      iterM.setMonth(iterM.getMonth() + 1);
    }
    setMonthBars(months);

    // ── Clean rate (all-time) ─────────────────────────────────────────────────
    const trackingStart = startDate
      ? Math.min(new Date(startDate).getTime(), ...(sessions.map(s => new Date(s.startedAt).getTime())))
      : Date.now();
    const totalTrackedDays  = Math.max(1, floorDays(Date.now() - trackingStart) + 1);
    const totalRelapseDays  = relapseDays.size;
    const rate = Math.round(((totalTrackedDays - totalRelapseDays) / totalTrackedDays) * 100);
    setCleanRate(rate);

    // ── Insight cards ─────────────────────────────────────────────────────────
    const cards: InsightCard[] = [];

    if (sessions.length > 0) {
      const avgDays = Math.round(
        sessions.reduce((sum, s) =>
          sum + floorDays(new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()), 0)
        / sessions.length
      );
      cards.push({
        emoji: '📈',
        label: 'Avg streak length',
        value: `${avgDays}d`,
        sub: `across ${sessions.length} attempt${sessions.length > 1 ? 's' : ''}`,
      });
    }

    if (checkIns.length > 0) {
      const moodByDay: Record<number, { happy: number; total: number }> = {};
      checkIns.forEach(ci => {
        const d = new Date(ci.date).getDay();
        if (!moodByDay[d]) moodByDay[d] = { happy: 0, total: 0 };
        moodByDay[d].total++;
        if (ci.mood === 'happy') moodByDay[d].happy++;
      });
      let bestDay = -1, bestRate = -1;
      Object.entries(moodByDay).forEach(([d, { happy, total }]) => {
        const r = happy / total;
        if (r > bestRate && total >= 2) { bestRate = r; bestDay = Number(d); }
      });
      if (bestDay >= 0) {
        cards.push({
          emoji: '😊',
          label: 'Best mood day',
          value: DAY_LABELS[bestDay],
          sub: `${Math.round(bestRate * 100)}% happy check-ins`,
        });
      }
    }

    if (sessions.length >= 2) {
      const last = sessions[sessions.length - 1];
      const prev = sessions[sessions.length - 2];
      const lastLen = floorDays(new Date(last.endedAt).getTime() - new Date(last.startedAt).getTime());
      const prevLen = floorDays(new Date(prev.endedAt).getTime() - new Date(prev.startedAt).getTime());
      const trend = lastLen > prevLen;
      cards.push({
        emoji: trend ? '🔺' : '🔻',
        label: 'Streak trend',
        value: trend ? 'Improving' : 'Declining',
        sub: `${lastLen}d vs ${prevLen}d last time`,
        accent: trend,
      });
    }

    if (current >= 7) {
      cards.push({
        emoji: '🔥',
        label: 'Momentum',
        value: current >= longest ? 'Personal best' : `${longest - current}d to PB`,
        sub: current >= longest ? `New record: ${current} days` : `Best was ${longest} days`,
        accent: current >= longest,
      });
    }

    setInsights(cards);

    // ── Summary sentence ──────────────────────────────────────────────────────
    let summary = '';
    if (current === 0 && sessions.length === 0) {
      summary = "Your journey starts the moment you decide to begin.";
    } else if (current === 0) {
      summary = `You've reset ${sessions.length} time${sessions.length > 1 ? 's' : ''}. Every reset is data, not failure — keep going.`;
    } else if (current >= longest && current >= 7) {
      summary = `You're at a personal best right now. ${rate}% of all tracked days have been clean.`;
    } else if (rate >= 80) {
      summary = `${rate}% clean rate — strong consistency. Your best streak was ${longest} days.`;
    } else {
      summary = `${current} days in. ${rate}% clean overall. Your best was ${longest} days — you can beat it.`;
    }
    setSummaryLine(summary);

  }, []);

  const maxWeek = Math.max(...weekBars.map(b => b.value), 1);

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-16 px-4 pt-2">

      {/* ── Summary header ─────────────────────────────────────────────── */}
      {summaryLine && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5"
          style={{ background: 'rgba(0,255,157,0.06)', border: '1px solid rgba(0,255,157,0.15)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: `${ACCENT}99` }}>
            Your Summary
          </p>
          <p className="text-sm leading-relaxed font-medium"
            style={{ color: 'rgba(255,255,255,0.75)' }}>
            {summaryLine}
          </p>
        </motion.div>
      )}

      {/* ── Top stat row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Current', value: `${currentStreak}`, unit: 'd' },
          { label: 'Best',    value: `${longestStreak}`, unit: 'd' },
          { label: 'Relapses', value: `${relapses}`,    unit: '' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-3xl p-4 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              {item.label}
            </span>
            <span className="text-3xl font-black leading-none"
              style={{ color: 'rgba(255,255,255,0.92)' }}>
              {item.value}
              {item.unit && (
                <span className="text-base font-semibold ml-0.5"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {item.unit}
                </span>
              )}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Clean rate bar ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl p-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            All-time clean rate
          </span>
          <span className="text-xl font-black"
            style={{ color: cleanRate >= 70 ? ACCENT : 'rgba(255,255,255,0.85)' }}>
            {cleanRate}
            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>%</span>
          </span>
        </div>
        <div className="w-full rounded-full overflow-hidden"
          style={{ height: 6, background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cleanRate}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            className="h-full rounded-full"
            style={{
              background: cleanRate >= 70
                ? `linear-gradient(90deg, ${ACCENT}88, ${ACCENT})`
                : 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.5))',
              boxShadow: cleanRate >= 70 ? `0 0 8px ${ACCENT}66` : 'none',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>0%</span>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>100%</span>
        </div>
      </motion.div>

      {/* ── This week ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            This week
          </span>
          <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
            days clean
          </span>
        </div>
        <div className="flex items-end gap-1.5" style={{ height: 72 }}>
          {weekBars.map((bar, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-2">
              <div className="relative w-full flex items-end justify-center" style={{ height: 56 }}>
                {/* Track */}
                <div className="absolute bottom-0 w-full rounded-lg"
                  style={{ height: '100%', background: 'rgba(255,255,255,0.04)' }} />
                {/* Fill */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: maxWeek > 0
                      ? `${Math.max((bar.value / maxWeek) * 100, bar.value > 0 ? 12 : 0)}%`
                      : '0%'
                  }}
                  transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.06 }}
                  className="absolute bottom-0 w-full rounded-lg"
                  style={{
                    background: bar.isToday
                      ? `linear-gradient(to top, ${ACCENT}, ${ACCENT}88)`
                      : bar.value > 0
                      ? 'rgba(255,255,255,0.15)'
                      : 'transparent',
                    boxShadow: bar.isToday && bar.value > 0 ? `0 0 10px ${ACCENT}44` : 'none',
                  }}
                />
                {bar.value > 0 && (
                  <span className="absolute bottom-1 text-[9px] font-bold z-10"
                    style={{ color: bar.isToday ? '#000' : 'rgba(255,255,255,0.5)' }}>
                    {bar.value}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold"
                style={{ color: bar.isToday ? ACCENT : 'rgba(255,255,255,0.25)' }}>
                {bar.shortDay}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Insight cards ──────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Insights
          </p>
          <div className="grid grid-cols-2 gap-3">
            {insights.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-3xl p-4 flex flex-col gap-1"
                style={{
                  background: card.accent ? 'rgba(0,255,157,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${card.accent ? 'rgba(0,255,157,0.18)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <span style={{ fontSize: 20 }}>{card.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1"
                  style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {card.label}
                </span>
                <span className="text-lg font-black leading-tight"
                  style={{ color: card.accent ? ACCENT : 'rgba(255,255,255,0.88)' }}>
                  {card.value}
                </span>
                {card.sub && (
                  <span className="text-[10px] leading-tight"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {card.sub}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Monthly history ────────────────────────────────────────────── */}
      {monthBars.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Monthly history
            </span>
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>
              clean days / month
            </span>
          </div>
          <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {monthBars.map((bar, i) => {
              const pctH = bar.totalDays > 0 ? (bar.cleanDays / bar.totalDays) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-shrink-0 gap-2 group"
                  style={{ minWidth: 36 }}>
                  <div className="relative rounded-xl overflow-hidden"
                    style={{ height: 80, width: 36, background: 'rgba(255,255,255,0.04)' }}>
                    <div className="absolute inset-0 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pctH}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.4 + i * 0.05 }}
                        className="w-full"
                        style={{
                          background: bar.isCurrent
                            ? `linear-gradient(to top, ${ACCENT}, ${ACCENT}77)`
                            : 'rgba(255,255,255,0.18)',
                          boxShadow: bar.isCurrent ? `0 0 8px ${ACCENT}44` : 'none',
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <span className="text-[10px] font-bold"
                        style={{ color: bar.isCurrent ? ACCENT : '#fff' }}>
                        {bar.cleanDays}d
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase"
                    style={{ color: bar.isCurrent ? ACCENT : 'rgba(255,255,255,0.25)' }}>
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Journey start ──────────────────────────────────────────────── */}
      {startDateStr && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between rounded-2xl px-5 py-3.5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Journey started
          </span>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {new Date(startDateStr).toLocaleDateString('default', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </motion.div>
      )}

      {/* ── Achievements ───────────────────────────────────────────────── */}
      <div className="pt-1">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1"
          style={{ color: 'rgba(255,255,255,0.25)' }}>
          Achievements
        </p>
        <Achievements />
      </div>
    </div>
  );
};

export default Stats;