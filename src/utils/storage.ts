// src/utils/storage.ts

const STORAGE_KEYS = {
  START_DATE: 'nofap_start_date',
  CHECK_INS: 'nofap_check_ins',
  JOURNAL: 'nofap_journal',
  ONBOARDING_COMPLETE: 'nofap_onboarding_complete',
  RELAPSE_HISTORY: 'nofap_relapse_history',
  ACHIEVEMENTS: 'nofap_achievements',
};

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One completed streak session.
 * startedAt  – ISO timestamp when the streak began (copied from nofap_start_date at reset time)
 * endedAt    – ISO timestamp when the user hit "reset" (i.e. relapse moment)
 */
export interface StreakSession {
  startedAt: string;
  endedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Migration  (call once at app boot, before any other storage read)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts the old relapse_history format (plain ISO string[]) to StreakSession[].
 *
 * OLD format: each entry was new Date().toISOString() pushed at reset time.
 *   → We had no record of when each streak *started*, only when it *ended*.
 *   → We approximate startedAt = previous endedAt (or the start_date for the
 *     very first session), accepting that old longest-streak data is still
 *     approximate but at least the array shape is correct going forward.
 *
 * NEW format: { startedAt, endedAt }
 */
export const migrateRelapseHistory = (): void => {
  const raw = localStorage.getItem(STORAGE_KEYS.RELAPSE_HISTORY);
  if (!raw) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Corrupt data — reset so nothing breaks downstream
    localStorage.removeItem(STORAGE_KEYS.RELAPSE_HISTORY);
    return;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return;

  // Already migrated if first element is an object with startedAt
  if (typeof parsed[0] === 'object' && parsed[0] !== null && 'startedAt' in parsed[0]) return;

  // Old format: array of ISO strings
  const oldDates = (parsed as string[])
    .map(s => new Date(s).getTime())
    .sort((a, b) => a - b);

  const startDate = localStorage.getItem(STORAGE_KEYS.START_DATE);

  const sessions: StreakSession[] = oldDates.map((endedAt, i) => {
    // Best approximation of startedAt:
    //   – for first relapse: use the very first nofap_start_date if available
    //   – for subsequent relapses: use the previous endedAt
    let startedAt: number;
    if (i === 0) {
      // Try to recover the original start date.  If nofap_start_date predates
      // the first reset it's a real first-run date; otherwise fall back to 0.
      const startTs = startDate ? new Date(startDate).getTime() : 0;
      startedAt = startTs < endedAt ? startTs : endedAt;
    } else {
      startedAt = oldDates[i - 1];
    }
    return {
      startedAt: new Date(startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
    };
  });

  localStorage.setItem(STORAGE_KEYS.RELAPSE_HISTORY, JSON.stringify(sessions));
};

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────────────────────────────────────

export const getOnboardingStatus = (): boolean =>
  localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';

export const setOnboardingComplete = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
};

// ─────────────────────────────────────────────────────────────────────────────
// Streak
// ─────────────────────────────────────────────────────────────────────────────

export const getStartDate = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.START_DATE);

/**
 * Current streak in whole days elapsed since nofap_start_date.
 * Uses Math.floor so day 0 = "started today, less than 24 h ago".
 */
export const getStreak = (): number => {
  const startDate = getStartDate();
  if (!startDate) return 0;
  const diffMs = Date.now() - new Date(startDate).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
};

// ─────────────────────────────────────────────────────────────────────────────
// Relapse history  (now typed as StreakSession[])
// ─────────────────────────────────────────────────────────────────────────────

export const getRelapseHistory = (): StreakSession[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.RELAPSE_HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StreakSession[];
  } catch {
    return [];
  }
};

/**
 * Records the current streak as a completed session, then resets the start date.
 *
 * Before fix: pushed new Date().toISOString() → gap between two entries was
 *   ~0 ms because start_date was also overwritten at the same instant.
 * After fix:  saves { startedAt: <old start_date>, endedAt: <now> } so the
 *   full duration of the streak is preserved and getLongestStreak() works
 *   correctly even after a single relapse.
 */
