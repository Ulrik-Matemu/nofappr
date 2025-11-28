import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getStreak, getLongestStreak, getRelapseHistory, getStartDate } from '../utils/storage';
import Achievements from './Achievements';

const Stats: React.FC = () => {
  const [, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [relapses, setRelapses] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>(Array(7).fill(0));
  const [monthlyData, setMonthlyData] = useState<{ label: string; cleanDays: number; totalDays: number; isCurrent: boolean }[]>([]);

  useEffect(() => {
    setCurrentStreak(getStreak());
    setLongestStreak(getLongestStreak());
    setRelapses(getRelapseHistory().length);

    // Calculate weekly data
    const calculateWeeklyData = () => {
      const history = getRelapseHistory();
      const startDate = getStartDate();
      const currentStreakVal = getStreak();

      console.log('Stats Debug:', { history, startDate, currentStreakVal });

      const resetPoints = [...history];
      if (startDate) resetPoints.push(startDate);

      const resets = resetPoints
        .map(d => new Date(d).getTime())
        .sort((a, b) => a - b);

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - dayOfWeek);
      sunday.setHours(0, 0, 0, 0);

      const data = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(sunday);
        currentDay.setDate(sunday.getDate() + i);
        const endOfDay = new Date(currentDay);
        endOfDay.setHours(23, 59, 59, 999);

        // For future days
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        if (currentDay.getTime() > startOfToday.getTime()) {
          data.push(0);
          continue;
        }

        const checkTime = endOfDay.getTime();
        let latestReset = 0;

        if (resets.length === 0) {
          data.push(0);
          continue;
        }

        let found = false;
        for (let r = resets.length - 1; r >= 0; r--) {
          if (resets[r] <= checkTime) {
            latestReset = resets[r];
            found = true;
            break;
          }
        }

        if (!found) {
          data.push(0);
        } else {
          const diffTime = checkTime - latestReset;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          data.push(diffDays < 0 ? 0 : diffDays);
        }
      }

      // Fallback: Ensure today's value matches current streak if valid
      const todayIndex = new Date().getDay();
      if (data[todayIndex] === 0 && currentStreakVal > 0) {
        console.log('Correcting today data with current streak:', currentStreakVal);
        data[todayIndex] = currentStreakVal;
      }

      console.log('Calculated Weekly Data:', data);
      setWeeklyData(data);
    };

    // Calculate Monthly Data
    const calculateMonthlyData = () => {
      const history = getRelapseHistory();
      const startDate = getStartDate();
      
      let dates = history.map(d => new Date(d).getTime());
      if (startDate) dates.push(new Date(startDate).getTime());
      
      // If no data, at least show current month
      if (dates.length === 0) {
        dates.push(new Date().getTime());
      }
      
      const minTime = Math.min(...dates);
      const earliestDate = new Date(minTime);
      const now = new Date();
      
      let iter = new Date(earliestDate);
      iter.setDate(1); // Start of that month
      
      const months = [];
      
      while (iter <= now) {
        const year = iter.getFullYear();
        const month = iter.getMonth();
        
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        
        // Determine active window
        const activeStart = monthStart < earliestDate ? earliestDate : monthStart;
        const activeEnd = monthEnd > now ? now : monthEnd;
        
        const startDay = new Date(activeStart); startDay.setHours(0,0,0,0);
        const endDay = new Date(activeEnd); endDay.setHours(0,0,0,0);
        
        // Create relapse set
        const relapseDays = new Set(history.map(h => {
           const d = new Date(h);
           return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));
        
        let cleanCount = 0;
        const loopDay = new Date(startDay);
        
        // Prevent infinite loop if startDay > endDay (can happen if earliestDate > now slightly due to timezones)
        if (startDay <= endDay) {
          while (loopDay <= endDay) {
             const dayKey = `${loopDay.getFullYear()}-${loopDay.getMonth()}-${loopDay.getDate()}`;
             if (!relapseDays.has(dayKey)) {
                 cleanCount++;
             }
             loopDay.setDate(loopDay.getDate() + 1);
          }
        }
        
        const monthName = monthStart.toLocaleString('default', { month: 'short' });
        
        months.push({
            label: `${monthName}`,
            cleanDays: cleanCount,
            totalDays: monthEnd.getDate(),
            isCurrent: month === now.getMonth() && year === now.getFullYear()
        });
        
        iter.setMonth(iter.getMonth() + 1);
      }
      
      setMonthlyData(months);
    };

    calculateWeeklyData();
    calculateMonthlyData();
  }, []);

  const maxVal = Math.max(...weeklyData, 7);
  const currentDayIndex = new Date().getDay();

  return (
    <div className="w-full max-w-md mx-auto space-y-8 pb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Longest Streak</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{longestStreak} <span className="text-sm font-normal text-zinc-500">days</span></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Total Relapses</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{relapses}</p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">This Week's Progress</h3>
        <div className="flex items-end justify-between h-24 gap-2">
          {weeklyData.map((val, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group">
              <div className="relative w-full flex items-end justify-center h-full min-h-[100px]">
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: maxVal > 0 ? `${(val / maxVal) * 100}%` : '0%',
                    opacity: 1
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
                    delay: i * 0.08
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                  className={`w-full max-w-[28px] rounded-lg ${i === currentDayIndex
                      ? 'bg-gradient-to-t from-[#00ff9d] dark:from-[#00ff9d] dark:to-zinc-900 shadow-lg shadow-[#00ff9d]/30'
                      : val > 0
                        ? 'bg-gradient-to-t from-zinc-200 to-zinc-100 dark:from-zinc-700 dark:to-zinc-800 group-hover:from-emerald-300 group-hover:to-emerald-200 dark:group-hover:from-emerald-800 dark:group-hover:to-emerald-900'
                        : 'bg-zinc-100/50 dark:bg-zinc-800/30'
                    } transition-all duration-300`}
                  style={{
                    minHeight: val > 0 ? '40px' : '5px'
                  }}
                />
                {/* Value tooltip on hover */}
                {val > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                  >
                    {val}
                  </motion.div>
                )}
              </div>
              <span className={`text-[11px] font-semibold mt-3 uppercase transition-colors ${i === currentDayIndex
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-400 dark:group-hover:text-emerald-500'
                }`}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monthly Chart */}
      {monthlyData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Monthly History</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Month Bar shows how many clean days each month (height represents percentage of total days in that month). Current month is highlighted in emerald.</p>
          <div className="flex items-end gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 gap-2">
                <div className="relative h-32 w-10 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl overflow-hidden group">
                  <div className="absolute inset-0 flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.cleanDays / data.totalDays) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                      className={`w-full ${
                        data.isCurrent 
                          ? 'bg-emerald-500 dark:bg-emerald-500' 
                          : 'bg-zinc-300 dark:bg-zinc-700 group-hover:bg-emerald-300 dark:group-hover:bg-emerald-800'
                      } transition-colors`}
                    />
                  </div>
                  
                  {/* Tooltip overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                    <span className="text-xs font-bold text-white">{data.cleanDays}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-medium uppercase ${data.isCurrent ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {data.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements Section */}
      <Achievements />
    </div>
  );
};

export default Stats;
