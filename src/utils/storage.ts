const STORAGE_KEYS = {
  START_DATE: 'nofap_start_date',
  CHECK_INS: 'nofap_check_ins',
  JOURNAL: 'nofap_journal',
  ONBOARDING_COMPLETE: 'nofap_onboarding_complete',
  RELAPSE_HISTORY: 'nofap_relapse_history',
  ACHIEVEMENTS: 'nofap_achievements',
};

export const getOnboardingStatus = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
};

export const setOnboardingComplete = () => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
};

export const getStartDate = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.START_DATE);
};

export const getStreak = (): number => {
  const startDate = getStartDate();
  if (!startDate) return 0;

  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays < 0 ? 0 : diffDays; 
};

export const getRelapseHistory = (): string[] => {
  const history = localStorage.getItem(STORAGE_KEYS.RELAPSE_HISTORY);
  return history ? JSON.parse(history) : [];
};

export const resetStreak = () => {
  const currentStartDate = localStorage.getItem(STORAGE_KEYS.START_DATE);
  if (currentStartDate) {
    const history = getRelapseHistory();
    // We record the date the streak ended (today)
    history.push(new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.RELAPSE_HISTORY, JSON.stringify(history));
  }
  localStorage.setItem(STORAGE_KEYS.START_DATE, new Date().toISOString());
};

// Stats Helpers
export const getLongestStreak = (): number => {
  const history = getRelapseHistory();
  const startDate = localStorage.getItem(STORAGE_KEYS.START_DATE);
  if (!history.length && !startDate) return 0;

  let dates = [...history];
  if (startDate) dates.unshift(startDate); // The very first start? No, history stores RESET dates.
  
  // This is a simplified approximation. For perfect accuracy we'd need pairs of [start, end].
  // But for now, let's assume longest streak is max(currentStreak, maxDiffBetweenRelapses).
  
  let maxDays = getStreak();
  
  // Sort history to be sure
  const sortedHistory = history.map(d => new Date(d).getTime()).sort((a, b) => a - b);
  
  for (let i = 1; i < sortedHistory.length; i++) {
    const diff = sortedHistory[i] - sortedHistory[i - 1];
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > maxDays) maxDays = days;
  }

  return maxDays;
};

export interface CheckIn {
  date: string;
  mood: 'happy' | 'neutral' | 'sad';
}

export const saveCheckIn = (mood: CheckIn['mood']) => {
  const checkInsStr = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  const checkIns: CheckIn[] = checkInsStr ? JSON.parse(checkInsStr) : [];
  
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = checkIns.findIndex(c => c.date === today);
  
  const newCheckIn = { date: today, mood };

  if (existingIndex >= 0) {
    checkIns[existingIndex] = newCheckIn;
  } else {
    checkIns.push(newCheckIn);
  }

  localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));
};

export const getCheckInHistory = (): CheckIn[] => {
  const checkInsStr = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  return checkInsStr ? JSON.parse(checkInsStr) : [];
};

export const getTodayMood = (): CheckIn['mood'] | null => {
  const checkInsStr = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  if (!checkInsStr) return null;
  
  const checkIns: CheckIn[] = JSON.parse(checkInsStr);
  const today = new Date().toISOString().split('T')[0];
  return checkIns.find(c => c.date === today)?.mood || null;
};

export interface JournalEntry {
  date: string;
  text: string;
}

export const saveJournalEntry = (text: string) => {
  const journalStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  const journal: JournalEntry[] = journalStr ? JSON.parse(journalStr) : [];
  
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = journal.findIndex(j => j.date === today);
  
  const newEntry = { date: today, text };

  if (existingIndex >= 0) {
    journal[existingIndex] = newEntry;
  } else {
    journal.push(newEntry);
  }

  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journal));
};

export const getJournalHistory = (): JournalEntry[] => {
  const journalStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  return journalStr ? JSON.parse(journalStr) : [];
};

export const getTodayJournal = (): string => {
  const journalStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  if (!journalStr) return '';
  
  const journal: JournalEntry[] = JSON.parse(journalStr);
  const today = new Date().toISOString().split('T')[0];
  return journal.find(j => j.date === today)?.text || '';
};

// Achievements
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  daysRequired: number;
  unlockedAt?: string;
}

export const BADGES: Omit<Achievement, 'unlockedAt'>[] = [
  { id: '3_days', title: '3-Day Warrior', description: 'Survived the first 3 days.', icon: '🥚', daysRequired: 3 },
  { id: '7_days', title: 'One Week Strong', description: 'First week completed!', icon: '🐣', daysRequired: 7 },
  { id: '14_days', title: 'Fortnight Fighter', description: 'Two weeks of discipline.', icon: '🐥', daysRequired: 14 },
  { id: '30_days', title: '30-Day Master', description: 'One month of freedom.', icon: '🦅', daysRequired: 30 },
  { id: '90_days', title: '90-Day Legend', description: 'The ultimate reboot.', icon: '👑', daysRequired: 90 },
];

export const getAchievements = (): Achievement[] => {
  const unlockedStr = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  const unlocked: { id: string; date: string }[] = unlockedStr ? JSON.parse(unlockedStr) : [];
  
  return BADGES.map(badge => {
    const unlockData = unlocked.find(u => u.id === badge.id);
    return {
      ...badge,
      unlockedAt: unlockData ? unlockData.date : undefined
    };
  });
};

export const checkAchievements = (currentStreak: number) => {
  const unlockedStr = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  const unlocked: { id: string; date: string }[] = unlockedStr ? JSON.parse(unlockedStr) : [];
  
  let hasNewUnlock = false;

  BADGES.forEach(badge => {
    if (currentStreak >= badge.daysRequired && !unlocked.find(u => u.id === badge.id)) {
      unlocked.push({ id: badge.id, date: new Date().toISOString() });
      hasNewUnlock = true;
    }
  });

  if (hasNewUnlock) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
  }
  
  return hasNewUnlock;
};