export const resetStreak = (): void => {
  const currentStartDate = localStorage.getItem(STORAGE_KEYS.START_DATE);
  if (currentStartDate) {
    const sessions = getRelapseHistory();
    sessions.push({
      startedAt: currentStartDate,          // when this streak began
      endedAt: new Date().toISOString(),    // right now = relapse moment
    });
    localStorage.setItem(STORAGE_KEYS.RELAPSE_HISTORY, JSON.stringify(sessions));
  }
  localStorage.setItem(STORAGE_KEYS.START_DATE, new Date().toISOString());
};

// ─────────────────────────────────────────────────────────────────────────────
// Stats helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the longest streak ever, in days.
 *
 * Checks all completed sessions AND the live current streak so the value is
 * always up to date even if the user has never relapsed.
 */
export const getLongestStreak = (): number => {
  const sessions = getRelapseHistory();
  let max = getStreak(); // current live streak is a candidate

  for (const session of sessions) {
    const diffMs = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days > max) max = days;
  }

  return max;
};

// ─────────────────────────────────────────────────────────────────────────────
// Check-ins
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckIn {
  date: string; // YYYY-MM-DD local date
  mood: 'happy' | 'neutral' | 'sad';
}

const todayKey = (): string => new Date().toISOString().split('T')[0];

export const saveCheckIn = (mood: CheckIn['mood']): void => {
  const raw = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  const checkIns: CheckIn[] = raw ? JSON.parse(raw) : [];
  const today = todayKey();
  const idx = checkIns.findIndex(c => c.date === today);
  const entry = { date: today, mood };
  if (idx >= 0) checkIns[idx] = entry;
  else checkIns.push(entry);
  localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));
};

export const getCheckInHistory = (): CheckIn[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  return raw ? JSON.parse(raw) : [];
};

export const getTodayMood = (): CheckIn['mood'] | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  if (!raw) return null;
  const checkIns: CheckIn[] = JSON.parse(raw);
  return checkIns.find(c => c.date === todayKey())?.mood ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Journal
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalEntry {
  date: string; // YYYY-MM-DD local date
  text: string;
}

export const saveJournalEntry = (text: string): void => {
  const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  const journal: JournalEntry[] = raw ? JSON.parse(raw) : [];
  const today = todayKey();
  const idx = journal.findIndex(j => j.date === today);
  const entry = { date: today, text };
  if (idx >= 0) journal[idx] = entry;
  else journal.push(entry);
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journal));
};

export const getJournalHistory = (): JournalEntry[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  return raw ? JSON.parse(raw) : [];
};

export const getTodayJournal = (): string => {
  const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  if (!raw) return '';
  const journal: JournalEntry[] = JSON.parse(raw);
  return journal.find(j => j.date === todayKey())?.text ?? '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Achievements
// ─────────────────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  daysRequired: number;
  unlockedAt?: string;
}

export const BADGES: Omit<Achievement, 'unlockedAt'>[] = [
  { id: '3_days',  title: '3-Day Warrior',    description: 'Survived the first 3 days.',   icon: '🥚', daysRequired: 3  },
  { id: '7_days',  title: 'One Week Strong',   description: 'First week completed!',         icon: '🐣', daysRequired: 7  },
  { id: '14_days', title: 'Fortnight Fighter', description: 'Two weeks of discipline.',      icon: '🐥', daysRequired: 14 },
  { id: '30_days', title: '30-Day Master',     description: 'One month of freedom.',         icon: '🦅', daysRequired: 30 },
  { id: '90_days', title: '90-Day Legend',     description: 'The ultimate reboot.',          icon: '👑', daysRequired: 90 },
];

export const getAchievements = (): Achievement[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  const unlocked: { id: string; date: string }[] = raw ? JSON.parse(raw) : [];
  return BADGES.map(badge => ({
    ...badge,
    unlockedAt: unlocked.find(u => u.id === badge.id)?.date,
  }));
};

export const checkAchievements = (currentStreak: number): boolean => {
  const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  const unlocked: { id: string; date: string }[] = raw ? JSON.parse(raw) : [];
  let hasNewUnlock = false;

  for (const badge of BADGES) {
    if (currentStreak >= badge.daysRequired && !unlocked.find(u => u.id === badge.id)) {
      unlocked.push({ id: badge.id, date: new Date().toISOString() });
      hasNewUnlock = true;
    }
  }

  if (hasNewUnlock) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
  }

  return hasNewUnlock;
};